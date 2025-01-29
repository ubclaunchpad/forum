from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PostBase(BaseModel):
    title: str
    content: str
    parent_id: Optional[int] = None
    created_by: UUID


class CreatePostRequest(BaseModel):
    title: str
    content: str
    parent_id: Optional[int] = None


class CreatePostResponse(PostBase):
    id: int
    applied_at: Any


class PostResponse(PostBase):
    id: int
    course_id: UUID


class PostEditBase(BaseModel):
    # post_id: UUID
    new_content: str
    edit_reason: str
    applied_at: datetime = Field(default_factory=datetime.now)


class CreatePostEditRequest(PostEditBase):
    pass


class PostEditResponse(PostEditBase):
    id: int
    edited_by: UUID


class UserPostEventBase(BaseModel):
    viewed: bool
    liked: bool
    user_id: UUID
    post_id: int


class CreateUserPostEventRequest(UserPostEventBase):
    pass


class UserPostEventResponse(UserPostEventBase):
    id: int


class GetPost(PostBase):
    id: int
    applied_at: datetime = Field(default_factory=datetime.now)


class GetPostsResponse(BaseModel):
    posts: list[GetPost]


class GetPostResponse(BaseModel):
    post: PostResponse
    stats: dict
    user_interactions: dict
