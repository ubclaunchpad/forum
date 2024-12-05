from controllers import course_controller
from fastapi import APIRouter, HTTPException, Request
from models.schemas.course_schema import (
    CourseMembersResponse,
    CourseResponse,
    CreateCourseReq,
    CreateCourseResponse,
    GetCoursesResponse,
)
from models.schemas.general_schema import GeneralResponse

course_router = APIRouter()


@course_router.post("", response_model=CreateCourseResponse)
async def create_course(create_course_req: CreateCourseReq, request: Request):
    # user_id = request.state.user_id
    return course_controller.create_course(create_course_req)


@course_router.get("", response_model=GetCoursesResponse)
async def get_courses_route():
    courses = course_controller.get_courses()
    return {"courses": courses}


@course_router.get("/{c_id}", response_model=CourseResponse)
async def get_course_by_id(c_id: str):
    course = course_controller.get_course(c_id=c_id, name=None)
    return course


@course_router.delete("/{c_id}", response_model=CourseResponse)
async def delete_course(c_id: str):
    res = course_controller.delete_course(c_id)
    return res


# ----------------- Course Members -----------------#


@course_router.get("/{c_id}/members", response_model=CourseMembersResponse)
async def get_course_members(c_id: str):
    members = course_controller.get_course_members(c_id)
    return {"members": members}


@course_router.post("/{c_id}/members/{u_id}", response_model=GeneralResponse)
async def register_user(c_id: str, u_id: str):
    res = course_controller.add_user_to_course(c_id, u_id)
    if res:
        return GeneralResponse(msg=f"User {u_id} registered to course {c_id}")
    else:
        raise HTTPException(status_code=400, detail="Failed to register user to course")


@course_router.delete("/{c_id}/members/{u_id}", response_model=GeneralResponse)
async def unregister_user(c_id: str, u_id: str):
    res = course_controller.remove_user_from_course(c_id, u_id)
    if not res:
        raise HTTPException(
            status_code=400, detail="Failed to unregister user from course"
        )
    return GeneralResponse(msg=f"User {u_id} unregistered from course {c_id}")
