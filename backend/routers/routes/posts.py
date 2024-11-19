from crud import post_crud
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel

post_router = APIRouter()

class Post(BaseModel):
    title: str
    content: str
    parent_id: str | None = None
    tags: list[str]

@post_router.post("/courses/{course_id}/posts")
async def create_post(course_id : str, post_info : Post):
    post = post_crud.create_post(course_id, post_info)

    return post


@post_router.get("/courses/{course_id}/posts")
async def get_posts(course_id : str, post_info : Post):
    post = post_crud.get_posts()
    return {"this" : "worked"}

@post_router.patch("/courses/{course_id}/posts")
async def update_post(course_id : str, post_info : Post):
    post = post_crud.update_post()

@post_router.delete("/courses/{course_id}/posts")
async def delete_post(course_id : str, post_info : Post):
    post = post_crud.delete_post()
