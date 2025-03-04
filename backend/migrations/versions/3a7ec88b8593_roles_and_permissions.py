"""roles and permissions

Revision ID: 3a7ec88b8593
Revises: f6526fac793c
Create Date: 2025-02-11 08:53:03.735777

"""

from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "3a7ec88b8593"
down_revision: Union[str, None] = "f6526fac793c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create permissions table
    op.execute(
        """
        CREATE TABLE permissions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            scope VARCHAR(50) NOT NULL,
            resource VARCHAR(50) NOT NULL,
            action VARCHAR(50) NOT NULL,
            modifier VARCHAR(50) NOT NULL,
            domain UUID REFERENCES courses(id),
            subdomain UUID REFERENCES tags(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """
    )

    # Create roles table
    op.execute(
        """
        CREATE TABLE roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """
    )

    # Create role_permissions junction table
    op.execute(
        """
        CREATE TABLE role_permissions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
            permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(role_id, permission_id)
        );
    """
    )

    # Create user_roles table
    op.execute(
        """
        CREATE TABLE user_roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
            domain UUID REFERENCES courses(id),
            subdomain UUID REFERENCES tags(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, role_id, domain, subdomain)
        );
    """
    )

    # Create user_permissions table
    op.execute(
        """
        CREATE TABLE user_permissions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
            domain UUID REFERENCES courses(id),
            subdomain UUID REFERENCES tags(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, permission_id, domain, subdomain)
        );
    """
    )

    # Create indexes
    op.execute(
        """
        CREATE INDEX idx_user_roles_user ON user_roles(user_id);
        CREATE INDEX idx_user_roles_domain ON user_roles(domain);
        CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);
        CREATE INDEX idx_user_permissions_domain ON user_permissions(domain);
        CREATE INDEX idx_permissions_scope_resource ON permissions(scope, resource);
    """
    )

    op.execute(
        """
    WITH inserted_role AS (
        INSERT INTO roles (name, description) 
        VALUES ('Organization Admin', 'Organization-wide administrator with full access')
        RETURNING id
    ), inserted_permissions AS (
        INSERT INTO permissions (scope, resource, action, modifier) 
        VALUES 
        ('org', 'admin', 'manage', 'all'),
        ('org', 'course', 'create', 'any'),
        ('org', 'user', 'manage', 'any')
        RETURNING id
    )
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT inserted_role.id, inserted_permissions.id
    FROM inserted_role, inserted_permissions
    """
    )


def downgrade() -> None:
    # Drop tables in reverse order (respecting foreign key constraints)
    op.execute(
        """
        DELETE FROM role_permissions 
        WHERE role_id IN (SELECT id FROM roles WHERE name = 'org_admin');
        
        DELETE FROM permissions 
        WHERE scope = 'org';
        
        DELETE FROM roles 
        WHERE name = 'org_admin';
    """
    )
    op.execute(
        """
        DROP INDEX IF EXISTS idx_user_roles_user;
        DROP INDEX IF EXISTS idx_user_roles_domain;
        DROP INDEX IF EXISTS idx_user_permissions_user;
        DROP INDEX IF EXISTS idx_user_permissions_domain;
        DROP INDEX IF EXISTS idx_permissions_scope_resource;
        
        DROP TABLE IF EXISTS user_permissions;
        DROP TABLE IF EXISTS user_roles;
        DROP TABLE IF EXISTS role_permissions;
        DROP TABLE IF EXISTS roles;
        DROP TABLE IF EXISTS permissions;
    """
    )
