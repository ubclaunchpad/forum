from controllers import user_controller
from fastapi import APIRouter, HTTPException, Request, Response
from models.schemas.user_schema import (
    CreateUserBaseRequest,
    CreateUserResponse,
    GetUsersResponse,
    UpdateUserRequest,
    UserProfile,
)

user_router = APIRouter()


@user_router.get("", response_model=GetUsersResponse)
async def get_all_users():
    users = user_controller.get_all_users()
    return {"users": users}


@user_router.get("/{user_id}")
async def get_user_by_id(user_id: str, req: Request):
    user_id = req.state.user_id
    user = user_controller.get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return user


@user_router.get("/me")
async def get_profile(request: Request):
    user_id = request.state.user_id
    profile = user_controller.get_user_by_id(user_id)

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
        raise HTTPException(status_code=400, detail="Failed to create user.")


@user_router.patch("/me", response_model=UserProfile)
async def update_profile(request: Request, update_data: UpdateUserRequest):
    """Update the current user's profile."""
    try:
        user_id = request.state.user_id
        updated_profile = user_controller.update_user_profile(user_id, update_data)
        return updated_profile
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to update profile: {str(e)}"
        )
