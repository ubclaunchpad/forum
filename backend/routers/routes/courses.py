import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from backend.crud import course_crud
from backend.crud import user_crud
from backend.database.db import supabase

course_router = APIRouter()


@course_router.post("/courses/register")
async def register_course(user_id, c_id):
    profile = user_crud.register_course()

    if not profile:
        raise HTTPException(status_code=404, detail="Failed to create course.")

    return profile

@course_router.get("/courses/page")
async def get_courses():
    courses = course_crud.get_courses()

    if not courses:
        raise HTTPException(status_code=404, detail="Failed to create course.")

    return courses

@course_router.post("/courses/create")
async def create_course(c_group: str, c_code: str, term: str):
    course = course_crud.create_course(c_group, c_code, term)
    if not course:
        raise HTTPException(status_code=404, detail="Failed to create course.")
    return course

@course_router.delete("/courses/delete")
async def delete_course(c_id: uuid):
    response = course_crud.delete_course(c_id)
    if not response:
        raise HTTPException(status_code=404, detail="Failed to create course.")
    return response

@course_router.put("/courses/update")
async def update_course(c_id: uuid, name: str):
    response = course_crud.update_course(c_id, name)
    if not response:
        raise HTTPException(status_code=404, detail="Failed to create course.")
    return response


