from crud import post_crud
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel

post_router = APIRouter()


class Post(BaseModel):
    title: str
    content: str
    parent_id: str | None = None
    tags: list[str]


class PostEdit(BaseModel):
    post_id: str
    new_content: str
    edit_reason: str | None = None


@post_router.post("/courses/{course_id}/posts")
async def create_post(course_id: str, post_info: Post):
    user_id = "39fdd8d4-78cd-46fd-9bdb-55d7523174c5"
    post = post_crud.create_post(user_id, course_id, post_info)

    return post


@post_router.get("/courses/{course_id}/posts")
async def get_posts(course_id: str):
    posts = post_crud.get_posts(course_id)
    return posts


@post_router.patch("/courses/{course_id}/posts")
async def update_post(post_edit_info: PostEdit):
    editor_user_id = "39fdd8d4-78cd-46fd-9bdb-55d7523174c5"
    post = post_crud.update_post(editor_user_id, post_edit_info)

    return post


@post_router.delete("/courses/{course_id}/posts")
async def delete_post(post_id: str):
    post = post_crud.delete_post()
