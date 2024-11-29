""" Middleware for authenticating requests. """

import os
from typing import List, Optional

from core.util.env_util import ENV
from database.db import supabase
from dotenv import load_dotenv
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

load_dotenv()

environment = os.getenv("ENV")


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
        request_path = request_path.split("/")
        for protected_path in self.split_protected_paths:
            for i, _ in enumerate(protected_path):
                if protected_path[i] != request_path[i]:
                    break
            return True
        return False

    async def dispatch(self, request: Request, call_next):
        user = None
        if environment == ENV.DEV.value:
            email = os.getenv("DEV_USER_EMAIL")
            password = os.getenv("DEV_USER_PASSWORD")
            user = supabase.auth.sign_in_with_password(
                {"email": email, "password": password}
            )

        # check if the middleware is enabled
        if self.enabled:
            if not self.is_path_protected(request.url.path):
                print("not protected")
                return await call_next(request)
            bearer_token = request.headers.get("Authorization").split("Bearer ")[1]
            user = supabase.auth.get_user(bearer_token)
            if not user:
                return Response("Unauthorized", status_code=401)
        request.state.user = user.user
        request.state.user_id = user.user.id
        request.state.user_email = user.user.email
        # Sign out to get through row level security
        supabase.auth.sign_out()
        response = await call_next(request)
        return response
