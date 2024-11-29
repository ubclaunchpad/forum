from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel


class CreateCourseReq(BaseModel):
    id: int | None = None
    c_group: str
    code: str
    section: str
    name: str | None = None
    config: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class RegisterUserReq(BaseModel):
    c_id: int
    u_id: UUID


class UpdateCourseReq(BaseModel):
    c_id: int
    c_group: str | None = None
    code: str | None = None
    section: str | None = None
    name: str | None = None
    config: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class AssignCourseUserRoleReq(BaseModel):
    u_id: UUID
    access_role: int
    semantic_role: str | None = None
    reason: str | None = None


class CourseUserRole(BaseModel):
    id: UUID
    course_id: int
    user_id: UUID
    access_role: int
    semantic_role: str
    assigned_by: UUID
    created_at: datetime
    updated_at: datetime
