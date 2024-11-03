from fastapi import APIRouter, Depends, HTTPException, Request, Response

from backend.crud import user_crud
from backend.database.db import supabase

course_router = APIRouter()


@course_router.post("/courses/register")
async def register_course():
    profile = user_crud.register_course()

    if not profile:
        raise HTTPException(status_code=404, detail="Failed to create course.")

    return profile

@course_router.get("/courses/page")
async def get_courses():
    return

@course_router.post("/courses/create")
async def create_course(c_group: str, c_code: str, term: str):
    return

@course_router.delete("/courses/delete")
async def delete_course():
    return

@course_router.put("/courses/update")
async def update_course():
    return

