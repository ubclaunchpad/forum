import uuid

from ..database.db import supabase


def register_course(course):
    return None

def get_courses():
    return supabase.table("courses").select("*")

def get_course_by_id(course_id: uuid):
    return supabase.table("course").select("*").eq('id', course_id).execute()

def update_course(course_id: uuid, name: str = None, max_users: int = None):
    update_data = {}
    if name is not None:
        update_data["name"] = name
    if max_users is not None:
        update_data["max_users"] = max_users

    if not update_data:  # no updates to do, can return early
        return

    response = supabase.table("courses").update(update_data).eq('id', course_id)
    return response


def delete_course(course_id: uuid):
    response = supabase.table("courses").delete().eq('id', course_id)
    return response


def create_course(c_group: str, c_code: str, term: str):
    response = supabase.table("courses").insert({
        "c_group": c_group,
        "c_code": c_code,
        "term": term
    }).execute()
    return response
