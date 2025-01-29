from controllers import post_controller
from fastapi import APIRouter, HTTPException, Request
from models.schemas.general_schema import GeneralResponse
from models.schemas.post_schema import (
    CreatePostEditRequest,
    CreatePostRequest,
    CreatePostResponse,
    CreateUserPostEventRequest,
    GetPostResponse,
    GetPostsResponse,
    PostEmbeddingMetadata,
    PostResponse,
)

post_router = APIRouter()


@post_router.post("", response_model=CreatePostResponse)
async def create_post(c_id: str, post_info: CreatePostRequest, request: Request):
    user_id = request.state.user_id
    post = post_controller.create_post(user_id, c_id, post_info)

    return post


@post_router.get("", response_model=GetPostsResponse)
async def get_posts(c_id: str):
    posts = post_controller.get_posts(c_id)

    return {"posts": posts}


@post_router.get("/{post_id}", response_model=GetPostResponse)
async def get_post(c_id: str, post_id: int, request: Request):
    user_id = request.state.user_id
    post = post_controller.get_post(user_id, c_id, post_id)
    return post


@post_router.patch("/{post_id}", response_model=GeneralResponse)
async def update_post(
    c_id: str, post_id: int, request: Request, post_edit_info: CreatePostEditRequest
):
    user_id = request.state.user_id
    post_controller.update_post(c_id, user_id, post_id, post_edit_info)

    return {"msg": "Post edited successfully"}


@post_router.delete("/{post_id}", response_model=GeneralResponse)
async def delete_post(c_id: str, post_id: int, request: Request):
    user_id = request.state.user_id
    post_controller.delete_post(c_id, user_id, post_id)

    return {"msg": "Post deleted successfully"}


@post_router.put("/{post_id}/events/view", response_model=GeneralResponse)
async def view_post(c_id: str, post_id: int, request: Request):
    user_id = request.state.user_id
    post_controller.view_post(c_id, user_id, post_id)
    return {"msg": "Post viewed"}


@post_router.post("/{post_id}/events/like", response_model=GeneralResponse)
async def like_post(c_id: str, post_id: int, request: Request):
    user_id = request.state.user_id
    post_controller.like_post(c_id, user_id, post_id)
    return {"msg": "Post liked"}


@post_router.post("/{post_id}/embeddings", response_model=GeneralResponse)
async def update_embeddings(c_id: str, post_id: int, request: Request):
    user_id = request.state.user_id
    return post_controller.update_embeddings(c_id, user_id, post_id)


@post_router.get(
    "/{local_id}/embeddings/metadata", response_model=PostEmbeddingMetadata
)
async def get_embedding_metadata(c_id: str, local_id: int, request: Request):
    user_id = request.state.user_id
    return post_controller.get_embedding_metadata(c_id, user_id, local_id)
