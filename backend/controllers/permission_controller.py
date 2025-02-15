import json
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

from fastapi import HTTPException
from models.all import Permission as DBPermission
from models.all import Role as DBRole
from models.all import UserRole
from models.db import get_db
from models.schemas.role_schema import RoleAssignment
from sqlalchemy import or_, select
from sqlalchemy.orm import Session


@dataclass
class Permission:
    id: UUID
    resource: str
    action: str
    modifier: str


@dataclass
class Role:
    id: UUID
    name: str
    description: Optional[str]
    alias: Optional[str]
    permissions: List[Permission]


class PermissionCache:
    def __init__(self):
        self._permissions: Dict[UUID, Permission] = {}
        self._roles: Dict[UUID, Role] = {}
        self.last_refresh: datetime = datetime.min

    def refresh_if_needed(self, db, force: bool = False):
        if force or (datetime.now() - self.last_refresh).total_seconds() > 3600:
            self._refresh(db)

    def _refresh(self, db: Session):
        try:
            stmt = db.query(DBRole).distinct()
            result = db.execute(stmt).all()

            for r in result:
                role = r.Role
                if role.id not in self._roles:
                    obj = Role(
                        id=role.id,
                        name=role.name,
                        description=role.description,
                        alias=role.alias,
                        permissions=[],
                    )
                    self._roles[role.id] = obj

                perms = role.permissions
                for perm in perms:
                    if perm.id not in self._permissions:
                        perm_obj = Permission(
                            id=perm.id,
                            resource=perm.resource,
                            action=perm.action,
                            modifier=perm.modifier,
                        )
                        self._permissions[perm.id] = perm_obj
                    self._roles[role.id].permissions.append(self._permissions[perm.id])

            self.last_refresh = datetime.now()
        except Exception as e:
            print(e)


class UserPermissionManager:
    def __init__(self, cache: PermissionCache):
        self.cache = cache

    def get_role_by_name(self, role_name: str) -> UUID:
        for role_id, role in self.cache._roles.items():
            if role.name == role_name:
                return role_id
        raise KeyError(f"Role {role_name} not found")

    async def get_user_roles_and_permissions(
        self,
        db,
        user_id: UUID,
    ) -> Dict[
        str,
        Union[
            List[Dict[str, Any]],
            Dict[str, Dict[str, Dict[str, Dict[str, Dict[str, bool]]]]],
        ],
    ]:
        self.cache.refresh_if_needed(db)

        stmt = select(UserRole).where(UserRole.user_id == user_id)
        result = db.execute(stmt)

        roles = []
        permission_tree = {}

        for assignment in result.scalars():
            role = self.cache._roles[assignment.role_id]

            # Add to roles list
            roles.append(
                {
                    "id": role.id,
                    "name": role.name,
                    "domain": assignment.domain,
                    "subdomain": assignment.subdomain,
                    "permissions": role.permissions,
                }
            )

            # Build permission tree
            self._add_permissions_to_tree(
                permission_tree,
                role.permissions,
                assignment.domain,
                assignment.subdomain,
            )

        return {"roles": roles, "permissions": permission_tree}

    def _add_permissions_to_tree(
        self,
        tree: Dict,
        permissions: List[Permission],
        domain: Optional[UUID],
        subdomain: Optional[UUID],
    ):
        """
        Builds a permission lookup tree like:
        {
            "all": {                    # System-wide (when domain is None)
                "all": {                # (when subdomain is None)
                    "resource": {
                        "action": {
                            "modifier": True
                        }
                    }
                }
            },
            "domain_id": {              # Course-level
                "all": {                # Course-wide (when subdomain is None)
                    "resource": {
                        "action": {
                            "modifier": True
                        }
                    }
                },
                "subdomain_id": {       # Tag-specific
                    "resource": {
                        "action": {
                            "modifier": True
                        }
                    }
                }
            }
        }
        """
        # If domain is None, use "all"/"all" for system-wide permissions
        domain_key = "all" if domain is None else str(domain)
        subdomain_key = "all" if subdomain is None else str(subdomain)

        # Initialize the path if needed
        if domain_key not in tree:
            tree[domain_key] = {}
        if subdomain_key not in tree[domain_key]:
            tree[domain_key][subdomain_key] = {}

        # Add each permission to the tree
        for perm in permissions:
            if perm.resource not in tree[domain_key][subdomain_key]:
                tree[domain_key][subdomain_key][perm.resource] = {}
            if perm.action not in tree[domain_key][subdomain_key][perm.resource]:
                tree[domain_key][subdomain_key][perm.resource][perm.action] = {}

            # Set the permission
            tree[domain_key][subdomain_key][perm.resource][perm.action][
                perm.modifier
            ] = True

    def can_user_perform_action(
        self,
        permission_tree: Dict,
        resource: str,
        action: str,
        domain: Optional[UUID] = None,
        subdomain: Optional[UUID] = None,
    ) -> bool:
        """
        Quick permission check using the tree structure.
        Checks in order:
        1. System-wide permissions ("all"/"all")
        2. Course-wide permissions (domain/"all")
        3. Tag-specific permissions (domain/subdomain)
        """
        # Check system-wide permissions first
        if "all" in permission_tree and "all" in permission_tree["all"]:
            sys_perms = permission_tree["all"]["all"]
            if resource in sys_perms and action in sys_perms[resource]:
                for modifier in sys_perms[resource][action]:
                    if sys_perms[resource][action][modifier]:
                        return True

        if domain is None:
            return False

        domain_str = str(domain)
        if domain_str not in permission_tree:
            return False

        # Check course-wide permissions
        if "all" in permission_tree[domain_str]:
            course_perms = permission_tree[domain_str]["all"]
            if resource in course_perms and action in course_perms[resource]:
                for modifier in course_perms[resource][action]:
                    if course_perms[resource][action][modifier]:
                        return True

        # Check tag-specific permissions
        if subdomain:
            subdomain_str = str(subdomain)
            if subdomain_str in permission_tree[domain_str]:
                tag_perms = permission_tree[domain_str][subdomain_str]
                if resource in tag_perms and action in tag_perms[resource]:
                    for modifier in tag_perms[resource][action]:
                        if tag_perms[resource][action][modifier]:
                            return True

        return False

    def has_role(
        self,
        user_roles: List[dict],
        role_name: str,
        domain: Optional[UUID] = None,
        subdomain: Optional[UUID] = None,
    ) -> bool:
        """Check if user has exact role in scope"""
        return any(
            role["name"] == role_name
            and role["domain"] == domain
            and role["subdomain"] == subdomain
            for role in user_roles
        )

    def create_role(
        self, name: str, description: Optional[str], alias: Optional[str]
    ) -> UUID:
        """Create a new role"""
        with get_db() as db:
            try:
                role = DBRole(name=name, description=description, alias=alias)
                db.add(role)
                db.flush()
                role_id = role.id
                db.commit()
                return role_id.value
            except Exception as e:
                db.rollback()
                raise HTTPException(
                    status_code=500, detail=f"Failed to create role: {str(e)}"
                )

    def assign_permissions_to_role(
        self, role_id: UUID, permission_ids: List[UUID]
    ) -> bool:
        """Assign permissions to a role"""
        with get_db() as db:
            try:
                role = db.query(DBRole).filter(DBRole.id == role_id).first()
                if not role:
                    raise HTTPException(status_code=404, detail="Role not found")

                permissions = (
                    db.query(DBPermission)
                    .filter(DBPermission.id.in_(permission_ids))
                    .all()
                )

                role.permissions.extend(permissions)
                db.commit()
                return True
            except Exception as e:
                db.rollback()
                raise HTTPException(
                    status_code=500, detail=f"Failed to assign permissions: {str(e)}"
                )

    def assign_roles(self, assignments: List[RoleAssignment]) -> bool:
        """Assign roles to users"""
        with get_db() as db:
            try:
                for assignment in assignments:
                    user_role = UserRole(
                        user_id=assignment.user_id,
                        role_id=assignment.role_id,
                        domain=assignment.domain,
                        subdomain=assignment.subdomain,
                    )
                    db.add(user_role)
                db.commit()
                return True
            except Exception as e:
                db.rollback()
                raise HTTPException(
                    status_code=500, detail=f"Failed to assign roles: {str(e)}"
                )

    def delete_role(self, role_id: UUID) -> bool:
        """Delete a role"""
        with get_db() as db:
            try:
                db.query(DBRole).filter(DBRole.id == role_id).delete()
                db.commit()
                return True
            except Exception as e:
                db.rollback()
                raise HTTPException(
                    status_code=500, detail=f"Failed to delete role: {str(e)}"
                )

    def remove_role_assignment(
        self,
        user_id: UUID,
        role_id: UUID,
        domain: Optional[UUID] = None,
        subdomain: Optional[UUID] = None,
    ) -> bool:
        """Remove a role assignment"""
        with get_db() as db:
            try:
                query = db.query(UserRole).filter(
                    UserRole.user_id == user_id, UserRole.role_id == role_id
                )

                if domain is not None:
                    query = query.filter(UserRole.domain == domain)
                if subdomain is not None:
                    query = query.filter(UserRole.subdomain == subdomain)

                query.delete()
                db.commit()
                return True
            except Exception as e:
                db.rollback()
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to remove role assignment: {str(e)}",
                )
