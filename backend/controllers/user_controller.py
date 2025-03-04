import os
from datetime import datetime
from typing import List, Optional, Union
from uuid import UUID

from controllers.permission_controller import UserPermissionManager
from core.util.file_storage import ConflictResolution, FileStorage
from fastapi import HTTPException
from models.all import Course, Invite, Profile
from models.db import get_db, supabase
from models.schemas.general_schema import GeneralResponse
from models.schemas.user_schema import (
    CreateUserBaseRequest,
    CreateUserResponse,
    FullUserProfile,
    SocialLinks,
    UpdateUserRequest,
    UserProfile,
)
from sqlalchemy import Text, delete, select, text
from sqlalchemy.orm import joinedload


def get_all_users() -> List[UserProfile]:
    """Get all users with their profile information."""
    with get_db() as db:
        users = db.query(Profile).all()

        return [
            UserProfile(
                id=UUID(str(user.id)),
                email=getattr(user, "email"),
                first_name=getattr(user, "first_name", None),
                last_name=getattr(user, "last_name", None),
                pronouns=getattr(user, "pronouns", None),
                username=getattr(user, "username", None),
                bio=getattr(user, "bio", None),
                socials=SocialLinks(**getattr(user, "socials"))
                if getattr(user, "socials")
                else None,
                timezone=getattr(user, "timezone", None),
                display_name=getattr(user, "display_name", None),
                icon_url=getattr(user, "icon_url", None),
            )
            for user in users
        ]


async def get_user_by_id(
    user_id: str,
    perm_manager: UserPermissionManager,
    full: bool = False,
) -> Optional[Union[UserProfile, FullUserProfile]]:
    """
    Get a single user by ID with their profile information.
    Returns FullUserProfile if full=True, otherwise returns UserProfile.
    """
    with get_db() as db:
        stmt = select(Profile).where(Profile.id == user_id)
        user = db.execute(stmt).scalar_one_or_none()

        if not user:
            return None

        # Get roles and permissions only if full profile is requested
        user_roles = None
        if full:
            roles_data = await perm_manager.get_user_roles_and_permissions(
                db, user_id=UUID(user_id)
            )
            user_roles = roles_data

        # Create base profile data
        profile_data = {
            "id": UUID(str(user.id)),
            "email": getattr(user, "email"),
            "first_name": getattr(user, "first_name", None),
            "last_name": getattr(user, "last_name", None),
            "pronouns": getattr(user, "pronouns", None),
            "username": getattr(user, "username", None),
            "bio": getattr(user, "bio", None),
            "timezone": getattr(user, "timezone", None),
            "display_name": getattr(user, "display_name", None),
            "icon_url": getattr(user, "icon_url", None),
        }

        if full and user_roles is not None:
            return FullUserProfile(
                **profile_data,
                roles=user_roles["roles"],
                permissions=user_roles["permissions"],
            )
        else:
            return UserProfile(**profile_data)


def get_user_courses(user_id: str) -> List[Course]:
    """Get all courses for a user using the user_courses association."""
    with get_db() as db:
        user = (
            db.query(Profile)
            .options(joinedload(Profile.courses))
            .filter(Profile.id == user_id)
            .first()
        )

        if not user or not user.courses:
            return []

        return user.courses


def delete_user_by_id(user_id):
    with get_db() as db:
        db.execute(
            text("DELETE FROM auth.users WHERE id = :user_id"), {"user_id": user_id}
        )
        return True


def create_profile(
    user_id: str,
    email: Optional[str],
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
) -> Profile:
    """Create a new profile for a user."""
    with get_db() as db:
        # Check if profile already exists
        existing_profile = db.execute(
            select(Profile).where(Profile.id == user_id)
        ).scalar_one_or_none()
        if existing_profile:
            return existing_profile

        if not email:
            raise ValueError("Email is required to create a profile")

        print(first_name, last_name)
        # Create new profile
        profile = Profile(
            id=user_id,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )
        db.add(profile)
        db.commit()
        return profile


def create_user(create_user_request: CreateUserBaseRequest) -> CreateUserResponse:
    with get_db() as db:
        # if db.query(Profile).filter(Profile.email == create_user_request.email).first():
        #     raise ValueError("User already exists.")
        # invite = (
        #     db.query(Invite)
        #     .filter(Invite.referred_email == create_user_request.email)
        #     .first()
        # )
        # if invite == None:
        #     raise ValueError("Email has not been invited")
        auth_response = supabase.auth.sign_up(
            {
                "email": create_user_request.email,
                "password": create_user_request.password,
            }
        )
        if not auth_response.user:
            raise ValueError("Failed to create user.")

        # Create profile
        user = create_profile(
            user_id=auth_response.user.id,
            email=create_user_request.email,
            first_name=create_user_request.first_name,
            last_name=create_user_request.last_name,
        )

        db.add(user)
        # Create invite
        # setattr(invite, "joined_at", datetime.now())
        db.commit()

        return CreateUserResponse(
            id=UUID(auth_response.user.id), email=create_user_request.email
        )


def update_user_profile(user_id: str, update_data: UpdateUserRequest) -> UserProfile:
    """Update user profile in public.profiles table."""
    with get_db() as db:
        try:
            user = db.query(Profile).filter(Profile.id == user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            if update_data.username is not None:
                existing_user = (
                    db.query(Profile)
                    .filter(
                        Profile.username == update_data.username, Profile.id != user_id
                    )
                    .first()
                )
                if existing_user:
                    raise HTTPException(
                        status_code=400, detail="Username already taken"
                    )

            # Convert socials to dict if present
            update_dict = update_data.model_dump(exclude_unset=True)
            if "socials" in update_dict and update_dict["socials"]:
                update_dict["socials"] = update_dict["socials"].model_dump(
                    exclude_unset=True
                )

            # Update attributes
            for key, value in update_dict.items():
                setattr(user, key, value)

            db.commit()
            social_data = getattr(user, "socials") if getattr(user, "socials") else {}
            social_links = SocialLinks(**social_data) if social_data else None

            return UserProfile(
                id=UUID(str(user.id)),
                email=getattr(user, "email"),
                first_name=getattr(user, "first_name", None),
                last_name=getattr(user, "last_name", None),
                pronouns=getattr(user, "pronouns", None),
                username=getattr(user, "username", None),
                bio=getattr(user, "bio", None),
                socials=social_links,
                timezone=getattr(user, "timezone", None),
                display_name=getattr(user, "display_name", None),
            )
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500, detail=f"Failed to update profile: {str(e)}"
            )


def update_profile_photo(
    user_id: str, file_content: bytes, filename: str
) -> GeneralResponse:
    """Update user's profile photo."""
    with get_db() as db:
        try:
            user = db.query(Profile).filter(Profile.id == user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            old_id = getattr(user, "icon_url")

            # Initialize storage
            storage = FileStorage(
                bucket_name="profiles",
                conflict_resolution=ConflictResolution.APPEND_TIMESTAMP,
            )

            # Store file with user_id as prefix
            file_ext = os.path.splitext(filename)[1]
            storage_path = f"{user_id}{file_ext}"
            file_path = storage.store_file(file_content, storage_path)

            # Update user's icon_url
            icon_url = storage.format_public_file_url(file_path)

            storage.delete_file(old_id)
            setattr(user, "icon_url", icon_url)

            db.commit()

            return GeneralResponse(
                msg="Profile photo updated successfully",
                properties={"icon_url": icon_url},
            )
        except Exception as e:
            print(e)
            db.rollback()
            raise HTTPException(
                status_code=500, detail=f"Failed to update profile photo: {str(e)}"
            )


def delete_profile_photo(user_id: str) -> GeneralResponse:
    """Remove user's profile photo."""
    with get_db() as db:
        try:
            user = db.query(Profile).filter(Profile.id == user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            if getattr(user, "icon_url"):
                storage = FileStorage(bucket_name="profiles")

                # Extract filename from URL
                file_path = user.icon_url.split("/")[-1]
                storage.delete_file(file_path)

                setattr(user, "icon_url", None)
                db.commit()

            return GeneralResponse(msg="Profile photo removed successfully")

        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500, detail=f"Failed to delete profile photo: {str(e)}"
            )
