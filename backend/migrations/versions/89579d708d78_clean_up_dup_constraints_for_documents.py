"""clean up dup constraints for documents

Revision ID: 89579d708d78
Revises: 08eb2d8bf7d6
Create Date: 2025-01-31 11:59:14.679808

"""
from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '89579d708d78'
down_revision: Union[str, None] = '08eb2d8bf7d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop all numbered variations of created_by foreign key (1-9 and unnumbered)
    for i in range(1, 10):
        op.execute(f"""
            ALTER TABLE public.documents 
            DROP CONSTRAINT IF EXISTS documents_created_by_fkey{i}
        """)
    op.execute("ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_created_by_fkey")

    # Create single clean constraint
    op.execute("""
        ALTER TABLE public.documents 
        ADD CONSTRAINT documents_created_by_fkey 
        FOREIGN KEY (created_by) 
        REFERENCES public.profiles(id) 
        ON DELETE CASCADE
    """)

def downgrade() -> None:
    # In downgrade we just ensure one clean constraint exists
    op.drop_constraint('documents_created_by_fkey', 'documents', type_='foreignkey', schema='public')