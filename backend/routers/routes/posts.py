from typing import Annotated, Literal

from crud import post_crud, user_crud
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from models.post_models import FilterParams, Post, PostEdit

post_router = APIRouter()


@post_router.post("")
async def create_post(course_id: str, post_info: Post, request: Request):
    user_id = request.state.user_id
    post = post_crud.create_post(user_id, course_id, post_info)

    return post


@post_router.get("")
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


@post_router.get("/{post_id}")
async def get_post(post_id: str):
    post = post_crud.get_post(post_id)
    return post


@post_router.patch("/{post_id}")
async def update_post(post_edit_info: PostEdit, post_id: str, request: Request):
    editor_user_id = request.state.user_id
    post = post_crud.update_post(editor_user_id, post_id, post_edit_info)

    return post


@post_router.delete("/{post_id}")
async def delete_post(post_id: str, request: Request):
    deletion_user_id = request.state.user_id
    post = post_crud.delete_post(deletion_user_id, post_id)

    return post
