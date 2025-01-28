"""empty message

Revision ID: 990400c7ca82
Revises: e3869e18cc7d, f462eb503bac
Create Date: 2025-01-27 23:36:21.239635

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import pgvector


# revision identifiers, used by Alembic.
revision: str = '990400c7ca82'
down_revision: Union[str, None] = ('e3869e18cc7d', 'f462eb503bac')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
