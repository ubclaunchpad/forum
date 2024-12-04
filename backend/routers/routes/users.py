from crud import user_crud
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel

user_router = APIRouter()


class User(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    role: int


class UserID(BaseModel):
    id: str


@user_router.put("/users/create-user")
async def create_user(user_info: User):
    profile = user_crud.create_user(user_info)
    return profile


# Retrieve current user's profile
@user_router.get("/users/me")
async def get_profile(user_id: UserID):
    profile = user_crud.get_user_by_id(user_id)

    if not profile:
        raise HTTPException(status_code=404, detail="Failed to find profile.")

    return profile


# Delete current user's profile
@user_router.delete("/users/me")
async def delete_profile(user_id: UserID):
    # Requires service_role key to delete user (admin permissions)
    successful_delete = user_crud.delete_user_by_id(user_id.id)

    if not successful_delete:
        raise HTTPException(status_code=400, detail="Failed to delete profile.")

    return Response(status_code=204)


# Update current user's profile
@user_router.post("/users/me")
async def update_profile(user_info: User):
    middleware_user_id = 1
    updated_profile = user_crud.update_user(middleware_user_id, user_info)

    if not updated_profile:
        raise HTTPException(status_code=400, detail="Failed to update profile.")

    return updated_profile


# Get all users
@user_router.get("/users")
async def get_all_users():
    users = user_crud.get_all_users()
    return users


# Get user by ID
@user_router.get("/users/{user_id}")
async def get_user_by_id(user_id: str):
    user = user_crud.get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return user


# Update user by ID
@user_router.post("/users/{user_id}")
async def update_user_by_id(user_id: int, updated_fields):
    updated_user = user_crud.update_user(user_id, updated_fields)

    if not updated_user:
        raise HTTPException(status_code=400, detail="Failed to update user.")

    return updated_user


# Delete user by id
@user_router.delete("/users/{user_id}")
async def delete_user_by_id(user_id: int):
    successful_delete = user_crud.delete_user_by_id(user_id)

    if not successful_delete:
        raise HTTPException(status_code=400, detail="Failed to delete user.")

    return Response(status_code=204)


# Get user by email
@user_router.get("/users/email/{email}")
async def get_user_by_email(email: str):
    user = user_crud.get_user_by_email(email)

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return user


# Get user by email
@user_router.post("/users/email/{email}}")
async def update_user_by_email(email: str, updated_fields):
    user = user_crud.update_user_by_email(email, updated_fields)

    if not user:
        raise HTTPException(status_code=400, detail="Failed to update user.")

    return user


# Delete user by email
@user_router.delete("/users/email/{email}}")
async def delete_user_by_email(email: str):
    successful_delete = user_crud.delete_user_by_email(email)

    if not successful_delete:
        raise HTTPException(status_code=400, detail="Failed to delete user.")

    return Response(status_code=204)
