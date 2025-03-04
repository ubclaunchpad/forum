"""clean up dup constraints for profiles

Revision ID: 8bdec5c14050
Revises: a20561e17251
Create Date: 2025-01-31 12:12:45.543620

"""

from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "8bdec5c14050"
down_revision: Union[str, None] = "a20561e17251"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop all numbered variations of id foreign key (1-17 and unnumbered)
    for i in range(1, 18):
        op.execute(
            f"""
           ALTER TABLE public.profiles 
           DROP CONSTRAINT IF EXISTS profiles_id_fkey{i}
       """
        )
    op.execute("ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey")

    # Create single clean constraint
    op.execute(
        """
       ALTER TABLE public.profiles 
       ADD CONSTRAINT profiles_id_users_fkey 
       FOREIGN KEY (id) 
       REFERENCES auth.users(id) 
       ON DELETE CASCADE
   """
    )


def downgrade() -> None:
    # In downgrade we just ensure one clean constraint exists
    op.drop_constraint(
        "profiles_id_users_fkey", "profiles", type_="foreignkey", schema="public"
    )
