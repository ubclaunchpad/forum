"""restructure_job_tables

Revision ID: f1ce316ab61f
Revises: 4a6768f2db42
Create Date: 2025-02-06 ...
"""

from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "f1ce316ab61f"
down_revision: Union[str, None] = "4a6768f2db42"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # First add the new column as nullable
    op.add_column(
        "job",
        sa.Column("specification_id", postgresql.UUID(), nullable=True),
        schema="public",
    )

    # Update existing rows to set specification_id from job_specification
    op.execute(
        """
        UPDATE public.job j
        SET specification_id = js.id
        FROM public.job_specification js
        WHERE j.id = js.job_id
    """
    )

    # Now make the column NOT NULL
    op.alter_column("job", "specification_id", nullable=False, schema="public")

    # Add the new foreign key constraint
    op.create_foreign_key(
        "job_specification_id_fkey",
        "job",
        "job_specification",
        ["specification_id"],
        ["id"],
        source_schema="public",
        referent_schema="public",
        ondelete="CASCADE",
    )

    # Finally drop the old columns
    op.drop_constraint(
        "job_specification_job_id_fkey",
        "job_specification",
        schema="public",
        type_="foreignkey",
    )
    op.drop_column("job_specification", "job_id", schema="public")
    op.drop_column("job_specification", "cleanup_action", schema="public")


def downgrade() -> None:
    # Remove the new foreign key and column
    op.drop_constraint(
        "job_specification_id_fkey", "job", schema="public", type_="foreignkey"
    )

    # Add back the old columns as nullable first
    op.add_column(
        "job_specification",
        sa.Column("cleanup_action", sa.Text(), nullable=True),
        schema="public",
    )
    op.add_column(
        "job_specification",
        sa.Column("job_id", postgresql.UUID(), nullable=True),
        schema="public",
    )

    # Update job_id values from the job table
    op.execute(
        """
        UPDATE public.job_specification js
        SET job_id = j.id
        FROM public.job j
        WHERE j.specification_id = js.id
    """
    )

    # Now make job_id NOT NULL
    op.alter_column("job_specification", "job_id", nullable=False, schema="public")

    # Add back the foreign key constraint
    op.create_foreign_key(
        "job_specification_job_id_fkey",
        "job_specification",
        "job",
        ["job_id"],
        ["id"],
        source_schema="public",
        referent_schema="public",
        ondelete="CASCADE",
    )

    # Finally drop the specification_id column
    op.drop_column("job", "specification_id", schema="public")
