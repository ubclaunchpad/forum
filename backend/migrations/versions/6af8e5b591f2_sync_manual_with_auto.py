"""sync manual with auto

Revision ID: 6af8e5b591f2
Revises: 5f32c58bf0b3
Create Date: 2025-01-31 12:28:58.103269

"""
from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '6af8e5b591f2'
down_revision: Union[str, None] = '5f32c58bf0b3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create new enum type with all four values
    op.execute("CREATE TYPE public.post_status AS ENUM ('draft', 'published', 'archived', 'deleted')")
    
    # Drop old status column
    op.execute("ALTER TABLE public.posts DROP COLUMN status")
    
    # Add new status column with new type
    op.execute("ALTER TABLE public.posts ADD COLUMN status public.post_status")
    
    # Make course_id not nullable
    op.alter_column('posts', 'course_id',
               existing_type=sa.UUID(),
               nullable=False)
    
    # Drop old enum type if it exists
    op.execute("DROP TYPE IF EXISTS public.poststatus CASCADE")

def downgrade() -> None:
    # Create old enum type
    op.execute("CREATE TYPE public.poststatus AS ENUM ('active', 'deleted')")
    
    # Drop new status column
    op.execute("ALTER TABLE public.posts DROP COLUMN status")
    
    # Add old status column with old type
    op.execute("ALTER TABLE public.posts ADD COLUMN status public.poststatus")
    
    # Make course_id nullable again
    op.alter_column('posts', 'course_id',
               existing_type=sa.UUID(),
               nullable=True)
    
    # Drop new enum type
    op.execute("DROP TYPE IF EXISTS public.post_status CASCADE")