from controllers.post_controller import PostController
from fastapi import APIRouter, Depends, HTTPException, Request
from datetime import datetime
from typing import List, Optional
from fastapi.params import Query
from models.schemas.course_schema import CourseTagsResponse
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

def get_post_controller() -> PostController:
    return PostController()

@post_router.post("", response_model=CreatePostResponse)
async def create_post(c_id: str, post_info: CreatePostRequest, request: Request,
                      post_controller_instance: PostController = Depends(get_post_controller)):
    user_id = request.state.user_id
    post = post_controller_instance.create_post(user_id, c_id, post_info)

    return post


@post_router.get("", response_model=GetPostsResponse)
async def get_posts(c_id: str,
                    keywords: Optional[List[str]] = Query(
                        None, description="List of keywords to search in title or content"
                    ),
                    tags: Optional[List[str]] = Query(
                        None, description="List of tag names to filter posts"
                    ),
                    creation_date: Optional[datetime] = Query(
                        None, description="Return posts created on or after this date"
                    ),
                    creator_id: Optional[str] = Query(
                        None, description="Filter posts by the creator's username"
                    ),
                    sort_by: Optional[str] = Query(
                        None, description="Sort posts by a given field (default sorts by applied_at descending)"
                    ),
                    page_size: Optional[int] = Query(
                        10, description="Number of posts to return per page"
                    ),
                    page_number: Optional[int] = Query(
                        1, description="Page number to return"
                    ), 
                    post_controller_instance: PostController = Depends(get_post_controller)):
    posts, has_next_page = post_controller_instance.get_posts(
        c_id,
        keywords=keywords,
        tags=tags,
        creation_date=creation_date,
        creator_id=creator_id,
        page_size=page_size,
        page_number=page_number,
        sort_by=sort_by
        )

    return {"posts": posts, "has_next_page": has_next_page}	


@post_router.get("/{post_id}", response_model=GetPostResponse)
async def get_post(c_id: str, post_id: int, request: Request, post_controller_instance: PostController = Depends(get_post_controller)):
    user_id = request.state.user_id
    post = post_controller_instance.get_post(user_id, c_id, post_id)
    return post


@post_router.patch("/{post_id}", response_model=GeneralResponse)
async def update_post(
    c_id: str, post_id: int, request: Request, post_edit_info: CreatePostEditRequest,
    post_controller_instance: PostController = Depends(get_post_controller)
):
    user_id = request.state.user_id
    post_controller_instance.update_post(c_id, user_id, post_id, post_edit_info)

    return {"msg": "Post edited successfully"}


@post_router.delete("/{post_id}", response_model=GeneralResponse)
async def delete_post(c_id: str, post_id: int, request: Request, 
                      post_controller_instance: PostController = Depends(get_post_controller)):
    user_id = request.state.user_id
    post_controller_instance.delete_post(c_id, user_id, post_id)

    return {"msg": "Post deleted successfully"}


@post_router.put("/{post_id}/events/view", response_model=GeneralResponse)
async def view_post(c_id: str, post_id: int, request: Request,
                    post_controller_instance: PostController = Depends(get_post_controller)):
    user_id = request.state.user_id
    post_controller_instance.view_post(c_id, user_id, post_id)
    return {"msg": "Post viewed"}


@post_router.post("/{post_id}/events/like", response_model=GeneralResponse)
async def like_post(c_id: str, post_id: int, request: Request, post_controller_instance: PostController = Depends(get_post_controller)):
    user_id = request.state.user_id
    post_controller_instance.like_post(c_id, user_id, post_id)
    return {"msg": "Post liked"}


@post_router.post("/{post_id}/embeddings", response_model=GeneralResponse)
async def update_embeddings(c_id: str, post_id: int, request: Request,
                            post_controller_instance: PostController = Depends(get_post_controller)):
    user_id = request.state.user_id
    return post_controller_instance.update_embeddings(c_id, user_id, post_id)


@post_router.get(
    "/{local_id}/embeddings/metadata", response_model=PostEmbeddingMetadata
)
async def get_embedding_metadata(c_id: str, local_id: int, request: Request,
                                 post_controller_instance: PostController = Depends(get_post_controller)):
    user_id = request.state.user_id
    return post_controller_instance.get_embedding_metadata(c_id, user_id, local_id)


@post_router.get("/{post_id}/tags", response_model=CourseTagsResponse)
async def get_post_tags(post_id: str, post_controller_instance: PostController = Depends(get_post_controller)):
    res = post_controller_instance.get_post_tags(post_id)
    if not res:
        raise HTTPException(status_code=400, detail="Failed to get post tags")
    return res


@post_router.post("/{post_id}/tags/{tag_id}", response_model=GeneralResponse)
async def add_post_tag(post_id: str, tag_id: str, req: Request,
                       post_controller: PostController = Depends(get_post_controller)):
    author_id = req.state.user_id
    res = post_controller_instance.add_post_tag(post_id, tag_id, author_id)
    if not res:
        raise HTTPException(status_code=400, detail="Failed to get post tag")
    return res


@post_router.delete("/{post_id}/tags/{tag_id}", response_model=GeneralResponse)
async def remove_post_tag(post_id: str, tag_id: str,
                          post_controller: PostController = Depends(get_post_controller)):    
    res = post_controller_instance.remove_post_tag(post_id, tag_id)
    if not res:
        raise HTTPException(status_code=400, detail="Failed to remove post tag")
    return res
