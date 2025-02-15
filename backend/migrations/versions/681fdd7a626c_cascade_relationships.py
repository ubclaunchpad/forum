"""cascade relationships
Revision ID: 681fdd7a626c
Revises: 04a34ee4d20e
Create Date: 2025-02-14 16:40:55.021748
"""

from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "681fdd7a626c"
down_revision: Union[str, None] = "04a34ee4d20e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Update user_roles cascade relationships
    op.execute("""
        ALTER TABLE user_roles 
        DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey,
        DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey,
        DROP CONSTRAINT IF EXISTS user_roles_domain_fkey,
        DROP CONSTRAINT IF EXISTS user_roles_subdomain_fkey;

        ALTER TABLE user_rolesuv
        ADD CONSTRAINT user_roles_user_id_fkey 
            FOREIGN KEY (user_id) 
            REFERENCES profiles(id) 
            ON DELETE CASCADE,
        ADD CONSTRAINT user_roles_role_id_fkey 
            FOREIGN KEY (role_id) 
            REFERENCES roles(id) 
            ON DELETE CASCADE,
        ADD CONSTRAINT user_roles_domain_fkey 
            FOREIGN KEY (domain) 
            REFERENCES courses(id) 
            ON DELETE CASCADE,
        ADD CONSTRAINT user_roles_subdomain_fkey 
            FOREIGN KEY (subdomain) 
            REFERENCES tags(id) 
            ON DELETE CASCADE
    """)

    # Update posts table for created_by
    op.execute("""
        ALTER TABLE posts
        DROP CONSTRAINT IF EXISTS posts_created_by_fkey,
        ALTER COLUMN created_by DROP NOT NULL,
        ADD CONSTRAINT posts_created_by_fkey 
            FOREIGN KEY (created_by) 
            REFERENCES profiles(id) 
            ON DELETE SET NULL
    """)

    # Update post_edits table for edited_by
    op.execute("""
        ALTER TABLE post_edits
        DROP CONSTRAINT IF EXISTS post_edits_edited_by_fkey,
        ALTER COLUMN edited_by DROP NOT NULL,
        ADD CONSTRAINT post_edits_edited_by_fkey 
            FOREIGN KEY (edited_by) 
            REFERENCES profiles(id) 
            ON DELETE SET NULL
    """)

    # Update user_post_events for user_id cascade
    op.execute("""
        ALTER TABLE user_post_events
        DROP CONSTRAINT IF EXISTS user_post_events_user_id_fkey,
        ADD CONSTRAINT user_post_events_user_id_fkey 
            FOREIGN KEY (user_id) 
            REFERENCES profiles(id) 
            ON DELETE CASCADE
    """)

    # Update documents table for created_by
    op.execute("""
        ALTER TABLE documents
        DROP CONSTRAINT IF EXISTS documents_created_by_fkey,
        ALTER COLUMN created_by DROP NOT NULL,
        ADD CONSTRAINT documents_created_by_fkey 
            FOREIGN KEY (created_by) 
            REFERENCES profiles(id) 
            ON DELETE SET NULL
    """)


def downgrade() -> None:
    # Revert documents changes
    op.execute("""
        ALTER TABLE documents
        DROP CONSTRAINT IF EXISTS documents_created_by_fkey,
        ALTER COLUMN created_by SET NOT NULL,
        ADD CONSTRAINT documents_created_by_fkey 
            FOREIGN KEY (created_by) 
            REFERENCES profiles(id) 
            ON DELETE CASCADE
    """)

    # Revert user_post_events changes
    op.execute("""
        ALTER TABLE user_post_events
        DROP CONSTRAINT IF EXISTS user_post_events_user_id_fkey,
        ADD CONSTRAINT user_post_events_user_id_fkey 
            FOREIGN KEY (user_id) 
            REFERENCES profiles(id)
    """)

    # Revert post_edits changes
    op.execute("""
        ALTER TABLE post_edits
        DROP CONSTRAINT IF EXISTS post_edits_edited_by_fkey,
        ALTER COLUMN edited_by SET NOT NULL,
        ADD CONSTRAINT post_edits_edited_by_fkey 
            FOREIGN KEY (edited_by) 
            REFERENCES profiles(id)
    """)

    # Revert posts changes
    op.execute("""
        ALTER TABLE posts
        DROP CONSTRAINT IF EXISTS posts_created_by_fkey,
        ALTER COLUMN created_by SET NOT NULL,
        ADD CONSTRAINT posts_created_by_fkey 
            FOREIGN KEY (created_by) 
            REFERENCES profiles(id)
    """)

    # Revert user_roles changes
    op.execute("""
        ALTER TABLE user_roles
        DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey,
        DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey,
        DROP CONSTRAINT IF EXISTS user_roles_domain_fkey,
        DROP CONSTRAINT IF EXISTS user_roles_subdomain_fkey,
        ADD CONSTRAINT user_roles_user_id_fkey 
            FOREIGN KEY (user_id) 
            REFERENCES profiles(id),
        ADD CONSTRAINT user_roles_role_id_fkey 
            FOREIGN KEY (role_id) 
            REFERENCES roles(id),
        ADD CONSTRAINT user_roles_domain_fkey 
            FOREIGN KEY (domain) 
            REFERENCES courses(id),
        ADD CONSTRAINT user_roles_subdomain_fkey 
            FOREIGN KEY (subdomain) 
            REFERENCES tags(id)
    """)
