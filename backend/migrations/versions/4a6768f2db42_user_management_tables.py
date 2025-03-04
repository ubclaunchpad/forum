"""user management tables

Revision ID: 4a6768f2db42
Revises: d946f44ab9b8
Create Date: 2025-02-06 13:06:51.726920

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import pgvector


# revision identifiers, used by Alembic.
revision: str = "4a6768f2db42"
down_revision: Union[str, None] = "d946f44ab9b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE public.invites (
            referrer_id UUID NOT NULL,
            referred_email TEXT NOT NULL,
            invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            joined_at TIMESTAMP NULL,
            PRIMARY KEY (referrer_id, referred_email),
            FOREIGN KEY (referrer_id) REFERENCES public.profiles(id) ON DELETE CASCADE
        );
    """
    )

    op.execute(
        """
        CREATE TABLE public.super_users (
            id UUID NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE
        );
    """
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS public.invites CASCADE;")
    op.execute("DROP TABLE IF EXISTS public.super_users CASCADE;")
