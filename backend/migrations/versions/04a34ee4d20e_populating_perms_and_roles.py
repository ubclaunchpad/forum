"""populating perms and roles

Revision ID: 04a34ee4d20e
Revises: 3a7ec88b8593
Create Date: 2025-02-13 13:52:30.129813

"""

from typing import Sequence, Union

import pgvector
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "04a34ee4d20e"
down_revision: Union[str, None] = "3a7ec88b8593"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop unnecessary columns from permissions
    op.execute("""
   ALTER TABLE permissions
   DROP COLUMN domain,
   DROP COLUMN subdomain,
   DROP COLUMN scope
   """)

    # Drop user_permissions table
    op.execute("""
   DROP TABLE user_permissions;
   """)

    # Add comment to user_roles
    op.execute("""
   COMMENT ON TABLE user_roles IS 'Defines role assignments for users. When both domain and subdomain are NULL, the role applies system-wide (superadmin). When only domain is set, role applies course-wide. When both are set, role applies to specific tag within course.';
   """)

    # Create trigger function for domain validation
    op.execute("""
   CREATE OR REPLACE FUNCTION check_subdomain_domain_match()
   RETURNS TRIGGER AS $$
   BEGIN
       IF NEW.subdomain IS NOT NULL THEN
           IF NOT EXISTS (
               SELECT 1 FROM tags 
               WHERE id = NEW.subdomain 
               AND course_id = NEW.domain
           ) THEN
               RAISE EXCEPTION 'Subdomain (tag) must belong to the specified domain (course)';
           END IF;
       END IF;
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   """)

    # Create the trigger
    op.execute("""
   CREATE TRIGGER enforce_subdomain_domain_match
   BEFORE INSERT OR UPDATE ON user_roles
   FOR EACH ROW
   EXECUTE FUNCTION check_subdomain_domain_match();
   """)

    # Add alias column to roles
    op.execute("""
   ALTER TABLE roles
   ADD COLUMN alias VARCHAR(100)
   """)

    # Insert permissions and roles
    op.execute("""
   WITH inserted_permissions AS (
       INSERT INTO permissions (resource, action, modifier) 
       VALUES
       -- System level
       ('system', 'manage', 'all'),
       ('user', 'manage', 'any'),      -- user management
       ('user', 'delete', 'any'),      -- can delete users
       ('user', 'invite', 'any'),      -- can invite users
       ('user', 'suspend', 'any'),     -- can suspend users
       
       -- Organization/Course level
       ('course', 'create', 'any'),    -- can create courses
       ('course', 'delete', 'any'),    -- can delete courses
       ('organization', 'manage', 'all'),
       ('organization', 'settings', 'all'),
       ('organization', 'billing', 'all'),
       
       -- Role management
       ('role', 'manage', 'any'),      -- can manage roles
       ('role', 'assign', 'any'),      -- can assign roles
       
       -- Analytics/Reporting
       ('analytics', 'view', 'all'),
       ('analytics', 'export', 'all'),
       
       -- Course level
       -- Posts
       ('post', 'create', 'any'),
       ('post', 'manage', 'all'),
       ('post', 'manage', 'own'),
       ('post', 'delete', 'all'),
       
       -- Documents
       ('document', 'create', 'any'),
       ('document', 'manage', 'all'),
       ('document', 'manage', 'own'),
       ('document', 'delete', 'all'),
       
       -- Course Settings
       ('course', 'settings', 'all'),
       
       -- Members
       ('member', 'invite', 'any'),
       ('member', 'remove', 'any'),
       ('member', 'manage', 'all'),
       
       -- Search
       ('search', 'create', 'any'),
       ('search', 'view', 'any')
       
       RETURNING id, resource, action, modifier
   ), 
   inserted_roles AS (
       INSERT INTO roles (name, description, alias) 
       VALUES 
       -- System roles
       ('system_admin', 'Complete system access', 'System Administrator'),
       ('org_admin', 'Organization-wide administration', 'Organization Admin'),
       
       -- Course roles
       ('course_admin', 'Full control over course content and settings', 'Course Admin'),
       ('course_staff', 'Can manage content but not course settings', 'Course Staff'),
       ('course_member', 'Basic course access and content creation', 'Course Member')
       RETURNING id, name
   )
   INSERT INTO role_permissions (role_id, permission_id)
   SELECT 
       r.id,
       p.id
   FROM inserted_roles r
   CROSS JOIN inserted_permissions p
   WHERE 
       -- System admin gets everything
       (r.name = 'system_admin')
       OR
       -- Org admin gets org-wide permissions
       (r.name = 'org_admin' 
        AND p.resource IN ('organization', 'course', 'user', 'analytics'))
       OR
       -- Course admin gets all course-level permissions
       (r.name = 'course_admin' 
        AND p.resource NOT IN ('system', 'organization', 'role', 'analytics'))
       OR
       -- Staff gets everything except course deletion and member removal
       (r.name = 'course_staff' 
        AND p.resource || ':' || p.action NOT IN (
            'course:delete', 
            'member:remove',
            'course:settings'
        ))
       OR
       -- Members get basic permissions
       (r.name = 'course_member' 
        AND p.resource || ':' || p.action || ':' || p.modifier IN (
            'post:create:any', 
            'post:manage:own',
            'document:create:any', 
            'document:manage:own',
            'search:create:any', 
            'search:view:any'
        ))
   """)


def downgrade() -> None:
    op.execute("""
       -- Drop the trigger and function
       DROP TRIGGER IF EXISTS enforce_subdomain_domain_match ON user_roles;
       DROP FUNCTION IF EXISTS check_subdomain_domain_match;
       
       -- Remove the alias column
       ALTER TABLE roles
       DROP COLUMN IF EXISTS alias;
       
       -- Recreate user_permissions table
       CREATE TABLE user_permissions (
           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
           user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
           permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
           domain UUID REFERENCES courses(id),
           subdomain UUID REFERENCES tags(id),
           created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
           UNIQUE(user_id, permission_id, domain, subdomain)
       );
       
       -- Clean up roles and permissions
       DELETE FROM role_permissions 
       WHERE role_id IN (
           SELECT id FROM roles 
           WHERE name IN ('system_admin', 'org_admin', 'course_admin', 'course_staff', 'course_member')
       );
       
       DELETE FROM roles 
       WHERE name IN ('system_admin', 'org_admin', 'course_admin', 'course_staff', 'course_member');
       
       DELETE FROM permissions;
       
       -- Add back the original columns to permissions
       ALTER TABLE permissions
       ADD COLUMN domain UUID REFERENCES courses(id),
       ADD COLUMN subdomain UUID REFERENCES tags(id),
       ADD COLUMN scope VARCHAR(50);
   """)
