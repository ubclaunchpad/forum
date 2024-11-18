from fastapi import APIRouter, HTTPException

from backend.crud import course_crud
from backend.routers.req.courses_req import CreateCourseReq, RegisterUserReq, UpdateCourseReq

course_router = APIRouter()

@course_router.get("/posts/page")
async def get_courses():
    courses = course_crud.get_courses()
    if not courses:
        raise HTTPException(status_code=404, detail="Failed to create course.")
    return courses

@course_router.post("/posts/create")
async def create_course(req: CreateCourseReq):
    course = course_crud.create_course(req)
    if not course:
        raise HTTPException(status_code=404, detail="Failed to create course.")
    return course

@course_router.delete("/posts/delete/{p_id}")
async def delete_course(p_id: int):
    if not response:
        raise HTTPException(status_code=404, detail="Failed to create course.")
    return response

@course_router.put("/posts/update")
async def update_course(req: UpdateCourseReq):
    response = course_crud.update_course(req)
    if not response:
        raise HTTPException(status_code=404, detail="Failed to create course.")
    return response