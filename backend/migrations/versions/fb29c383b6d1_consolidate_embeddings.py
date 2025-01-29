"""consolidate_embeddings

Revision ID: fb29c383b6d1
Revises: cec36a0a76fd
Create Date: 2025-01-25 21:00:14.066698

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import pgvector
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "fb29c383b6d1"
down_revision: Union[str, None] = "cec36a0a76fd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # First, set all existing parent_id values to NULL since we can't convert UUIDs to integers
    op.execute("UPDATE public.posts SET parent_id = NULL")

    # Now we can safely alter the column type
    op.alter_column(
        "posts",
        "parent_id",
        existing_type=sa.UUID(),
        type_=sa.Integer(),
        existing_nullable=True,
        postgresql_using="NULL",
    )

    # Create the embeddings table and other operations...
    op.create_table(
        "embeddings",
        sa.Column(
            "id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False
        ),
        sa.Column("entity_type", sa.String(length=50), nullable=False),
        sa.Column("entity_id", sa.UUID(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=True),
        sa.Column("chunk_type", sa.String(length=50), nullable=True),
        sa.Column(
            "chunk_metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True
        ),
        sa.Column("parent_chunk_id", sa.UUID(), nullable=True),
        sa.Column(
            "embedding", pgvector.sqlalchemy.vector.VECTOR(dim=1536), nullable=False
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "chunk_type IN ('text', 'image', 'code') OR chunk_type IS NULL",
            name="valid_chunk_type",
        ),
        sa.CheckConstraint(
            "jsonb_typeof(chunk_metadata) = 'object' OR chunk_metadata IS NULL",
            name="valid_metadata",
        ),
        sa.ForeignKeyConstraint(
            ["parent_chunk_id"], ["public.embeddings.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        schema="public",
    )
    op.create_index(
        "embeddings_vector_idx",
        "embeddings",
        ["embedding"],
        unique=False,
        schema="public",
        postgresql_using="ivfflat",
        postgresql_with={"lists": 100},
        postgresql_ops={"embedding": "vector_cosine_ops"},
    )
    op.create_foreign_key(
        None,
        "course_documents",
        "documents",
        ["document_id"],
        ["id"],
        source_schema="public",
        referent_schema="public",
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        None,
        "course_documents",
        "courses",
        ["course_id"],
        ["id"],
        source_schema="public",
        referent_schema="public",
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        None,
        "documents",
        "profiles",
        ["created_by"],
        ["id"],
        source_schema="public",
        referent_schema="public",
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        None,
        "post_edits",
        "posts",
        ["post_id"],
        ["id"],
        source_schema="public",
        referent_schema="public",
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        None,
        "post_edits",
        "profiles",
        ["edited_by"],
        ["id"],
        source_schema="public",
        referent_schema="public",
    )
    op.create_foreign_key(
        None,
        "posts",
        "courses",
        ["course_id"],
        ["id"],
        source_schema="public",
        referent_schema="public",
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        None,
        "posts",
        "profiles",
        ["created_by"],
        ["id"],
        source_schema="public",
        referent_schema="public",
    )
    op.create_foreign_key(
        None,
        "profiles",
        "users",
        ["id"],
        ["id"],
        source_schema="public",
        referent_schema="auth",
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        None,
        "user_courses",
        "profiles",
        ["user_id"],
        ["id"],
        source_schema="public",
        referent_schema="public",
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        None,
        "user_courses",
        "courses",
        ["course_id"],
        ["id"],
        source_schema="public",
        referent_schema="public",
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        None,
        "user_post_events",
        "posts",
        ["post_id"],
        ["id"],
        source_schema="public",
        referent_schema="public",
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        None,
        "user_post_events",
        "profiles",
        ["user_id"],
        ["id"],
        source_schema="public",
        referent_schema="public",
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, "user_post_events", schema="public", type_="foreignkey")
    op.drop_constraint(None, "user_post_events", schema="public", type_="foreignkey")
    op.drop_constraint(None, "user_courses", schema="public", type_="foreignkey")
    op.drop_constraint(None, "user_courses", schema="public", type_="foreignkey")
    op.drop_constraint(None, "profiles", schema="public", type_="foreignkey")
    op.drop_constraint(None, "posts", schema="public", type_="foreignkey")
    op.drop_constraint(None, "posts", schema="public", type_="foreignkey")
    op.alter_column(
        "posts",
        "parent_id",
        existing_type=sa.Integer(),
        type_=sa.UUID(),
        existing_nullable=True,
    )
    op.drop_constraint(None, "post_edits", schema="public", type_="foreignkey")
    op.drop_constraint(None, "post_edits", schema="public", type_="foreignkey")
    op.drop_constraint(None, "documents", schema="public", type_="foreignkey")
    op.drop_constraint(None, "course_documents", schema="public", type_="foreignkey")
    op.drop_constraint(None, "course_documents", schema="public", type_="foreignkey")
    op.drop_index(
        "embeddings_vector_idx",
        table_name="embeddings",
        schema="public",
        postgresql_using="ivfflat",
        postgresql_with={"lists": 100},
        postgresql_ops={"embedding": "vector_cosine_ops"},
    )
    op.drop_table("embeddings", schema="public")
    # ### end Alembic commands ###
