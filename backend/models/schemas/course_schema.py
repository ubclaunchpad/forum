from datetime import date
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class CourseBase(BaseModel):
    c_group: str
    code: str
    section: str
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