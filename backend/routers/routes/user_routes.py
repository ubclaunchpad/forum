from fastapi import APIRouter, Depends, HTTPException, Request, Response
from crud import user_crud

user_router = APIRouter()

# Retrieve current user's profile
@user_router.get("/users/me")
async def get_profile():
    middleware_user_id = 1
    profile = user_crud.get_user_by_id(middleware_user_id)

    if not profile:
        raise HTTPException(status_code=404, detail="Failed to find profile.")
    
    return profile

# Update current user's profile
@user_router.post("/users/me")
async def update_profile(user):
    middleware_user_id = 1
    updated_profile = user_crud.update_user(middleware_user_id, user)

    if not updated_profile:
        raise HTTPException(status_code=400, detail="Failed to update profile.")
    
    return updated_profile

# Delete current user's profile
@user_router.delete("/users/me")
async def delete_profile():
    middleware_user_id = 1
    successful_delete = user_crud.delete_user_by_id(middleware_user_id)

    if not successful_delete:
        raise HTTPException(status_code=400, detail="Failed to delete profile.")
    
    return Response(status_code=204)

# Get all users
@user_router.get("/users")
async def get_all_users():
    users = user_crud.get_all_users()
    return users

# Get user by ID
@user_router.get("/users/{user_id}}")
async def get_user_by_id(user_id: int):
    user = user_crud.get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    return user

# Update user by ID
@user_router.post("/users/{user_id}}")
async def update_user_by_id(user_id: int, updated_fields):
    updated_user = user_crud.update_user(user_id, updated_fields)

    if not updated_user:
        raise HTTPException(status_code=400, detail="Failed to update user.")
    
    return updated_user

# Delete user by id
@user_router.delete("/users/{user_id}}")
async def delete_user_by_id(user_id: int):
    successful_delete = user_crud.delete_user_by_id(user_id)

    if not successful_delete:
        raise HTTPException(status_code=400, detail="Failed to delete user.")
    
    return Response(status_code=204)

# Get user by email
@user_router.get("/users/{email}}")
async def get_user_by_email(email: str):
    user = user_crud.get_user_by_email(email)

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return user

# Get user by email
@user_router.post("/users/{email}}")
async def update_user_by_email(email: str, updated_fields):
    user = user_crud.update_user_by_email(email, updated_fields)

    if not user:
        raise HTTPException(status_code=400, detail="Failed to update user.")

    return user

# Delete user by email
@user_router.delete("/users/{email}}")
async def delete_user_by_email(email: str):
    successful_delete = user_crud.delete_user_by_email(email)

    if not successful_delete:
        raise HTTPException(status_code=400, detail="Failed to delete user.")
    
    return Response(status_code=204)
