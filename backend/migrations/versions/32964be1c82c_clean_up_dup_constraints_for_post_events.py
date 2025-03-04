"""clean up dup constraints for post_events

Revision ID: 32964be1c82c
Revises: 0a4b9b2bda33
Create Date: 2025-01-31 12:15:57.184822

"""

from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "32964be1c82c"
down_revision: Union[str, None] = "0a4b9b2bda33"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop all numbered variations of user_id foreign key (1-15 and unnumbered)
    for i in range(1, 16):
        op.execute(
            f"""
           ALTER TABLE public.user_post_events 
           DROP CONSTRAINT IF EXISTS user_post_events_user_id_fkey{i}
       """
        )
    op.execute(
        "ALTER TABLE public.user_post_events DROP CONSTRAINT IF EXISTS user_post_events_user_id_fkey"
    )

    # Drop and recreate post_id foreign key for consistency
    op.execute(
        "ALTER TABLE public.user_post_events DROP CONSTRAINT IF EXISTS user_post_events_post_id_fkey"
    )

    # Create clean constraints
    op.execute(
        """
       ALTER TABLE public.user_post_events 
       ADD CONSTRAINT user_post_events_user_id_fkey 
       FOREIGN KEY (user_id) 
       REFERENCES public.profiles(id)
   """
    )

    op.execute(
        """
       ALTER TABLE public.user_post_events 
       ADD CONSTRAINT user_post_events_post_id_fkey 
       FOREIGN KEY (post_id) 
       REFERENCES public.posts(id) 
       ON DELETE CASCADE
   """
    )


def downgrade() -> None:
    # In downgrade we just ensure clean constraints exist
    op.drop_constraint(
        "user_post_events_post_id_fkey",
        "user_post_events",
        type_="foreignkey",
        schema="public",
    )
    op.drop_constraint(
        "user_post_events_user_id_fkey",
        "user_post_events",
        type_="foreignkey",
        schema="public",
    )
