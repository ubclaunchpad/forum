from controllers import post_controller
from fastapi import APIRouter, HTTPException, Request
from models.schemas.general_schema import GeneralResponse
from models.schemas.post_schema import (
    CreatePostEditRequest,
    CreatePostRequest,
    CreateUserPostEventRequest,
    GetPostResponse,
    GetPostsResponse,
    PostResponse,
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


"""
Missing Endpoints:
- Get singlar post 
    TODO
    - Get edit history
    - Get event history
- Edit post DONE
- Delete post DONE
- View post DONE
- Like post DONE
- Get post metadata TODO

- Missing DB
    - post_impressions materialized view TODO
"""


# @post_router.get("/{p_id}", response_model=GetPostResponse)
# async def get_post(c_id: str, p_id: str):
#     post = post_controller.get_post(c_id, p_id)
#     return {"post": post, "edits": [None], "events": [None]}


@post_router.patch("", response_model=GeneralResponse)
async def update_post(c_id: str, post_edit_info: CreatePostEditRequest):
    post_controller.update_post(post_edit_info, c_id)

    return {"msg": "Post edited successfully"}


@post_router.delete("/{post_id}", response_model=GeneralResponse)
async def delete_post(post_id: str, c_id: str, request: Request):
    deletion_user_id = request.state.user_id
    post_controller.delete_post(deletion_user_id, c_id, post_id)

    return {"msg" : "Post edited successfully"}


@post_router.put("/{post_id}/view", response_model=GeneralResponse)
async def view_post(post_id: str, request: Request):
    user_id = request.state.user_id
    post_controller.view_post(user_id, post_id)
    return {"msg" : "Post viewed"}


@post_router.post("/{post_id}/like", response_model=GeneralResponse)
async def like_post(post_id: str, request: Request):
    user_id = request.state.user_id
    post_controller.like_post(user_id, post_id)
    return {"msg" : "Post liked"}


# @post_router.get("/{post_id}/metadata", response_model=PostMetadata)
# async def get_post_metadata(post_id: str):
#     post = post_controller.get_post_metadata(post_id)
#     return post
