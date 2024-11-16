from uuid import UUID

from pydantic import BaseModel

class CreateCourseReq(BaseModel):
    c_id: int = None
    c_group: str
    c_code: str
    term: str

class RegisterUserReq(BaseModel):
    c_id: int
    u_id: UUID

class UpdateCourseReq(BaseModel):
    c_id: int
    name: str = None