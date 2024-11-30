from uuid import UUID

from pydantic import BaseModel

from routers.req.courses_req import Course


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