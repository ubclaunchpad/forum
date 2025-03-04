"""post dup constraints

Revision ID: 0901ed66b667
Revises: d4d3929801da
Create Date: 2025-01-28 22:44:07.603680

"""

from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0901ed66b667"
down_revision: Union[str, None] = "d4d3929801da"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop all numbered duplicate constraints for course_id
    for i in range(1, 16):
        op.execute(
            f"ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_course_id_fkey{i}"
        )

    # Drop all numbered duplicate constraints for created_by
    for i in range(1, 16):
        op.execute(
            f"ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_created_by_fkey{i}"
        )

    # Rename the unique constraint to match our model
    op.execute(
        """
        ALTER TABLE public.posts 
        RENAME CONSTRAINT uq_course_local_id 
        TO uq_posts_course_local_id
    """
    )

    # Ensure we have exactly one of each constraint with our desired names
    op.execute(
        """
        ALTER TABLE public.posts 
        DROP CONSTRAINT IF EXISTS posts_course_id_fkey,
        ADD CONSTRAINT posts_course_id_fkey 
        FOREIGN KEY (course_id) 
        REFERENCES public.courses(id) 
        ON DELETE CASCADE;
    """
    )

    op.execute(
        """
        ALTER TABLE public.posts 
        DROP CONSTRAINT IF EXISTS posts_created_by_fkey,
        ADD CONSTRAINT posts_created_by_fkey 
        FOREIGN KEY (created_by) 
        REFERENCES public.profiles(id);
    """
    )


def downgrade() -> None:
    # Since we're cleaning up duplicates, downgrade is a no-op
    pass
