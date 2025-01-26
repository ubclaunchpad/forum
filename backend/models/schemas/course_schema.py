from datetime import date
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

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
    members: List[Dict[str, str]]
