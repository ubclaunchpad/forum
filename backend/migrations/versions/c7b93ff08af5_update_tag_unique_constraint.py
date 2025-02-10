"""update_tag_unique_constraint

Revision ID: c7b93ff08af5
Revises: ca4a855c1845
Create Date: 2025-02-09 20:23:31.249542

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import pgvector


# revision identifiers, used by Alembic.
revision: str = 'c7b93ff08af5'
down_revision: Union[str, None] = 'ca4a855c1845'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint('uq_tag_parent_ids', 'tags', type_='unique')

    op.create_unique_constraint(
        'uq_tag_parent_ids', 
        'tags', 
        ['name', 'parent_tag_id', 'course_id']
    )
    pass


def downgrade() -> None:
    op.drop_constraint('uq_tag_parent_ids', 'tags', type_='unique')

    op.create_unique_constraint(
        'uq_tag_parent_ids',
        'tags',
        ['name', 'parent_tag_id']
    )
    pass
