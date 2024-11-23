from uuid import UUID
from datetime import date
from pydantic import BaseModel


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
