from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class AssignedBy(BaseModel):
    id: UUID
    name: str


class GetCourseUserRoleRes(BaseModel):
    user_id: UUID
    name: str
    access_role: int
    semantic_role: str
    assigned_at: datetime
    assigned_by: AssignedBy
