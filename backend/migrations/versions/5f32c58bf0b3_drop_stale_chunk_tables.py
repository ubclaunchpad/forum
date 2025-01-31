"""drop stale chunk tables

Revision ID: 5f32c58bf0b3
Revises: 32964be1c82c
Create Date: 2025-01-31 12:22:38.688735

"""
from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '5f32c58bf0b3'
down_revision: Union[str, None] = '32964be1c82c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("DROP TABLE IF EXISTS public.chunk_relations CASCADE")
    op.execute("DROP TABLE IF EXISTS public.chunks CASCADE")

def downgrade() -> None:
    # No downgrade since we're removing legacy tables
    pass