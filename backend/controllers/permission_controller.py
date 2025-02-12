from typing import NotRequired, TypedDict

from models.all import (
    Permission,
    Role,
    UserRole,  # Import the table
    role_permissions,
)
from models.db import get_db
from sqlalchemy import func, select
from sqlalchemy.orm import class_mapper


def model_to_dict(obj):
    return {
        column.key: getattr(obj, column.key)
        for column in class_mapper(obj.__class__).columns
    }


class RoleOptions(TypedDict):
    include_permissions: NotRequired[bool]
    combine_permissions: NotRequired[bool]


def get_user_roles(user_id: str, options: RoleOptions):
    with get_db() as db:
        permissions_subquery = (
            select(
                role_permissions.c.role_id,
                func.json_agg(
                    func.json_build_object(
                        "domain",
                        Permission.domain,
                        "subdomain",
                        Permission.subdomain,
                        "scope",
                        Permission.scope,
                        "resource",
                        Permission.resource,
                        "modifier",
                        Permission.modifier,
                        "action",
                        Permission.action,
                    )
                ).label("permissions"),
            )
            .join(Permission, Permission.id == role_permissions.c.permission_id)
            .group_by(role_permissions.c.role_id)
            .subquery()
        )

        stmt = (
            select(Role, permissions_subquery.c.permissions)
            .join(UserRole, UserRole.role_id == Role.id)
            .join(
                permissions_subquery,
                permissions_subquery.c.role_id == Role.id,
                isouter=True,
            )
            .where(UserRole.user_id == user_id)
        )

        result = db.execute(stmt).mappings().all()

        roles_with_permissions = []
        for row in result:
            role_dict = model_to_dict(row["Role"])
            role_dict["permissions"] = row["permissions"] or []
            roles_with_permissions.append(role_dict)

        return roles_with_permissions


def get_user_roles_and_permissions(user_id: str, options: RoleOptions):
    with get_db() as db:
        # Main query to get roles and permissions in one go
        stmt = (
            select(
                Role.id.label("role_id"),
                Role.name.label("role_name"),
                Role.description.label("role_description"),
                Permission.domain,
                Permission.subdomain,
                Permission.scope,
                Permission.resource,
                Permission.action,
                Permission.modifier,
            )
            .join(UserRole, UserRole.role_id == Role.id)
            .join(role_permissions, role_permissions.c.role_id == Role.id)
            .join(Permission, Permission.id == role_permissions.c.permission_id)
            .where(UserRole.user_id == user_id)
        )

        result = db.execute(stmt).mappings().all()

        # Process results into roles and permissions
        roles = {}
        permissions = []

        for row in result:
            # Handle roles
            role_id = str(row["role_id"])
            if role_id not in roles:
                roles[role_id] = {
                    "id": role_id,
                    "name": row["role_name"],
                    "description": row["role_description"],
                }

            # Handle permissions
            permission = {
                "domain": str(row["domain"]) if row["domain"] else None,
                "subdomain": str(row["subdomain"]) if row["subdomain"] else None,
                "scope": row["scope"],
                "resource": row["resource"],
                "action": row["action"],
                "modifier": row["modifier"],
            }

            # Only add unique permissions
            if permission not in permissions:
                permissions.append(permission)

        return list(roles.values()), permissions
