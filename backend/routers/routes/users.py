import os
from typing import Optional

from controllers import user_controller
from controllers.permission_controller import UserPermissionManager
from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Request,
    Response,
    UploadFile,
)
from models.schemas.general_schema import GeneralResponse
from models.schemas.user_schema import (
    CreateUserBaseRequest,
    CreateUserResponse,
    GetUsersResponse,
    UpdateUserRequest,
    UserProfile,
)
from routers.dependencies.permissions import get_permissions_manager
from models.db import  get_db
from models.all import Profile, Invite
from gotrue.types import User

user_router = APIRouter()


@user_router.get("", response_model=GetUsersResponse)
async def get_all_users():
    users = user_controller.get_all_users()
    return {"users": users}


@user_router.get("/{user_id}")
async def get_user_by_id(
    user_id: str,
    req: Request,
    perm_manager: UserPermissionManager = Depends(get_permissions_manager),
):
    # Use passed user_id instead of from request since this endpoint gets other users
    user = await user_controller.get_user_by_id(user_id, perm_manager, False)

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return user


@user_router.get("/user/me")
async def get_profile(
    request: Request,
    perm_manager: UserPermissionManager = Depends(get_permissions_manager),
):
    user_id = request.state.user_id
    profile = await user_controller.get_user_by_id(user_id, perm_manager, True)
    if not profile:
        raise HTTPException(status_code=404, detail="Failed to find profile.")

    return profile


@user_router.delete("/{user_id}")
async def delete_user_by_id(user_id: str):
    successful_delete = user_controller.delete_user_by_id(user_id)

    if not successful_delete:
        raise HTTPException(status_code=400, detail="Failed to delete user.")

    return Response(status_code=204)


@user_router.patch("/{user_id}")
async def update_user_by_id(user_id: str, updated_fields):
    raise HTTPException(status_code=400, detail="Not implemented.")


@user_router.post("", response_model=CreateUserResponse)
async def create_user(create_user_request: CreateUserBaseRequest):
    try:
        user = user_controller.create_user(create_user_request)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to create user." + str(e))


@user_router.put("/me", response_model=UserProfile)
async def update_profile(request: Request, update_data: UpdateUserRequest):
    """Update the current user's profile."""
    try:
        print("s")
        user_id = request.state.user_id
        updated_profile = user_controller.update_user_profile(user_id, update_data)
        return updated_profile
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to update profile: {str(e)}"
        )


@user_router.post("/me/photo", response_model=GeneralResponse)
async def upload_profile_photo(request: Request, file: UploadFile = File(...)):
    """Upload/update profile photo."""
    user_id = request.state.user_id
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    valid_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    file_ext = os.path.splitext(file.filename)[1].lower()

    if not file_ext:
        raise HTTPException(status_code=400, detail="File must have an extension")

    if file_ext not in valid_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(valid_extensions)}",
        )

    if not file.content_type:
        raise HTTPException(status_code=400, detail="Content type not provided")

    valid_mimes = {"image/jpeg", "image/png", "image/gif", "image/webp"}

    if file.content_type not in valid_mimes:
        raise HTTPException(
            status_code=400, detail="File must be an image (JPEG, PNG, GIF, or WebP)"
        )

    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to read file")

    filename = f"icon_{user_id}{file_ext}"

    return user_controller.update_profile_photo(user_id, contents, filename)


@user_router.delete("/me/photo", response_model=GeneralResponse)
async def remove_profile_photo(request: Request):
    """Remove profile photo."""
    user_id = request.state.user_id
    return user_controller.delete_profile_photo(user_id)


@user_router.post("/user/finish-setup")
async def auth_callback(request: Request, data: dict):
    user: Optional[User] = request.state.user

    if not user or not user.id or not user.email:
        raise HTTPException(status_code=400, detail="User not found.")

    try:
        with get_db() as db:
            # Check if user has an invite
            invite = (
                db.query(Invite).filter(Invite.referred_email == user.email).first()
            )
            if not invite:
                raise HTTPException(
                    status_code=400, detail="No invite found for this email."
                )

            # Create profile
            user_controller.create_profile(
                user_id=user.id,
                email=user.email,
                first_name=data.get("first_name"),
                last_name=data.get("last_name"),
            )

            return {"message": "Profile created successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=400, detail="Failed to create profile." + str(e)
        )


@user_router.post("/user/status")
async def get_user_status(request: Request):
    user: Optional[User] = request.state.user

    if not user or not user.id or not user.email:
        raise HTTPException(status_code=400, detail="User not found.")

    with get_db() as db:
        # Check if user has an invite
        invite = db.query(Invite).filter(Invite.referred_email == user.email).first()
        if not invite:
            return {"status": "pending_invite"}

        # Check if user has a profile
        profile = db.query(Profile).filter(Profile.id == user.id).first()
        if not profile:
            return {"status": "pending_setup"}

        # If both exist, user is active
        return {"status": "active"}
