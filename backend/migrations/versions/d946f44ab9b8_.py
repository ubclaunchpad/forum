"""empty message

Revision ID: d946f44ab9b8
Revises: 133ca56dad11, dc19234cdc67
Create Date: 2025-02-02 17:20:32.420553

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import pgvector


# revision identifiers, used by Alembic.
revision: str = 'd946f44ab9b8'
down_revision: Union[str, None] = ('133ca56dad11', 'dc19234cdc67')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
