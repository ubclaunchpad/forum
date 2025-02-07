from datetime import date, datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID

from models.schemas.user_schema import UserProfile
from pydantic import BaseModel


class CourseConfig(BaseModel):
    theme_colour: Optional[str] = None
    font: Optional[str] = None


class CourseBase(BaseModel):
    c_group: str
    code: int
    section: int
    name: Optional[str] = None
    config: Optional[CourseConfig] = None
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
    code: Optional[int] = None
    section: Optional[int] = None
    name: Optional[str] = None
    config: Optional[CourseConfig] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class CourseResponse(CourseBase):
    id: UUID


class GetCoursesResponse(BaseModel):
    courses: List[CourseResponse]


class CourseMembersResponse(BaseModel):
    members: List[UserProfile]


class VisibilityEnum(str, Enum):
    public = "public"
    private = "private"


class CourseTagInformation(BaseModel):
    id: UUID
    name: str
    visibility: VisibilityEnum
    course_id: UUID
    parent_tag_id: Optional[UUID] = None
    created_by: Optional[UUID] = None
    properties: Optional[dict] = None

    class Config:
        from_attributes = True

class CourseTagCount(BaseModel):
    posts: int
    documents: int
    unassigned: int
    total: int

class CourseTagsResponse(BaseModel):
    tags: List[CourseTagInformation]
    count: Optional[CourseTagCount] = None

class CourseTagRequest(BaseModel):
    name: Optional[str] = None
    visibility: Optional[VisibilityEnum] = None
    parent_tag_id: Optional[UUID] = None
    properties: Optional[dict] = None
