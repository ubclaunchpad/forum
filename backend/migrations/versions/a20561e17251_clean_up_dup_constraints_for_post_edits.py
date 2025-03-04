"""clean up dup constraints for post_edits

Revision ID: a20561e17251
Revises: 085b15d07704
Create Date: 2025-01-31 12:10:42.844214

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import pgvector


# revision identifiers, used by Alembic.
revision: str = "a20561e17251"
down_revision: Union[str, None] = "085b15d07704"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop all numbered variations of edited_by foreign key (1-15 and unnumbered)
    for i in range(1, 16):
        op.execute(
            f"""
           ALTER TABLE public.post_edits 
           DROP CONSTRAINT IF EXISTS post_edits_edited_by_fkey{i}
       """
        )
    op.execute(
        "ALTER TABLE public.post_edits DROP CONSTRAINT IF EXISTS post_edits_edited_by_fkey"
    )

    # Drop post_id foreign key to recreate it consistently
    op.execute(
        "ALTER TABLE public.post_edits DROP CONSTRAINT IF EXISTS post_edits_post_id_fkey"
    )

    # Create clean constraints
    op.execute(
        """
       ALTER TABLE public.post_edits 
       ADD CONSTRAINT post_edits_edited_by_fkey 
       FOREIGN KEY (edited_by) 
       REFERENCES public.profiles(id)
   """
    )

    op.execute(
        """
       ALTER TABLE public.post_edits 
       ADD CONSTRAINT post_edits_post_id_fkey 
       FOREIGN KEY (post_id) 
       REFERENCES public.posts(id) 
       ON DELETE CASCADE
   """
    )


def downgrade() -> None:
    # In downgrade we just ensure clean constraints exist
    op.drop_constraint(
        "post_edits_post_id_fkey", "post_edits", type_="foreignkey", schema="public"
    )
    op.drop_constraint(
        "post_edits_edited_by_fkey", "post_edits", type_="foreignkey", schema="public"
    )
