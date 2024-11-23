from typing import Annotated, Literal

from crud import post_crud, user_crud
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from pydantic import BaseModel, Field

post_router = APIRouter()


class FilterParams(BaseModel):
    creator_email: str | None = None
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
    # Test string for user_id
    user_id = "686fa92e-696d-4bf8-9b27-1dbc626fc5e9"
    post = post_crud.create_post(user_id, course_id, post_info)

    return post


@post_router.get("/courses/{course_id}/posts")
async def get_posts(course_id: str, query: Annotated[FilterParams, Query()]):
    params = {"sort": query.sort}

    if query.creator_email:
        valid_user = user_crud.get_user_by_email(query.creator_email)
        if valid_user.count != 1:
            raise HTTPException(status_code=404, detail="User does not exist.")
        params["creator_id"] = valid_user.data[0]["id"]

    posts = post_crud.get_posts(
        course_id,
        params,
    )

    return posts


@post_router.get("/courses/{course_id}/posts/{post_id}")
async def get_post(post_id: str):
    post = post_crud.get_post(post_id)
    return post


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
