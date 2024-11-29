from datetime import datetime, timezone
import json
from http.client import HTTPException
from database.db import supabase
from routers.req.courses_req import (
    AssignCourseUserRoleReq,
    CourseUserRole,
    CreateCourseReq,
    RegisterUserReq,
    UpdateCourseReq,
)
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
    except Exception as e:
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
    except Exception as e:
        return None


def get_course_by_id(c_id: int, user_id: str):
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
    except ValueError as e:
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
    except ValueError as e:
        return None


def delete_course(course_id: int, user_id: str, admin_role: int):
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
    except ValueError as e:
        return None


def create_course(req: CreateCourseReq):
    try:
        params = jsonable_encoder(req.model_dump(exclude_none=True))
        response = courses_table.insert(params).execute()
        return response
    except ValueError as e:
        return None


def add_user_to_course(course_id: int, user_id: str, role: int):
    try:
        params = {"user_id": user_id, "course_id": course_id, "role_id": role}
        response = supabase.table("user_courses").insert(params).execute()
        return response
    except ValueError as e:
        return None


def get_role_key(name: str):
    return supabase.table("course_role").select("id").eq("name", name).execute()


def get_user_course_role_by_id(u_id: str, c_id: int):
    return (
        supabase.table("course_user_roles")
        .select("*")
        .eq("user_id", u_id)
        .eq("course_id", c_id)
        .execute()
    )


def get_users_with_course_roles(course_id: int):
    try:
        column_names = (
            "user_id,"
            "user_name:profiles!course_user_roles_user_id_fkey(first_name, last_name),"
            "access_role,"
            "semantic_role,"
            "updated_at,"
            "assigned_by,"
            "assigned_by_name:profiles!course_user_roles_assigned_by_fkey(first_name, last_name)"
        )
        response = (
            supabase.table("course_user_roles")
            .select(column_names)
            .eq("course_id", course_id)
            .execute()
        )
        return response
    except Exception as e:
        return None


def assign_user_course_role(course_id: int, req: AssignCourseUserRoleReq, author: str):
    row = {
        "course_id": course_id,
        "user_id": str(req.u_id),
        "access_role": req.access_role,
        "semantic_role": req.semantic_role,
        "assigned_by": author,
    }
    response = supabase.table("course_user_roles").insert(row).execute()
    return response


def update_user_course_role(course_id: int, req: AssignCourseUserRoleReq, author: str):
    row = {
        "access_role": req.access_role,
        "semantic_role": req.semantic_role,
        "assigned_by": author,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    response = (
        supabase.table("course_user_roles")
        .update(row)
        .eq("user_id", req.u_id)
        .eq("course_id", course_id)
        .execute()
    )
    return response


def create_user_course_role_history(
    new_user_course_role: CourseUserRole,
    prev_user_course_role: CourseUserRole | None,
    reason: str,
):
    prev_user_course_role_access_role = (
        prev_user_course_role.access_role if prev_user_course_role else 0
    )
    prev_user_course_role_semantic_role = (
        prev_user_course_role.semantic_role if prev_user_course_role else ""
    )

    row = {
        "course_user_role_id": str(new_user_course_role.id),
        "previous_access_role": prev_user_course_role_access_role,
        "new_access_role": new_user_course_role.access_role,
        "previous_semantic_role": prev_user_course_role_semantic_role,
        "new_semantic_role": new_user_course_role.semantic_role,
        "changed_by": str(new_user_course_role.assigned_by),
        "reason": reason,
    }
    response = supabase.table("role_changes").insert(row).execute()
    return response


def user_has_course_permissions(u_id: str, c_id: int, minimum_role: str):
    response = get_user_course_role_by_id(u_id, c_id)

    if not response or not response.data or len(response.data) <= 0:
        return False

    user_access_role = response.data[0]["access_role"]
    min_required_access_role = get_role_key(minimum_role).data[0]["id"]

    # permissions hierarchy ([1, admin], [2, maintainer], [3, member], [4, guest], [5, none])
    # user access role must be below the minimum required access role
    return user_access_role <= min_required_access_role
