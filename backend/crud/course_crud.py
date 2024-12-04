from database.db import supabase
from fastapi.encoders import jsonable_encoder
from postgrest import APIError
from routers.req.courses_req import CreateCourseReq, RegisterUserReq, UpdateCourseReq

courses_table = supabase.table("courses")


class UserNotEnrolledException(Exception):
    pass


class NoPermissionException(Exception):
    pass


def register_course(req: RegisterUserReq):
    try:
        user_courses_entry = {"test_user_uuid": req.u_id, "course_id": req.c_id}
        return courses_table.insert(user_courses_entry).execute()
    except (ValueError, APIError) as _:
        return None


def get_courses(user_id: str = None):
    try:
        table_name = "courses" if user_id is None else "courses_query"
        base_query = supabase.table(table_name).select(
            "id", "c_group", "code", "section", "start_date", "name"
        )
        if user_id:
            base_query = base_query.eq("user_id", user_id)
        response = base_query.execute()
        return response
    except (ValueError, APIError) as _:
        return None


def get_course_by_id(c_id: str, user_id: str = None):
    try:
        table_name = "courses" if user_id is None else "courses_query"
        base_query = (
            supabase.table(table_name)
            .select("id", "c_group", "code", "section", "start_date", "name")
            .eq("id", c_id)
        )
        if user_id is not None:
            base_query = base_query.eq("user_id", user_id)
        response = base_query.execute()
        return response
    except (ValueError, APIError) as _:
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
    except (ValueError, APIError) as _:
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
    except (ValueError, APIError) as _:
        return None


def create_course(req: CreateCourseReq):
    try:
        params = jsonable_encoder(req.model_dump(exclude_none=True))
        response = courses_table.insert(params).execute()
        return response
    except (ValueError, APIError) as _:
        return None


def add_user_to_course(course_id: str, user_id: str, role: int):
    try:
        params = {"user_id": user_id, "course_id": course_id, "role_id": role}
        response = supabase.table("user_courses").insert(params).execute()
        return response
    except (ValueError, APIError) as _:
        return None


def get_role_key(name: str):
    try:
        query = supabase.table("course_role").select("id").eq("name", name)
        response = query.execute()
        return response
    except (ValueError, APIError) as e:
        raise e
