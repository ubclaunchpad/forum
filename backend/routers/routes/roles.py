# routers/routes/roles.py
from typing import Dict, List, Optional
from uuid import UUID

from controllers.permission_controller import UserPermissionManager
from fastapi import APIRouter, Depends, HTTPException, Request
from models.schemas.general_schema import GeneralResponse
from models.schemas.role_schema import (
    AssignPermissionsRequest,
    AssignRoleRequest,
    CreateRoleRequest,
    RoleAssignment,
)
from routers.dependencies import get_permissions_manager

roles_router = APIRouter()


# @roles_router.post("", response_model=GeneralResponse)
# async def create_role(
#     req: CreateRoleRequest,
#     request: Request,
#     perm_manager: UserPermissionManager = Depends(get_permissions_manager),
# ):
#     """Create a new role (requires system admin)"""
#     user_id = request.state.user_id
#     if not perm_manager.has_system_permission(user_id, "role:manage:any"):
#         raise HTTPException(status_code=403, detail="Insufficient permissions")

#     role_id = perm_manager.create_role(req.name, req.description, req.alias)
#     return GeneralResponse(msg=f"Role created successfully", properties={"id": role_id})


# @roles_router.post("/{role_id}/permissions", response_model=GeneralResponse)
# async def assign_permissions(
#     role_id: UUID,
#     req: AssignPermissionsRequest,
#     request: Request,
#     perm_manager: UserPermissionManager = Depends(get_permissions_manager),
# ):
#     """Assign permissions to a role (requires system admin)"""
#     user_id = request.state.user_id
#     if not perm_manager.has_system_permission(user_id, "role:manage:any"):
#         raise HTTPException(status_code=403, detail="Insufficient permissions")

#     success = perm_manager.assign_permissions_to_role(role_id, req.permission_ids)
#     return GeneralResponse(msg="Permissions assigned successfully")


# @roles_router.post("/assignments", response_model=GeneralResponse)
# async def assign_roles(
#     req: AssignRoleRequest,
#     request: Request,
#     perm_manager: UserPermissionManager = Depends(get_permissions_manager),
# ):
#     """
#     Assign roles to users. Requires appropriate permissions for each assignment:
#     - System-wide roles require system admin
#     - Course roles require course admin in that course
#     """
#     user_id = request.state.user_id

#     # Group assignments by domain for permission checking
#     assignments_by_domain: Dict[Optional[UUID], List[RoleAssignment]] = {}
#     for assignment in req.assignments:
#         domain = assignment.domain
#         if domain not in assignments_by_domain:
#             assignments_by_domain[domain] = []
#         assignments_by_domain[domain].append(assignment)

#     # Check permissions for each domain
#     for domain, assignments in assignments_by_domain.items():
#         if domain is None:
#             # System-wide role assignment requires system permission
#             if not perm_manager.has_system_permission(user_id, "role:assign:any"):
#                 raise HTTPException(
#                     status_code=403,
#                     detail=f"Insufficient permissions for system-wide role assignment",
#                 )
#         else:
#             # Course role assignment requires course admin
#             if not perm_manager.has_course_permission(
#                 user_id, domain, "role:assign:any"
#             ):
#                 raise HTTPException(
#                     status_code=403,
#                     detail=f"Insufficient permissions for course {domain}",
#                 )

#     # If all permission checks pass, do the assignments
#     success = perm_manager.assign_roles(req.assignments)
#     return GeneralResponse(msg="Roles assigned successfully")


# @roles_router.delete("/{role_id}", response_model=GeneralResponse)
# async def delete_role(
#     role_id: UUID,
#     request: Request,
#     perm_manager: UserPermissionManager = Depends(get_permissions_manager),
# ):
#     """Delete a role (requires system admin)"""
#     user_id = request.state.user_id
#     if not perm_manager.has_system_permission(user_id, "role:manage:any"):
#         raise HTTPException(status_code=403, detail="Insufficient permissions")

#     success = perm_manager.delete_role(role_id)
#     return GeneralResponse(msg="Role deleted successfully")


# @roles_router.delete("/assignments/{user_id}/{role_id}", response_model=GeneralResponse)
# async def remove_role_assignment(
#     user_id: UUID,
#     role_id: UUID,
#     request: Request,
#     domain: Optional[UUID] = None,
#     subdomain: Optional[UUID] = None,
#     perm_manager: UserPermissionManager = Depends(get_permissions_manager),
# ):
#     """
#     Remove a role assignment. Requires same permissions as assigning:
#     - System-wide roles require system admin
#     - Course roles require course admin in that course
#     """
#     requesting_user = request.state.user_id

#     if domain is None:
#         if not perm_manager.has_system_permission(requesting_user, "role:assign:any"):
#             raise HTTPException(status_code=403, detail="Insufficient permissions")
#     else:
#         if not perm_manager.has_course_permission(
#             requesting_user, domain, "role:assign:any"
#         ):
#             raise HTTPException(status_code=403, detail="Insufficient permissions")

#     success = perm_manager.remove_role_assignment(user_id, role_id, domain, subdomain)
#     return GeneralResponse(msg="Role assignment removed successfully")
