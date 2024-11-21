from crud import user_crud, file_crud
from typing import Annotated
from fastapi import APIRouter, HTTPException, Request, Response, UploadFile, FastAPI, Form

course_router = APIRouter()


@course_router.post("/courses/register")
async def register_course():
    profile = user_crud.register_course()

    if not profile:
        raise HTTPException(status_code=404, detail="Failed to create course.")

    return profile

@course_router.post("/courses/{course_id}/documents/upload/")
async def create_file(course_id: str, file: Annotated[UploadFile, Form()]):
    file = await file_crud.handle_upload(file)
    return file

