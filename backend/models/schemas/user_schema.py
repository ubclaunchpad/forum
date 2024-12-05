from typing import List, Optional
from uuid import UUID

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
