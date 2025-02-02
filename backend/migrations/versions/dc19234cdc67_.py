"""empty message

Revision ID: dc19234cdc67
Revises: 07f9fdd97141, 7a062c24ebe7
Create Date: 2025-02-01 20:04:13.218271

"""
from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'dc19234cdc67'
down_revision: Union[str, None] = ('07f9fdd97141', '7a062c24ebe7') #type: ignore
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
