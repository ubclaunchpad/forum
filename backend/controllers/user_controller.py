from uuid import UUID

import supabase
from models.all import Profile
from models.db import get_db, supabase
from models.schemas.user_schema import CreateUserBaseRequest, CreateUserResponse
from sqlalchemy.orm import joinedload


def get_all_users():
    with get_db() as db:
        users = db.query(Profile).all()
        return users


def get_user_by_id(user_id):
    with get_db() as db:
        user = (
            db.query(Profile)
            .options(joinedload(Profile.courses))
            .filter(Profile.id == user_id)
            .first()
        )
    return user


def get_user_courses(user_id):
    user = get_user_by_id(user_id)
    if not user or not user.courses:
        return []
    return user.courses


def delete_user_by_id(user_id):
    with get_db() as db:
        user = db.query(Profile).filter(Profile.id == user_id).first()
        if not user:
            return False
        db.delete(user)
        db.flush()
        return True


def create_user(create_user_request: CreateUserBaseRequest) -> CreateUserResponse:
    with get_db() as db:
        if db.query(Profile).filter(Profile.email == create_user_request.email).first():
            raise ValueError("User already exists.")
        auth_response = supabase.auth.sign_up(
            {
                "email": create_user_request.email,
                "password": create_user_request.password,
            }
        )
        if not auth_response.user:
            raise ValueError("Failed to create user.")
        user = Profile(
            id=auth_response.user.id,
            email=create_user_request.email,
            first_name=create_user_request.first_name,
            last_name=create_user_request.last_name,
        )
        db.add(user)
        db.flush()
        return CreateUserResponse(
            id=UUID(auth_response.user.id), email=create_user_request.email
        )
