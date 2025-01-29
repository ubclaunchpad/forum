from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PostBase(BaseModel):
    title: str
    content: str
    created_by: UUID


class CreatePostRequest(BaseModel):
    title: str
    content: str


class CreatePostResponse(PostBase):
    id: UUID
    local_id: int
    applied_at: Any

 
class PostResponse(PostBase):
    id: UUID
    local_id: int
    course_id: UUID


class PostEditBase(BaseModel):
    new_content: str
    edit_reason: str
    applied_at: datetime = Field(default_factory=datetime.now)


class CreatePostEditRequest(PostEditBase):
    pass


class PostEditResponse(PostEditBase):
    id: UUID 
    edited_by: UUID
    post_id: UUID


class UserPostEventBase(BaseModel):
    viewed: bool
    liked: bool
    user_id: UUID
    post_id: UUID


class CreateUserPostEventRequest(UserPostEventBase):
    pass


class UserPostEventResponse(UserPostEventBase):
    id: UUID

class GetPost(PostBase):
    id: UUID
    local_id: int
    applied_at: datetime = Field(default_factory=datetime.now)
    status: Optional[str] = None 


class GetPostsResponse(BaseModel):
    posts: list[GetPost]


class GetPostResponse(BaseModel):
    post: PostResponse
    stats: dict
    user_interactions: dict


class PostEmbeddingMetadata(BaseModel):
    last_updated: datetime
    chunk_count: int
    has_embeddings: bool
    