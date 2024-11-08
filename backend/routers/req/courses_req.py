from uuid import UUID

from pydantic import BaseModel

class CreateCourseReq(BaseModel):
    c_group: str
    c_code: str
    term: str

class RegisterUserReq(BaseModel):
    c_id: UUID
    u_id: UUID

class UpdateCourseReq(BaseModel):
    c_id: UUID
    name: str = None