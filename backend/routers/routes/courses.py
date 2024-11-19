from fastapi import APIRouter, HTTPException, Request
from backend.crud import course_crud
from backend.routers.req.courses_req import CreateCourseReq, RegisterUserReq, UpdateCourseReq
course_router = APIRouter()
course_router_endpoint= "/courses"

# @course_router.post(course_router_endpoint)
# async def register_course(createCourseReq: RegisterUserReq):
#     profile = course_crud.register_course(createCourseReq)
#     if not profile:
#         raise HTTPException(status_code=404, detail="Failed to create course.")
#     return profile

@course_router.get(course_router_endpoint)
async def get_courses(request: Request):
    courses = course_crud.get_courses()
    if not courses:
        raise HTTPException(status_code=404, detail="Failed to fetch courses.")
    return courses

# get course by id
@course_router.get(course_router_endpoint + "/{c_id}")
async def get_courses_by_id(c_id: int, request: Request):
    courses = course_crud.get_course_by_id(c_id)
    if not courses:
        raise HTTPException(status_code=404, detail="Failed to fetch course.")
    return courses

@course_router.post(course_router_endpoint)
async def create_course(createCourseReq: CreateCourseReq, request: Request):
    user_id = request.headers.get("X-User-ID")
    course = course_crud.create_course(createCourseReq)
    if not course:
        raise HTTPException(status_code=404, detail="Failed to create course.")
    # gets Admin Enum
    admin_enum = course_crud.get_role_key("Admin")
    if not admin_enum:
        raise HTTPException(status_code=404, detail="Failed to find Admin role")
    course_id = course.data[0]['id']
    admin_id = admin_enum.data[0]['id']
    # Adds user as admin to the added course
    add_user = course_crud.add_user_to_course(course_id, user_id, admin_id)
    if not add_user:
        raise HTTPException(status_code=404, detail="Failed to add user as admin to course.")
    return course

@course_router.delete(course_router_endpoint + "/{c_id}")
async def delete_course(c_id: int, request: Request):
    response = course_crud.delete_course(c_id)
    if not response:
        raise HTTPException(status_code=404, detail="Failed to delete course.")
    return response

@course_router.put(course_router_endpoint)
async def update_course(req: UpdateCourseReq, request: Request):
    response = course_crud.update_course(req)
    if not response:
        raise HTTPException(status_code=404, detail="Failed to update course.")
    return response


