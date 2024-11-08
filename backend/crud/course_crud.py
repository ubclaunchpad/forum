from uuid import UUID

from ..database.db import supabase
from ..routers.req.courses_req import CreateCourseReq, RegisterUserReq, UpdateCourseReq

courses_table = supabase.table('courses')

def register_course(req: RegisterUserReq):
    try:
        user_courses_entry = {
            'user_id': req.u_id,
            'course_id': req.c_id
        }
        return courses_table.insert(user_courses_entry).execute()
    except Exception as e:
        return None

def get_courses():
    try:
        return courses_table.select("*")
    except Exception as e:
        return None

def get_course_by_id(course_id: UUID):
    try:
        return courses_table.select("*").eq('id', course_id).execute()
    except Exception as e:
        return None

def update_course(req: UpdateCourseReq):
    try:
        update_data = {}
        if req.name is not None:
            update_data["name"] = req.name

        if not update_data:  # no updates to do, can return early
            return
        response = courses_table.update(update_data).eq('id', req.c_id)
        return response
    except Exception as e:
        return None

def delete_course(course_id: UUID):
    try:
        response = courses_table.delete().eq('id', course_id)
        return response
    except Exception as e:
        return None


def create_course(req: CreateCourseReq):
    try:
        response = courses_table.insert({
            "c_group": req.c_group,
            "c_code": req.c_code,
            "term": req.term
        }).execute()
        return response
    except Exception as e:
        return None
