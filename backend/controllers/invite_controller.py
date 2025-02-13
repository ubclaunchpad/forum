import logging
import re
from datetime import datetime

from fastapi import HTTPException
from models.all import Invite, Profile
from models.db import get_db
from models.schemas.invite_schema import (CreateInviteResponse,
                                          GetInvitesResponse, InviteBase,
                                          InviteResponse)
from pydantic import ValidationError


def is_valid_email(email):
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(pattern, email) is not None


logger = logging.getLogger(__name__)


def create_invite(referrer_id: str, email: str) -> CreateInviteResponse:
    with get_db() as db:
        if not is_valid_email(email):
            raise HTTPException(status_code=403, detail="Invalid email format")

        super_user_exists = db.query(Profile).filter(Profile.id == referrer_id).first()

        if not super_user_exists:
            raise HTTPException(
                status_code=403, detail="User is not authorized to send invites"
            )

        if db.query(Invite).filter(Invite.referred_email == email).first():
            raise ValueError("Email has already been invited.")

        invite = Invite(
            referrer_id=referrer_id,
            referred_email=email,
            invited_at=datetime.now(),
        )

        try:
            db.add(invite)
            db.flush()
            db.commit()

            return CreateInviteResponse(
                referrer_id=invite.referrer_id,
                referred_email=invite.referred_email,
                invited_at=invite.invited_at,
            )
        except Exception as e:
            db.rollback()
            raise e


def get_invites() -> GetInvitesResponse:
    try:
        with get_db() as db:
            invites = db.query(Invite).all()
            invite_list = [InviteResponse(**invite.__dict__) for invite in invites]

        return GetInvitesResponse(invites=invite_list)
    except Exception as e:
        print(f"Error in get_invites: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch invites: {str(e)}"
        )


def delete_invite(email: str):
    with get_db() as db:
        invite = (
            db.query(Invite)
            .filter(Invite.referred_email == email)
            .first()
        )
        if not invite:
            raise HTTPException(status_code=404, detail="Invite not found")
        db.delete(invite)
        db.flush()
