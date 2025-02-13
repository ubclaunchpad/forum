from typing import Any, List, Optional
from uuid import UUID

from fastapi import UploadFile
from pydantic import BaseModel


class UserBase(BaseModel):
    id: UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str


class GetUsersResponse(BaseModel):
    users: List[UserBase]
    



class CreateUserBaseRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    password: str


class CreateUserResponse(BaseModel):
    id: UUID
    email: str


class SocialLinks(BaseModel):
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    github: Optional[str] = None
    facebook: Optional[str] = None
    X: Optional[str] = None
    discord: Optional[str] = None
    youtube: Optional[str] = None
    website: Optional[str] = None
    reddit: Optional[str] = None


class UpdateUserRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    pronouns: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    socials: Optional[SocialLinks] = None
    timezone: Optional[str] = None
    display_name: Optional[str] = None
    status: Optional[str] = None


class UserProfile(BaseModel):
    id: UUID
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    pronouns: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    socials: Optional[SocialLinks] = None
    timezone: Optional[str] = None
    display_name: Optional[str] = None
    icon_url: Optional[str] = None
    status: Optional[str] = None


class FullUserProfile(UserProfile):
    roles: Any
    permissions: Any


class GetUserProfileResponse(BaseModel):
    profile: UserProfile


class UserProfilePhotoRequest(BaseModel):
    file: UploadFile

class GetAllUsersResponse(BaseModel):
    users: List[UserProfile]