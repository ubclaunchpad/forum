from enum import Enum

from pydantic import BaseModel


class Post(BaseModel):
    """Model for post metadata"""
    title: str
    content: str
    parent_id: str | None = None
    tags: list[str]


class PostEdit(BaseModel):
    """Model for post edit requests"""
    new_content: str
    edit_reason: str | None = None

class FilterParams(BaseModel):
    creator_email: str | None = None
    sort: str | None = None