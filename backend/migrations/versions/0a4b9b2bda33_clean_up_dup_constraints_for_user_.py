"""clean up dup constraints for user_courses

Revision ID: 0a4b9b2bda33
Revises: 8bdec5c14050
Create Date: 2025-01-31 12:14:46.679844

"""

from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0a4b9b2bda33"
down_revision: Union[str, None] = "8bdec5c14050"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop all numbered variations of course_id foreign key (1-17 and unnumbered)
    for i in range(1, 18):
        op.execute(f"""
           ALTER TABLE public.user_courses 
           DROP CONSTRAINT IF EXISTS user_courses_course_id_fkey{i}
       """)
    op.execute(
        "ALTER TABLE public.user_courses DROP CONSTRAINT IF EXISTS user_courses_course_id_fkey"
    )

    # Drop all numbered variations of user_id foreign key (1-17)
    for i in range(1, 18):
        op.execute(f"""
           ALTER TABLE public.user_courses 
           DROP CONSTRAINT IF EXISTS user_courses_user_id_fkey{i}
       """)
    op.execute(
        "ALTER TABLE public.user_courses DROP CONSTRAINT IF EXISTS user_courses_user_id_fkey"
    )

    # Create single clean constraints
    op.execute("""
       ALTER TABLE public.user_courses 
       ADD CONSTRAINT user_courses_course_id_fkey 
       FOREIGN KEY (course_id) 
       REFERENCES public.courses(id) 
       ON DELETE CASCADE
   """)

    # Note: This should reference profiles table based on your model
    op.execute("""
       ALTER TABLE public.user_courses 
       ADD CONSTRAINT user_courses_user_id_fkey 
       FOREIGN KEY (user_id) 
       REFERENCES public.profiles(id) 
       ON DELETE CASCADE
   """)


def downgrade() -> None:
    # In downgrade we just ensure clean constraints exist
    op.drop_constraint(
        "user_courses_course_id_fkey",
        "user_courses",
        type_="foreignkey",
        schema="public",
    )
    op.drop_constraint(
        "user_courses_user_id_fkey", "user_courses", type_="foreignkey", schema="public"
    )
