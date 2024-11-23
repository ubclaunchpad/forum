from fastapi import APIRouter, HTTPException, Request
from backend.crud import course_crud
from backend.crud.course_crud import UserNotEnrolledException, NoPermissionException
from backend.routers.req.courses_req import CreateCourseReq, UpdateCourseReq
from crud import user_crud
from crud import tags_crud
from database.db import supabase
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Request, Response

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

    return profile

@course_router.post("/courses/{course_id}/tags")
async def create_tag(course_id: str, request: Request):
    req = await request.json()
    res = tags_crud.create_tag(course_id, req)

    if not res:
        raise HTTPException(status_code=404, detail="Failed to create tag.")
    
    return res

@course_router.get("/courses/{course_id}/tags")
async def get_tags(course_id: str):
    res = tags_crud.get_tags(course_id)
    if not res:
        raise HTTPException(status_code=404, detail="Failed to get tags.")
    return res

@course_router.patch("/courses/{course_id}/tags/{tag_id}")
async def update_tag(tag_id: str, request: Request):
    req = await request.json()
    res = tags_crud.update_tag(tag_id, req)

    if not res:
        raise HTTPException(status_code=404, detail="Failed to update tag.")
    
    return res

@course_router.delete("/courses/{course_id}/tags/{tag_id}")
async def delete_tag(tag_id: str):
    res = tags_crud.delete_tag(tag_id)
    if not res:
        raise HTTPException(status_code=404, detail="Failed to delete tag.")
    return res

@course_router.get("/courses/{course_id}/tags/{tag_id}/content")
async def get_content(course_id: str, tag_id: str):
    res = tags_crud.get_content(course_id, tag_id)
    if not res:
        raise HTTPException(status_code=404, detail="Failed to get content.")
    return res

