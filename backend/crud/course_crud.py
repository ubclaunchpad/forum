import json
from uuid import UUID

from ..database.db import supabase
from ..routers.req.courses_req import CreateCourseReq, RegisterUserReq, UpdateCourseReq
from fastapi.encoders import jsonable_encoder

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
        response = courses_table.select("*").execute()
        return response
    except Exception as e:
        return None

def get_course_by_id(c_id: int):
    try:
        return courses_table.select("*").eq('id', c_id).execute()
    except Exception as e:
        return None

def update_course(req: UpdateCourseReq):
    try:
        update_data = req.model_dump(exclude_none=True)
        params = jsonable_encoder(update_data)
        del params['c_id']
        response = courses_table.update(params).eq('id', req.c_id).execute()
        return response
    except Exception as e:
        return None

def delete_course(course_id: int):
    try:
        response = courses_table.delete().eq('id', course_id).execute()
        return response
    except Exception as e:
        return None


def create_course(req: CreateCourseReq):
    try:
        params = jsonable_encoder(req.model_dump(exclude_none=True))
        response = courses_table.insert(params).execute()
        return response
    except Exception as e:
        return None
