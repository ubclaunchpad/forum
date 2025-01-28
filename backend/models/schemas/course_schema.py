from datetime import date, datetime
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from models.all import VisibilityEnum

class CourseBase(BaseModel):
    c_group: str
    code: int
    section: int
    name: Optional[str] = None
    config: Optional[Dict] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    class Config:
        from_attributes = True


class CreateCourseReq(CourseBase):
    pass


class CreateCourseResponse(BaseModel):
    id: UUID


class UpdateCourseReq(BaseModel):
    c_group: Optional[str] = None
    code: Optional[str] = None
    section: Optional[str] = None
    name: Optional[str] = None
    config: Optional[Dict] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class CourseResponse(CourseBase):
    id: UUID


class GetCoursesResponse(BaseModel):
    courses: List[CourseResponse]


class CourseMembersResponse(BaseModel):
    members: List[Dict[str, str]]

class AssignRoleRequest(BaseModel):
    user_id: UUID
    role_id: UUID

class BasicCourseRoleInformation(BaseModel):
    name: str
    description: Optional[str]

class CourseRolesResponse(BaseModel):
    roles: List[BasicCourseRoleInformation]

class CreateCourseRoleRequest(BaseModel):
    name: str
    description: Optional[str]
    permissions: List[UUID]
    visibility: VisibilityEnum

class CourseRoleBase(BaseModel):
    id: UUID
    course_id: UUID
    name: str
    description: Optional[str]
    visibility: VisibilityEnum
    created_by: UUID
    created_at: datetime
    updated_at: datetime