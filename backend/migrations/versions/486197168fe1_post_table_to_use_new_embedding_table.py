"""post table to use new embedding table

Revision ID: 486197168fe1
Revises: 0901ed66b667
Create Date: 2025-01-28 22:53:13.564253

"""
from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '486197168fe1'
down_revision: Union[str, None] = '0901ed66b667'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the embedding column from posts table
    op.execute('ALTER TABLE public.posts DROP COLUMN IF EXISTS embedding')

def downgrade() -> None:
    # Restore the embedding column if needed
    op.execute('ALTER TABLE public.posts ADD COLUMN embedding public.vector NULL')