import uuid

from ..database.db import supabase

courses_table = supabase.table('courses')

def register_course(user_id, c_id):
    user_courses_entry = {
        'user_id': user_id,
        'course_id': c_id
    }
    return courses_table.insert(user_courses_entry).execute()

def get_courses():
    return courses_table.select("*")

def get_course_by_id(course_id: uuid):
    return courses_table.select("*").eq('id', course_id).execute()

def update_course(course_id: uuid, name: str = None):
    update_data = {}
    if name is not None:
        update_data["name"] = name

    if not update_data:  # no updates to do, can return early
        return
    response = courses_table.update(update_data).eq('id', course_id)
    return response


def delete_course(course_id: uuid):
    response = courses_table.delete().eq('id', course_id)
    return response


def create_course(c_group: str, c_code: str, term: str):
    response = courses_table.insert({
        "c_group": c_group,
        "c_code": c_code,
        "term": term
    }).execute()
    return response
