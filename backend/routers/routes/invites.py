from fastapi import APIRouter, Request, Form
from models.schemas.invite_schema import (
  InviteBase,
  InviteResponse,
  GetInvitesResponse,
  CreateInviteResponse,
)
from models.schemas.general_schema import GeneralResponse
from controllers import invite_controller

invite_router = APIRouter()

@invite_router.post("", response_model=CreateInviteResponse)
async def create_invite(referrer_id: str = Form(...), email: str = Form(...)):
    return invite_controller.create_invite(referrer_id, email)


@invite_router.get("", response_model=GetInvitesResponse)
async def get_invites():
    return invite_controller.get_invites()

@invite_router.delete("/{referrer_id}/{email}", response_model=GeneralResponse)
async def delete_invite(referrer_id: str, email: str):
    invite_controller.delete_invite(referrer_id, email)

    return {"msg": "Invite deleted successfully"}
