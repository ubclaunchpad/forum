"""unique_tag_name_parent_id

Revision ID: ca4a855c1845
Revises: d946f44ab9b8
Create Date: 2025-02-06 16:36:53.182985

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import pgvector


# revision identifiers, used by Alembic.
revision: str = 'ca4a855c1845'
down_revision: Union[str, None] = 'f1ce316ab61f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_unique_constraint('uq_tag_parent_ids', 'tags', ['name', 'parent_tag_id']) #Unique (name + parent_id)
    pass


def downgrade() -> None:
    op.drop_constraint('uq_tag_parent_ids', 'tags', type_='unique')
    pass
