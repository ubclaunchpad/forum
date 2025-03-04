"""clean up dup constraints for embeddings

Revision ID: 085b15d07704
Revises: 89579d708d78
Create Date: 2025-01-31 12:03:26.901251

"""

from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "085b15d07704"
down_revision: Union[str, None] = "89579d708d78"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop all variations of parent_chunk_id foreign key (numbered and unnumbered)
    op.execute(
        "ALTER TABLE public.embeddings DROP CONSTRAINT IF EXISTS embeddings_parent_chunk_id_fkey1"
    )
    op.execute(
        "ALTER TABLE public.embeddings DROP CONSTRAINT IF EXISTS embeddings_parent_chunk_id_fkey"
    )

    # Create single clean constraint
    op.execute(
        """
        ALTER TABLE public.embeddings 
        ADD CONSTRAINT embeddings_parent_chunk_id_fkey 
        FOREIGN KEY (parent_chunk_id) 
        REFERENCES public.embeddings(id) 
        ON DELETE CASCADE
    """
    )


def downgrade() -> None:
    # In downgrade we just ensure one clean constraint exists
    op.drop_constraint(
        "embeddings_parent_chunk_id_fkey",
        "embeddings",
        type_="foreignkey",
        schema="public",
    )
