from crud import user_crud
from crud import tags_crud
from database.db import supabase
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Request, Response

course_router = APIRouter()


@course_router.post("/courses/register")
async def register_course():
    profile = user_crud.register_course()

    if not profile:
        raise HTTPException(status_code=404, detail="Failed to create course.")

    return profile

@course_router.post("/courses/{course_id}/tags")
async def create_tag(course_id: str, request: Request):
    req = await request.json()
    res = tags_crud.create_tag(course_id, req)

    if not res:
        raise HTTPException(status_code=404, detail="Failed to create tag.")
    
    return res

@course_router.get("/courses/{course_id}/tags")
async def get_tags(course_id: str):
    res = tags_crud.get_tags(course_id)
    if not res:
        raise HTTPException(status_code=404, detail="Failed to get tags.")
    return res

@course_router.patch("/courses/{course_id}/tags/{tag_id}")
async def update_tag(tag_id: str, request: Request):
    req = await request.json()
    res = tags_crud.update_tag(tag_id, req)

    if not res:
        raise HTTPException(status_code=404, detail="Failed to update tag.")
    
    return res

@course_router.delete("/courses/{course_id}/tags/{tag_id}")
async def delete_tag(tag_id: str):
    res = tags_crud.delete_tag(tag_id)
    if not res:
        raise HTTPException(status_code=404, detail="Failed to delete tag.")
    return res

@course_router.get("/courses/{course_id}/tags/{tag_id}/content")
async def get_content(course_id: str, tag_id: str):
    res = tags_crud.get_content(course_id, tag_id)
    if not res:
        raise HTTPException(status_code=404, detail="Failed to get content.")
    return res

