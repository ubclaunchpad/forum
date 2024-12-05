from typing import Annotated

from controllers.old import user_crud
from fastapi import APIRouter, HTTPException, Query, Request
from controllers.old import post_crud
from models.post_models import FilterParams, Post, PostEdit, PostMetadata, PostResponse

post_router = APIRouter()


@post_router.post("", response_model=PostResponse)
async def create_post(course_id: str, post_info: Post, request: Request):
    user_id = request.state.user_id
    post = post_crud.create_post(user_id, course_id, post_info)

    return post


@post_router.get("", response_model=list[PostResponse])
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


@post_router.get("/{post_id}", response_model=PostResponse)
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


@post_router.put("/{post_id}/view")
async def view_post(post_id: str, request: Request):
    user_id = request.state.user_id
    post = post_crud.view_post(user_id, post_id)
    return post


@post_router.post("/{post_id}/like")
async def like_post(post_id: str, request: Request):
    user_id = request.state.user_id
    post = post_crud.like_post(user_id, post_id)
    return post


@post_router.get("/{post_id}/metadata", response_model=PostMetadata)
async def get_post_metadata(post_id: str):
    post = post_crud.get_post_metadata(post_id)
    return post
