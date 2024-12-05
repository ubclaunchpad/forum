from controllers import user_controller
from fastapi import APIRouter, HTTPException, Request, Response
from models.schemas.user_schema import (
    CreateUserBaseRequest,
    CreateUserResponse,
    GetUsersResponse,
)

user_router = APIRouter()


@user_router.get("", response_model=GetUsersResponse)
async def get_all_users():
    users = user_controller.get_all_users()
    return {"users": users}


@user_router.get("/{user_id}")
async def get_user_by_id(user_id: str):
    user_id = "266b184b-5c55-4a3e-a510-7d0dc5dd00d3"
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
    # updated_user = user_controller.update_user(user_id, updated_fields)

    # if not updated_user:
    #     raise HTTPException(status_code=400, detail="Failed to update user.")

    # return updated_user


@user_router.post("", response_model=CreateUserResponse)
async def create_user(create_user_request: CreateUserBaseRequest):
    try:
        user = user_controller.create_user(create_user_request)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to create user.")
