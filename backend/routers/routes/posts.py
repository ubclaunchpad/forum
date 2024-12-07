from controllers import post_controller
from fastapi import APIRouter, HTTPException, Request
from models.schemas.general_schema import GeneralResponse
from models.schemas.post_schema import (
    CreatePostRequest,
    GetPostResponse,
    GetPostsResponse,
)

post_router = APIRouter()


@post_router.post("", response_model=GeneralResponse)
async def create_post(c_id: str, post_info: CreatePostRequest, request: Request):
    user_id = request.state.user_id
    post_controller.create_post(user_id, c_id, post_info)

    return {"msg": "Post created successfully"}


@post_router.get("", response_model=GetPostsResponse)
async def get_posts(c_id: str):
    posts = post_controller.get_posts(c_id)

    return {"posts": posts}


# @post_router.get("/{post_id}", response_model=GetPostResponse)
# async def get_post(post_id: str):
#     post = post_controller.get_post(post_id)
#     return post
