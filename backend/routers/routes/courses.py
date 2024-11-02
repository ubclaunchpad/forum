from fastapi import APIRouter, Depends, HTTPException, Request, Response

from backend.crud import user_crud

course_router = APIRouter()


@course_router.post("/courses/register")
async def register_course():
    profile = user_crud.register_course()

    if not profile:
        raise HTTPException(status_code=404, detail="Failed to create course.")

    return profile
