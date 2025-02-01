"""add tags, doc_tags, post_tags

Revision ID: afad06f37d8f
Revises: 09db37a849a4
Create Date: 2025-01-31 22:59:34.107790

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import pgvector
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'afad06f37d8f'
down_revision: Union[str, None] = '09db37a849a4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('tags',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('visibility', sa.Enum('public', 'private', name='visibilityenum'), nullable=False),
        sa.Column('course_id', sa.UUID(), nullable=False),
        sa.Column('parent_tag_id', sa.UUID(), nullable=True),
        sa.Column('created_by', sa.UUID(), nullable=True),
        sa.Column('properties', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['course_id'], ['public.courses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['auth.users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['parent_tag_id'], ['public.tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        schema='public'
    )

    op.create_table('document_tags',
        sa.Column('doc_id', sa.UUID(), nullable=False),
        sa.Column('tag_id', sa.UUID(), nullable=False),
        sa.Column('created_by', sa.UUID(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['auth.users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['doc_id'], ['public.documents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['public.tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('doc_id', 'tag_id'),
        schema='public'
    )

    op.create_table('post_tags',
        sa.Column('post_id', sa.UUID(), nullable=False),
        sa.Column('tag_id', sa.UUID(), nullable=False),
        sa.Column('created_by', sa.UUID(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['auth.users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['post_id'], ['public.posts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['public.tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('post_id', 'tag_id'),
        schema='public'
    )
    pass


def downgrade() -> None:
    op.drop_table('post_tags', schema='public')
    op.drop_table('document_tags', schema='public')
    op.drop_table('tags', schema='public')
    op.execute("DROP TYPE IF EXISTS visibilityenum;")
    pass
