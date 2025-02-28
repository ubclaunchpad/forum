from enum import Enum
from typing import List, Optional, Dict
from uuid import UUID
from pydantic import BaseModel


class RoleAssignment(BaseModel):
    user_id: UUID
    role_id: UUID
    domain: Optional[UUID] = None
    subdomain: Optional[UUID] = None


class DefaultRole(str, Enum):
    SYSTEM_ADMIN = "system_admin"
    ORG_ADMIN = "org_admin"
    COURSE_ADMIN = "course_admin"
    COURSE_STAFF = "course_staff"
    COURSE_MEMBER = "course_member"


class CreateRoleRequest(BaseModel):
    name: str
    description: Optional[str] = None
    alias: Optional[str] = None


class AssignPermissionsRequest(BaseModel):
    permission_ids: List[UUID]


class AssignRoleRequest(BaseModel):
    assignments: List[RoleAssignment]
