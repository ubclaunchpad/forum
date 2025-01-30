"""new profile table columns
Revision ID: ee0d3f031dd6
Revises: 486197168fe1
Create Date: 2025-01-29 15:54:45.462812
"""
from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers, used by Alembic.
revision: str = 'ee0d3f031dd6'
down_revision: Union[str, None] = '486197168fe1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Add new columns to profiles table
    op.add_column('profiles', sa.Column('pronouns', sa.Text(), nullable=True), schema='public')
    op.add_column('profiles', sa.Column('username', sa.Text(), nullable=True), schema='public')
    op.add_column('profiles', sa.Column('bio', sa.Text(), nullable=True), schema='public')
    op.add_column('profiles', sa.Column('socials', JSONB(), server_default='{}', nullable=True), schema='public')
    op.add_column('profiles', sa.Column('timezone', sa.Text(), nullable=True), schema='public')
    op.add_column('profiles', sa.Column('display_name', sa.Text(), nullable=True), schema='public')

    # Add unique constraint to username
    op.create_unique_constraint('uq_profiles_username', 'profiles', ['username'], schema='public')

def downgrade() -> None:
    # Drop unique constraint first
    op.drop_constraint('uq_profiles_username', 'profiles', schema='public')

    # Drop columns
    op.drop_column('profiles', 'display_name', schema='public')
    op.drop_column('profiles', 'timezone', schema='public')
    op.drop_column('profiles', 'socials', schema='public')
    op.drop_column('profiles', 'bio', schema='public')
    op.drop_column('profiles', 'username', schema='public')
    op.drop_column('profiles', 'pronouns', schema='public')