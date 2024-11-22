from typing import Annotated, Literal

from crud import post_crud
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from pydantic import BaseModel, Field

post_router = APIRouter()


class FilterParams(BaseModel):
    creator: str | None = None
    sort: str | None = None


class Post(BaseModel):
    title: str
    content: str
    parent_id: str | None = None
    tags: list[str]


class PostEdit(BaseModel):
    new_content: str
    edit_reason: str | None = None


@post_router.post("/courses/{course_id}/posts")
async def create_post(course_id: str, post_info: Post):
    user_id = "39fdd8d4-78cd-46fd-9bdb-55d7523174c5"
    post = post_crud.create_post(user_id, course_id, post_info)

    return post


@post_router.get("/courses/{course_id}/posts")
async def get_posts(course_id: str, query: Annotated[FilterParams, Query()]):
    posts = post_crud.get_posts(course_id, query)
    return posts


@post_router.patch("/courses/{course_id}/posts/{post_id}")
async def update_post(post_edit_info: PostEdit, post_id: str):
    editor_user_id = "39fdd8d4-78cd-46fd-9bdb-55d7523174c5"
    post = post_crud.update_post(editor_user_id, post_id, post_edit_info)

    return post


@post_router.delete("/courses/{course_id}/posts/{post_id}")
async def delete_post(post_id: str):
    deletion_user_id = "39fdd8d4-78cd-46fd-9bdb-55d7523174c5"
    post = post_crud.delete_post(deletion_user_id, post_id)

    return post
