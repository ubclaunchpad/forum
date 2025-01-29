"""post id uuid with local id
Revision ID: d4d3929801da
Revises: 990400c7ca82
Create Date: 2025-01-28 22:31:14.341886
"""
from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision: str = 'd4d3929801da'
down_revision: Union[str, None] = '990400c7ca82'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Create sequence management table
    op.execute("""
        CREATE TABLE public.post_sequences (
            course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
            last_value INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (course_id)
        )
    """)

    # Create function for next_post_local_id
    op.execute("""
        CREATE OR REPLACE FUNCTION public.next_post_local_id(course UUID)
        RETURNS INTEGER AS $$
        DECLARE
            next_val INTEGER;
        BEGIN
            INSERT INTO public.post_sequences (course_id, last_value)
            VALUES (course, 1)
            ON CONFLICT (course_id) DO UPDATE
            SET last_value = post_sequences.last_value + 1
            RETURNING last_value INTO next_val;
            
            RETURN next_val;
        END;
        $$ LANGUAGE plpgsql;
    """)

    # 1. First drop all existing foreign key constraints
    op.execute('ALTER TABLE public.post_edits DROP CONSTRAINT IF EXISTS post_edits_post_id_fkey CASCADE')
    op.execute('ALTER TABLE public.post_edits DROP CONSTRAINT IF EXISTS post_edits_post_id_fkey1 CASCADE')
    op.execute('ALTER TABLE public.post_edits DROP CONSTRAINT IF EXISTS post_edits_post_id_fkey2 CASCADE')
    op.execute('ALTER TABLE public.post_edits DROP CONSTRAINT IF EXISTS post_edits_post_id_fkey3 CASCADE')
    op.execute('ALTER TABLE public.post_edits DROP CONSTRAINT IF EXISTS post_edits_post_id_fkey4 CASCADE')
    
    op.execute('ALTER TABLE public.user_post_events DROP CONSTRAINT IF EXISTS user_post_events_post_id_fkey CASCADE')
    op.execute('ALTER TABLE public.user_post_events DROP CONSTRAINT IF EXISTS user_post_events_post_id_fkey1 CASCADE')
    op.execute('ALTER TABLE public.user_post_events DROP CONSTRAINT IF EXISTS user_post_events_post_id_fkey2 CASCADE')
    op.execute('ALTER TABLE public.user_post_events DROP CONSTRAINT IF EXISTS user_post_events_post_id_fkey3 CASCADE')
    op.execute('ALTER TABLE public.user_post_events DROP CONSTRAINT IF EXISTS user_post_events_post_id_fkey4 CASCADE')

    # 2. Add new columns to posts and related tables
    op.execute('ALTER TABLE public.posts ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid()')
    op.execute('ALTER TABLE public.posts ADD COLUMN local_id INTEGER')
    op.execute('ALTER TABLE public.post_edits ADD COLUMN new_post_id UUID')
    op.execute('ALTER TABLE public.user_post_events ADD COLUMN new_post_id UUID')

    # 3. Initialize sequences and local_ids
    op.execute("""
        INSERT INTO public.post_sequences (course_id, last_value)
        SELECT DISTINCT course_id, 0 FROM public.posts
    """)

    op.execute("""
        WITH numbered_posts AS (
            SELECT id, course_id, 
                   ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY id) as new_local_id
            FROM public.posts
        )
        UPDATE public.posts
        SET local_id = (
            SELECT next_post_local_id(posts.course_id)
        )
        FROM numbered_posts
        WHERE posts.id = numbered_posts.id
    """)

    # 4. Copy relationships using the original id to match
    op.execute("""
        UPDATE public.post_edits
        SET new_post_id = posts.uuid_id
        FROM public.posts
        WHERE post_edits.post_id = posts.id
    """)

    op.execute("""
        UPDATE public.user_post_events
        SET new_post_id = posts.uuid_id
        FROM public.posts
        WHERE user_post_events.post_id = posts.id
    """)

    # Update embeddings if exists
    op.execute("""
        UPDATE public.embeddings
        SET entity_id = posts.uuid_id
        FROM public.posts
        WHERE embeddings.entity_id::text = posts.id::text
        AND embeddings.entity_type = 'post'
    """)

    # 5. Make new columns NOT NULL
    op.execute('ALTER TABLE public.posts ALTER COLUMN uuid_id SET NOT NULL')
    op.execute('ALTER TABLE public.posts ALTER COLUMN local_id SET NOT NULL')
    op.execute('ALTER TABLE public.post_edits ALTER COLUMN new_post_id SET NOT NULL')
    op.execute('ALTER TABLE public.user_post_events ALTER COLUMN new_post_id SET NOT NULL')

    # 6. Drop old primary key constraint and old columns
    op.execute('ALTER TABLE public.posts DROP CONSTRAINT posts_pkey CASCADE')
    op.execute('ALTER TABLE public.posts DROP COLUMN id')
    op.execute('ALTER TABLE public.posts DROP COLUMN parent_id')
    op.execute('ALTER TABLE public.post_edits DROP COLUMN post_id')
    op.execute('ALTER TABLE public.user_post_events DROP COLUMN post_id')

    # 7. Rename columns
    op.execute('ALTER TABLE public.posts RENAME COLUMN uuid_id TO id')
    op.execute('ALTER TABLE public.post_edits RENAME COLUMN new_post_id TO post_id')
    op.execute('ALTER TABLE public.user_post_events RENAME COLUMN new_post_id TO post_id')

    # 8. Add new primary key and constraints
    op.execute('ALTER TABLE public.posts ADD PRIMARY KEY (id)')
    op.execute('ALTER TABLE public.posts ADD CONSTRAINT uq_course_local_id UNIQUE (course_id, local_id)')

    # 9. Add new foreign key constraints
    op.execute("""
        ALTER TABLE public.post_edits
        ADD CONSTRAINT post_edits_post_id_fkey 
        FOREIGN KEY (post_id) 
        REFERENCES public.posts(id) 
        ON DELETE CASCADE
    """)

    op.execute("""
        ALTER TABLE public.user_post_events
        ADD CONSTRAINT user_post_events_post_id_fkey 
        FOREIGN KEY (post_id) 
        REFERENCES public.posts(id) 
        ON DELETE CASCADE
    """)

    # 10. Create trigger for future inserts
    op.execute("""
        CREATE OR REPLACE FUNCTION public.set_post_local_id()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.local_id IS NULL THEN
                NEW.local_id := next_post_local_id(NEW.course_id);
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    op.execute("""
        CREATE TRIGGER tr_set_post_local_id
        BEFORE INSERT ON public.posts
        FOR EACH ROW
        EXECUTE FUNCTION public.set_post_local_id();
    """)

def downgrade() -> None:
    # Remove trigger and functions
    op.execute('DROP TRIGGER IF EXISTS tr_set_post_local_id ON public.posts')
    op.execute('DROP FUNCTION IF EXISTS public.set_post_local_id()')
    op.execute('DROP FUNCTION IF EXISTS public.next_post_local_id(UUID)')
    
    # Remove constraints first
    op.execute('ALTER TABLE public.post_edits DROP CONSTRAINT IF EXISTS post_edits_post_id_fkey')
    op.execute('ALTER TABLE public.user_post_events DROP CONSTRAINT IF EXISTS user_post_events_post_id_fkey')
    op.execute('ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS uq_course_local_id')
    
    # Remove sequence table
    op.execute('DROP TABLE IF EXISTS public.post_sequences')
    
    # Restore original structure
    op.execute('ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_pkey')
    op.execute('ALTER TABLE public.posts DROP COLUMN IF EXISTS local_id')
    op.execute('ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS parent_id INTEGER')