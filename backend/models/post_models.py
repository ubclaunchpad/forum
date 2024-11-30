import re
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, field_validator


class Post(BaseModel):
    """Model for post metadata"""

    title: str
    content: str
    parent_id: UUID | None = None
    tags: list[str]

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str):
        if len(v) < 5:
            raise ValueError(f"Title must be at least 5 characters long")
        return v

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str):
        if len(v) < 1:
            raise ValueError(f"Post must contain content")
        return v

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: list[str]):
        pattern = r"^[a-zA-Z0-9]+(\/[a-zA-Z0-9]+)?$"
        for tag in v:
            if not re.fullmatch(pattern, tag):
                raise ValueError(f"Invalid tag: {tag}")
        return v


class PostEdit(BaseModel):
    """Model for post edit requests"""

    new_content: str
    edit_reason: str | None = None


class FilterParams(BaseModel):
    """Model for query params used for filtering getting posts"""

    creator_email: str | None = None
    sort: str | None = None


class PostResponse(BaseModel):
    """Model for post responses"""

    id: UUID
    title: str
    course_id: UUID
    content: str
    parent_id: UUID | None = None
    created_by: UUID
    status: str
    applied_at: datetime


class PostMetadata(BaseModel):
    """Modle for getting post metadata"""

    post_id: UUID
    like_count: int
