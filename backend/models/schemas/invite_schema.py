from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class InviteBase(BaseModel):
    referrer_id: UUID
    referred_email: str


class InviteResponse(InviteBase):
    invited_at: datetime
    joined_at: Optional[datetime] = None

class GetInvitesResponse(BaseModel):
    invites: list[InviteResponse]

class CreateInviteResponse(InviteBase):
    pass