"""Add messages, channels and userchannels tables

Revision ID: b66a12eca94a
Revises: dc19234cdc67
Create Date: 2025-02-04 13:24:57.437854

"""
from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'b66a12eca94a'
down_revision: Union[str, None] = 'dc19234cdc67'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Create the 'channels' table
    op.execute("""
        CREATE TABLE public.channels (
            id UUID DEFAULT gen_random_uuid() NOT NULL,
            name VARCHAR NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            created_by UUID NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (created_by) REFERENCES public.profiles(id)
        );
    """)

    # Create the 'messages' table
    op.execute("""
        CREATE TABLE public.messages (
            id UUID DEFAULT gen_random_uuid() NOT NULL,
            content TEXT NOT NULL,
            created_by UUID NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            channel_id UUID NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES public.profiles(id)
        );
    """)

    # Create the 'user_channels' table
    op.execute("""
        CREATE TABLE public.user_channels (
            id UUID DEFAULT gen_random_uuid() NOT NULL,
            user_id UUID NOT NULL,
            channel_id UUID NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
        );
    """)

def downgrade():
    # Drop the tables in reverse order to respect foreign key dependencies
    op.execute("DROP TABLE public.user_channels;")
    op.execute("DROP TABLE public.messages;")
    op.execute("DROP TABLE public.channels;")
