from fastapi import APIRouter, HTTPException, Request
from pydantic import ValidationError
from crud import course_crud
from crud import user_crud
from crud.course_crud import UserNotEnrolledException, NoPermissionException
from routers.req.courses_req import CreateCourseReq, UpdateCourseReq, AssignCourseUserRoleReq, CourseUserRole

course_router = APIRouter()
course_router_endpoint = "/courses"

# @course_router.post(course_router_endpoint)
# async def register_course(create_course_req: RegisterUserReq):
#     profile = course_crud.register_course(create_course_req)
#     if not profile:
#         raise HTTPException(status_code=404, detail="Failed to create course.")
#     return profile


@course_router.get(course_router_endpoint)
async def get_courses(request: Request):
    courses = course_crud.get_courses(request.headers.get("X-User-ID"))
    if not courses:
        raise HTTPException(status_code=404, detail="Failed to fetch courses.")
    return courses


# get course by id
@course_router.get(course_router_endpoint + "/{c_id}")
async def get_courses_by_id(c_id: int, request: Request):
    try:
        courses = course_crud.get_course_by_id(c_id, request.headers.get("X-User-ID"))
        if not courses:
            raise HTTPException(status_code=404, detail="Failed to fetch course.")
        return courses
    except UserNotEnrolledException as e:
        raise HTTPException(
            status_code=404, detail="User is not enrolled in this course"
        )


@course_router.post(course_router_endpoint)
async def create_course(create_course_req: CreateCourseReq, request: Request):
    user_id = request.headers.get("X-User-ID")
    course = course_crud.create_course(create_course_req)
    if not course:
        raise HTTPException(status_code=404, detail="Failed to create course.")
    # gets Admin Enum
    admin_enum = course_crud.get_role_key("Admin")
    if not admin_enum:
        raise HTTPException(status_code=404, detail="Failed to find Admin role")
    course_id = course.data[0]["id"]
    admin_id = admin_enum.data[0]["id"]
    # Adds user as admin to the added course
    add_user = course_crud.add_user_to_course(course_id, user_id, admin_id)
    if not add_user:
        raise HTTPException(
            status_code=404, detail="Failed to add user as admin to course."
        )
    return course


@course_router.delete(course_router_endpoint + "/{c_id}")
async def delete_course(c_id: int, request: Request):
    try:
        admin_enum = course_crud.get_role_key("Admin")
        if not admin_enum:
            raise HTTPException(status_code=404, detail="Failed to find Admin role")
        admin_id = admin_enum.data[0]["id"]
        response = course_crud.delete_course(
            c_id, request.headers.get("X-User-ID"), admin_id
        )
        if not response:
            raise HTTPException(status_code=404, detail="Failed to delete course.")
        return response
    except NoPermissionException as e:
        raise HTTPException(
            status_code=404, detail="User has no permission to delete role"
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@course_router.put(course_router_endpoint)
async def update_course(update_course_req: UpdateCourseReq, request: Request):
    try:
        # Get admin and maintainer role values
        admin_enum = course_crud.get_role_key("Admin")
        maintainer_enum = course_crud.get_role_key("Maintainer")
        if not admin_enum or not maintainer_enum:
            raise HTTPException(
                status_code=404, detail="Failed to get Admin and Maintaner roles"
            )
        admin_id = admin_enum.data[0]["id"]
        maintainer_id = maintainer_enum.data[0]["id"]
        response = course_crud.update_course(
            update_course_req, request.headers.get("X-User-ID"), admin_id, maintainer_id
        )
        if not response:
            raise HTTPException(status_code=404, detail="Failed to update course.")
        return response
    except NoPermissionException as e:
        raise HTTPException(
            status_code=404, detail="User has no permission to update role"
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

course_user_role_endpoint = course_router_endpoint + "/{c_id}/users/roles"

@course_router.get(course_user_role_endpoint)
async def get_users_with_course_roles(c_id: int, request: Request):
    users = course_crud.get_users_with_course_roles(c_id)
    if not users:
        raise HTTPException(status_code=404, detail="Failed to fetch users")
    return users

@course_router.post(course_user_role_endpoint)
async def assign_user_course_role(c_id: int, curRequest: AssignCourseUserRoleReq, request: Request):
    author = request.headers.get("X-User-ID")
    if not author:
        raise HTTPException(status_code=401, detail="Missing X-User-ID header")
    
    author_user = user_crud.get_user_by_id(author)
    if not author_user:
        raise HTTPException(status_code=404, detail="Failed to find author")
    
    user = user_crud.get_user_by_id(curRequest.u_id)
    if not user:
        raise HTTPException(status_code=404, detail="Failed to find user")
    
    try:
       course = course_crud.get_course_by_id(c_id, curRequest.u_id)
    except UserNotEnrolledException as e:
        raise HTTPException(status_code=403, detail="User not enrolled in course")
    except ValueError as e:
        raise HTTPException(status_code=404, detail="Failed to find course")
    
    prev_user_course_role = course_crud.get_user_course_role_by_id(curRequest.u_id)    

    try:
        if not prev_user_course_role or not prev_user_course_role.data or len(prev_user_course_role.data) <= 0:
            prev_user_course_role = None
        else:
            prev_user_course_role = CourseUserRole.model_validate(prev_user_course_role.data[0])
    except ValidationError as e:
        prev_user_course_role = None    

    assign_response = course_crud.assign_user_course_role(c_id, curRequest, author)
    if not assign_response or not assign_response.data or len(assign_response.data) <= 0:
        raise HTTPException(status_code=500, detail="Failed to add course role to user")

    try:
        updated_user_course_role = CourseUserRole.model_validate(assign_response.data[0])
    except ValidationError as e:
        raise HTTPException(status_code=500, detail="Failed to process updated user, could not update role history")
    
    history_response = course_crud.create_user_course_role_history(updated_user_course_role, prev_user_course_role, curRequest.reason)
    if not history_response:
        return HTTPException(status_code=500, detail="Failed to update course role history")

    return assign_response
    
@course_router.patch(course_user_role_endpoint)
async def update_user_course_role(c_id: int, curRequest: AssignCourseUserRoleReq, request: Request):
    author = request.headers.get("X-User-ID")
    if not author:
        raise HTTPException(status_code=401, detail="Missing X-User-ID header")
    
    author_user = user_crud.get_user_by_id(author)
    if not author_user:
        raise HTTPException(status_code=404, detail="Failed to find author")
    
    user = user_crud.get_user_by_id(curRequest.u_id)
    if not user:
        raise HTTPException(status_code=404, detail="Failed to find user")
    
    try:
       course = course_crud.get_course_by_id(c_id, curRequest.u_id)
    except UserNotEnrolledException as e:
        raise HTTPException(status_code=403, detail="User not enrolled in course")
    except ValueError as e:
        raise HTTPException(status_code=404, detail="Failed to find course")
    
    prev_user_course_role = course_crud.get_user_course_role_by_id(curRequest.u_id)
    try:
        if not prev_user_course_role or not prev_user_course_role.data or len(prev_user_course_role.data) <= 0:
            raise HTTPException(status_code=403, detail="User does not have a course role")
        else:
            prev_user_course_role = CourseUserRole.model_validate(prev_user_course_role.data[0])
    except ValidationError as e:
        raise HTTPException(status_code=500, detail="Failed to process previous course role, did not update change role history")    
    
    update_response = course_crud.update_user_course_role(c_id, curRequest, author)
    if not update_response or not update_response.data or len(update_response.data) <= 0:
        raise HTTPException(status_code=500, detail="Failed to add course role to user")
    try:
        updated_user_course_role = CourseUserRole.model_validate(update_response.data[0])
    except ValidationError as e:
        raise HTTPException(status_code=500, detail="Failed to process updated user, could not update role history")
    
    history_response = course_crud.create_user_course_role_history(updated_user_course_role, prev_user_course_role, curRequest.reason)
    if not history_response:
        return HTTPException(status_code=500, detail="Failed to update course role history")

    return update_response