from pydantic import BaseModel

class CreateCourseReq(BaseModel):
    c_group: str
    c_code: str
    term: str