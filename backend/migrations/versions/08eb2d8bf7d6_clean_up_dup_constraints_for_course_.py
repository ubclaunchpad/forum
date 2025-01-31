"""clean up dup constraints for course_documents

Revision ID: 08eb2d8bf7d6
Revises: 09db37a849a4
Create Date: 2025-01-31 11:57:50.711217

"""
from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '08eb2d8bf7d6'
down_revision: Union[str, None] = '09db37a849a4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop all numbered variations of course_id foreign keys (1-14 and unnumbered)
    for i in range(1, 15):
        op.execute(f"""
            ALTER TABLE public.course_documents 
            DROP CONSTRAINT IF EXISTS course_documents_course_id_fkey{i}
        """)
    op.execute("ALTER TABLE public.course_documents DROP CONSTRAINT IF EXISTS course_documents_course_id_fkey")

    # Drop all numbered variations of document_id foreign keys (1-14 and unnumbered)
    for i in range(1, 15):
        op.execute(f"""
            ALTER TABLE public.course_documents 
            DROP CONSTRAINT IF EXISTS course_documents_document_id_fkey{i}
        """)
    op.execute("ALTER TABLE public.course_documents DROP CONSTRAINT IF EXISTS course_documents_document_id_fkey")

    # Create single clean constraints
    op.execute("""
        ALTER TABLE public.course_documents 
        ADD CONSTRAINT course_documents_course_id_fkey 
        FOREIGN KEY (course_id) 
        REFERENCES public.courses(id) 
        ON DELETE CASCADE
    """)

    op.execute("""
        ALTER TABLE public.course_documents 
        ADD CONSTRAINT course_documents_document_id_fkey 
        FOREIGN KEY (document_id) 
        REFERENCES public.documents(id) 
        ON DELETE CASCADE
    """)

def downgrade() -> None:
    # In downgrade we just ensure one clean constraint exists
    op.drop_constraint('course_documents_course_id_fkey', 'course_documents', type_='foreignkey', schema='public')
    op.drop_constraint('course_documents_document_id_fkey', 'course_documents', type_='foreignkey', schema='public')
