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

# @course_router.get("/{c_id}/members/{u_id}/roles")
# async def get_roles_for_user(c_id: str, u_id: str):
#     res = course_controller.get_course_roles_for_user(c_id, u_id)
#     if not res:
#         raise HTTPException(
#             status_code=400, detail="Failed to get course roles for {u_id}"
#         )
#     return res

# ----------------- Course Roles -----------------#
'''
@course_router.get("/{c_id}/roles", response_model=CourseRolesResponse)
async def get_course_roles(c_id: str):
    res = course_controller.get_basic_course_roles(c_id)
    if not res:
        raise HTTPException(
            status_code=400, detail="Failed to get course roles"
        )
    return CourseRolesResponse(roles=res)

@course_router.post("/{c_id}/roles", response_model=GeneralResponse)
async def create_course_role(c_id: str, role_req: CreateCourseRoleRequest, request: Request):
    author_id = ""
    res = course_controller.create_course_role(c_id, role_req, author_id)
    if not res:
        raise HTTPException(
            status_code=400, detail="Failed to get course roles"
        )
    return GeneralResponse(msg=f"{role_req.name} successfully created in course {c_id}")

@course_router.get("/{c_id}/roles/{r_id}", response_model=CourseRoleBase)
async def get_course_role(c_id: str, r_id: str):
    res = course_controller.get_course_role(c_id, r_id)
    if not res:
        raise HTTPException(status_code=400, detail="Failed to get course role")
    return res

@course_router.put("/{c_id}/roles/{r_id}")
async def update_course_role(c_id: str, r_id: str):
    return None

@course_router.delete("/{c_id}/role/{r_id}")
async def delete_course_role(c_id: str, r_id: str):
    return None

@course_router.post("/{c_id}/roles/{r_id}/permissions")
async def add_permission_to_course_role(c_id: str, r_id: str):
    return None

@course_router.delete("/{c_id}/roles/{r_id}/permissions")
async def delete_permission_from_course_role(c_id: str, r_id: str):
    return None

@course_router.post("/{c_id}/roles/assign")
async def assign_user_role(assignReq: AssignRoleRequest, req: Request):
    author_id = ""
    res = course_controller.assign_user_course_role(str(assignReq.user_id), str(assignReq.role_id), author_id)
    return GeneralResponse(msg=f"Assigned role")

@course_router.delete("/{c_id}/roles/unassign")
async def unassign_user_role(assignReq: AssignRoleRequest):
    res = course_controller.unassign_user_course_role(str(assignReq.user_id), str(assignReq.role_id))
    return GeneralResponse(msg=f"Unassigned role")
'''
# ----------------- Course Tags -----------------#
@course_router.get("/{course_id}/tags")
async def get_course_tags(course_id: str):
    res = course_controller.get_all_tags(course_id)
    if not res:
        raise HTTPException(
            status_code=400, detail="Failed to get course roles"
        )
    return CourseTagsResponse(tags=res)