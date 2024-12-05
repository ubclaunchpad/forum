"""Middleware for authenticating requests."""

import logging
import os
from typing import List, Optional

from core.util.env_util import ENV, parse_bool_env
from fastapi import Request, Response
from models.db import supabase
from starlette.middleware.base import BaseHTTPMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

environment = os.getenv("ENV")
login_required = parse_bool_env("DEV_LOGIN", default=True)


class AuthMiddleware(BaseHTTPMiddleware):
    """Middleware for authenticating requests."""

    def __init__(
        self, app, enabled: bool = True, protected_paths: Optional[List[str]] = None
    ):
        super().__init__(app)
        self.enabled = enabled
        self.protected_paths = (
            ["courses", "users"] if protected_paths is None else protected_paths
        )
        self.split_protected_paths = [path.split("/") for path in self.protected_paths]

    def is_path_protected(self, request_path: str) -> bool:
        """
        Check if the given path matches any protected path pattern.
        Handles exact matches and wildcard patterns (e.g., /course/*).
        """
        request_path_list = request_path.split("/")
        for protected_path in self.split_protected_paths:
            for i, _ in enumerate(protected_path):
                if protected_path[i] != request_path_list[i]:
                    break
            return True
        return False

    async def dispatch(self, request: Request, call_next):
        if not self.enabled:
            return await call_next(request)

        user = None
        # The following block is for development purposes only in pure backend mode
        if (
            environment == ENV.DEV.value
            and request.headers.get("Authorization") is None
        ):
            logger.warning(
                msg="DEV_LOGIN is enabled. Using DEV_USER_EMAIL and DEV_USER_PASSWORD for authentication."
            )
            email = os.getenv("DEV_USER_EMAIL")
            password = os.getenv("DEV_USER_PASSWORD")
            if not email or not password:
                exit("DEV_USER_EMAIL and DEV_USER_PASSWORD must be set in .env")
            user = supabase.auth.sign_in_with_password(
                {"email": email, "password": password}
            )
            if not user:
                user = supabase.auth.sign_up({"email": email, "password": password})

        if not user:
            if not self.is_path_protected(request.url.path):
                print("not protected")
                return await call_next(request)
            if login_required:
                auth_header = request.headers.get("Authorization")
                if not auth_header:
                    return Response("Unauthorized", status_code=401)
                bearer_token = auth_header.split("Bearer ")[1]
                user = supabase.auth.get_user(bearer_token)
                if not user:
                    return Response("Unauthorized", status_code=401)

        if not user or not user.user:
            return Response("Unauthorized", status_code=401)

        request.state.user = user.user
        request.state.user_id = user.user.id
        request.state.user_email = user.user.email

        # Sign out so service key can get past Row Level Security
        supabase.auth.sign_out()
        response = await call_next(request)
        return response
