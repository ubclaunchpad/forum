"""empty message

Revision ID: 07f9fdd97141
Revises: 09db37a849a4, 0f36437bdda7
Create Date: 2025-01-31 23:04:56.374661

"""

from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "07f9fdd97141"
down_revision: Union[str, None] = ("09db37a849a4", "0f36437bdda7")  # type: ignore
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
