from uuid import UUID

from fastapi import APIRouter, HTTPException

from backend.crud import course_crud
from backend.routers.req.courses_req import CreateCourseReq, RegisterUserReq, UpdateCourseReq
from fastapi.security import OAuth2PasswordBearer
course_router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
course_router_endpoint= "/courses"

# @course_router.post(course_router_endpoint)
# async def register_course(req: RegisterUserReq):
#     profile = course_crud.register_course(req)
#     if not profile:
#         raise HTTPException(status_code=404, detail="Failed to create course.")
#     return profile

@course_router.get(course_router_endpoint)
async def get_courses():
    courses = course_crud.get_courses()
    if not courses:
        raise HTTPException(status_code=404, detail="Failed to fetch courses.")
    return courses

# get course by id
@course_router.get(course_router_endpoint + "/{c_id}")
async def get_courses_by_id(c_id: int):
    courses = course_crud.get_course_by_id(c_id)
    if not courses:
        raise HTTPException(status_code=404, detail="Failed to fetch course.")
    return courses

@course_router.post(course_router_endpoint)
async def create_course(req: CreateCourseReq):
    course = course_crud.create_course(req)
    if not course:
        raise HTTPException(status_code=404, detail="Failed to create course.")
    return course

@course_router.delete(course_router_endpoint + "/{c_id}")
async def delete_course(c_id: int):
    response = course_crud.delete_course(c_id)
    if not response:
        raise HTTPException(status_code=404, detail="Failed to delete course.")
    return response

@course_router.put(course_router_endpoint)
async def update_course(req: UpdateCourseReq):
    response = course_crud.update_course(req)
    if not response:
        raise HTTPException(status_code=404, detail="Failed to update course.")
    return response


