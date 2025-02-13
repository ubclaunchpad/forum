from controllers import invite_controller
from fastapi import APIRouter, Form, Request
from models.schemas.general_schema import GeneralResponse
from models.schemas.invite_schema import (CreateInviteResponse, EmailSchema,
                                          GetInvitesResponse, InviteBase,
                                          InviteResponse)

invite_router = APIRouter()

@invite_router.post("", response_model=CreateInviteResponse)
async def create_invite(request: Request, data: EmailSchema):
    user_id = request.state.user_id
    return invite_controller.create_invite(user_id, data.email)


@invite_router.get("", response_model=GetInvitesResponse)
async def get_invites():
    return invite_controller.get_invites()


@invite_router.delete("/{email}", response_model=GeneralResponse)
async def delete_invite(email: str):
    invite_controller.delete_invite(email)

    return {"msg": "Invite deleted successfully"}
