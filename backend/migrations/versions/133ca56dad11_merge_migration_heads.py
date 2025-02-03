"""Merge migration heads

Revision ID: 133ca56dad11
Revises: 07f9fdd97141, afad06f37d8f
Create Date: 2025-02-01 16:35:38.253397

"""

from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "133ca56dad11"
down_revision: Union[str, None] = ("07f9fdd97141", "afad06f37d8f")  # type: ignore
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
