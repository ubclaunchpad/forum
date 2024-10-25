from fastapi import APIRouter, Depends, HTTPException, Request

user_router = APIRouter()


# Retrieve current user's profile
@user_router.get("/users/me")
async def get_profile():
    return None


# Update current user's profile
@user_router.post("/users/me")
async def update_profile():
    return None


# Delete current user's profile
@user_router.delete("/users/me")
async def delete_profile():
    return None


# Get all users
@user_router.get("/users")
async def get_all_users():
    return None


# Get user by ID
@user_router.get("/users/{user_id}}")
async def get_user_by_id(user_id: int):
    return None


# Update user by id
@user_router.post("/users/{user_id}}")
async def update_user_by_id(user_id: int):
    return None


# Delete user by id
@user_router.delete("/users/{user_id}}")
async def delete_user_by_id(user_id: int):
    return None


# Get user by email
@user_router.get("/users/{email}}")
async def get_user_by_email(email: str):
    return None


# Update user by email
@user_router.post("/users/{email}}")
async def update_user_by_email(email: str):
    return None


# Delete user by email
@user_router.delete("/users/{email}}")
async def delete_user_by_email(email: str):
    return None
