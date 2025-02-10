"""course access column

Revision ID: f6526fac793c
Revises: c7b93ff08af5
Create Date: 2025-02-10 12:10:22.592671

"""
from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'f6526fac793c'
down_revision: Union[str, None] = 'c7b93ff08af5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    
    op.execute(
        """
        CREATE TYPE course_access as enum (
            'public',
            'open',
            'unlisted',
            'private'
        )
        """
    )
    op.execute(
        """
        ALTER TABLE public.courses
        ADD access course_access DEFAULT 'unlisted' 
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE public.courses
        DROP COLUMN access
        """
    )
    op.execute(
        """
        DROP TYPE course_access
        """
    )

