from datetime import date
from uuid import UUID

from pydantic import BaseModel


class Course(BaseModel):
    id: UUID
    c_group: str
    code: str
    section: str
    name: str | None = None
    config: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class CreateCourseReq(BaseModel):
    id: UUID | None = None
    c_group: str
    code: str
    section: str
    name: str | None = None
    config: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class RegisterUserReq(BaseModel):
    c_id: UUID
    u_id: UUID


class UpdateCourseReq(BaseModel):
    c_id: UUID
    c_group: str | None = None
    code: str | None = None
    section: str | None = None
    name: str | None = None
    config: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class CreateCourseResponse(BaseModel):
    course_id: UUID
    msg: str


class GetCoursesResponse(BaseModel):
    courses: list[Course]


class GetCourseByIdResponse(BaseModel):
    course: Course | None = None


class UpdateCourseResponse(BaseModel):
    updated: Course
    msg: str


class DeleteCourseResponse(BaseModel):
    deleted: UUID
    msg: str
