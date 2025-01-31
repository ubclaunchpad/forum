"""status and icon

Revision ID: 09db37a849a4
Revises: ee0d3f031dd6
Create Date: 2025-01-29 16:54:26.741246

"""

from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "09db37a849a4"
down_revision: Union[str, None] = "ee0d3f031dd6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "profiles", sa.Column("icon_url", sa.Text(), nullable=True), schema="public"
    )
    op.add_column(
        "profiles", sa.Column("status", sa.Text(), nullable=True), schema="public"
    )


def downgrade() -> None:
    op.drop_column("profiles", "icon_url", schema="public")
    op.drop_column("profiles", "status", schema="public")
