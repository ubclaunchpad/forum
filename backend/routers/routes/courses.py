from controllers import course_controller
from fastapi import APIRouter, HTTPException, Request
#from models.all import CourseRole
from models.schemas.course_schema import (
    AssignRoleRequest,
    CourseMembersResponse,
    CourseResponse,
    CourseRoleBase,
    CourseRolesResponse,
    CreateCourseReq,
    CreateCourseResponse,
    CreateCourseRoleRequest,
    GetCoursesResponse,
    CourseTagsResponse,
    CourseTagRequest,
    UpdateCourseReq
)
from models.schemas.general_schema import GeneralResponse

course_router = APIRouter()


@course_router.post("", response_model=CreateCourseResponse)
async def create_course(create_course_req: CreateCourseReq, request: Request):
    user_id = request.state.user_id
    return course_controller.create_course(user_id, create_course_req)


@course_router.get("", response_model=GetCoursesResponse)
async def get_courses_route(request: Request):
    user_id = request.state.user_id
    courses = course_controller.get_courses(user_id)
    return {"courses": courses}


@course_router.get("/{c_id}", response_model=CourseResponse)
async def get_course_by_id(c_id: str):
    course = course_controller.get_course(c_id=c_id, name=None)
    return course


@course_router.delete("/{c_id}", response_model=CourseResponse)
async def delete_course(c_id: str):
    res = course_controller.delete_course(c_id)
    return res


@course_router.put("/{c_id}", response_model=CourseResponse)
async def update_course(create_course_req: UpdateCourseReq, c_id: str):
    course = course_controller.update_course(create_course_req, c_id)
    return course


# ----------------- Course Members -----------------#


@course_router.get("/{c_id}/members", response_model=CourseMembersResponse)
async def get_course_members(c_id: str):
    members = course_controller.get_course_members(c_id)
    print(members[0])
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

# ----------------- Course Tags -----------------#
@course_router.get("/{course_id}/tags")
async def get_course_tags(course_id: str):
    res = course_controller.get_all_tags(course_id)
    if not res:
        raise HTTPException(
            status_code=400, detail="Failed to get course roles"
        )
    return CourseTagsResponse(tags=res)

@course_router.post("/{course_id}/tags")
async def create_course_tag(course_id: str, req: Request, tagReq: CourseTagRequest):
    author_id = req.state.user_id
    res = course_controller.create_tag(course_id, tagReq, author_id)
    if not res:
        raise HTTPException(
            status_code=400, detail="Failed to create tag"
        )
    return GeneralResponse(msg="Created tag succesfully")

@course_router.patch("/{course_id}/tags/{tag_id}")
async def update_course_tag(course_id: str, tag_id: str, tagReq: CourseTagRequest):
    res = course_controller.update_tag(course_id, tag_id, tagReq)
    if not res:
        raise HTTPException(
            status_code=400, detail="Failed to update tag"
        )
    return GeneralResponse(msg="Updated tag successfully")#probs should return updated tag

@course_router.delete("/{course_id}/tags/{tag_id}")
async def delete_course_tag(course_id: str, tag_id: str):
    res = course_controller.delete_tag(course_id, tag_id)
    if not res:
        raise HTTPException(
            status_code=400, detail="Failed to delete tag"
        )
    return GeneralResponse(msg="Deleted tag succesfully")