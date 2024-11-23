import json
from http.client import HTTPException
from uuid import UUID

from postgrest import APIError

from database.db import supabase
from routers.req.courses_req import CreateCourseReq, RegisterUserReq, UpdateCourseReq
from fastapi.encoders import jsonable_encoder

courses_table = supabase.table("courses")


class UserNotEnrolledException(Exception):
    pass


class NoPermissionException(Exception):
    pass


def register_course(req: RegisterUserReq):
    try:
        user_courses_entry = {"test_user_uuid": req.u_id, "course_id": req.c_id}
        return courses_table.insert(user_courses_entry).execute()
    except (ValueError, APIError) as e:
        return None


def get_courses(user_id: str):
    try:
        user_course_ids_res = (
            supabase.table("user_courses")
            .select("course_id")
            .eq("user_id", user_id)
            .execute()
        )
        user_courses_dict = user_course_ids_res.data
        user_courses_list = list(map(lambda n: n["course_id"], user_courses_dict))
        response = courses_table.select("*").in_("id", user_courses_list).execute()
        return response
    except (ValueError, APIError) as e:
        return None


def get_course_by_id(c_id: str, user_id: str):
    try:
        user_course = (
            supabase.from_("user_courses")
            .select("*")
            .eq("course_id", c_id)
            .eq("user_id", user_id)
            .execute()
        )
        if len(user_course.data) > 0:
            return courses_table.select("*").eq("id", c_id).execute()
        raise UserNotEnrolledException
    except (ValueError, APIError) as e:
        return None


def update_course(
    req: UpdateCourseReq, user_id: str, admin_role: int, maintainer_role: int
):
    try:
        course_role_res = (
            supabase.table("user_courses")
            .select("role_id")
            .eq("user_id", user_id)
            .eq("course_id", req.c_id)
            .execute()
        )
        course_role = course_role_res.data
        for role in course_role:
            if role["role_id"] == admin_role or role["role_id"] == maintainer_role:
                update_data = req.model_dump(exclude_none=True)
                params = jsonable_encoder(update_data)
                del params["c_id"]
                response = courses_table.update(params).eq("id", req.c_id).execute()
                return response
        raise NoPermissionException
    except (ValueError, APIError) as e:
        return None


def delete_course(course_id: str, user_id: str, admin_role: int):
    try:
        course_role_res = (
            supabase.table("user_courses")
            .select("role_id")
            .eq("user_id", user_id)
            .eq("course_id", course_id)
            .execute()
        )
        course_role = course_role_res.data
        for role in course_role:
            if role["role_id"] == admin_role:
                response = courses_table.delete().eq("id", course_id).execute()
                return response
        raise NoPermissionException
    except (ValueError, APIError) as e:
        return None


def create_course(req: CreateCourseReq):
    try:
        params = jsonable_encoder(req.model_dump(exclude_none=True))
        response = courses_table.insert(params).execute()
        return response
    except (ValueError, APIError) as e:
        return None


def add_user_to_course(course_id: str, user_id: str, role: int):
    try:
        params = {"user_id": user_id, "course_id": course_id, "role_id": role}
        response = supabase.table("user_courses").insert(params).execute()
        return response
    except (ValueError, APIError) as e:
        return None


def get_role_key(name: str):
    return supabase.table("course_role").select("id").eq("name", name).execute()
