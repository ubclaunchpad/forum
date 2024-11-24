""" Middleware for authenticating requests. """

import os
from typing import List, Optional

from core.util.env_util import ENV
from database.db import supabase
from dotenv import load_dotenv
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

load_dotenv()

environemt = os.getenv("ENV")


class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(
        self, app, enabled: bool = True, protected_paths: Optional[List[str]] = None
    ):
        super().__init__(app)
        self.enabled = enabled
        self.protected_paths = (
            ["courses", "users"] if protected_paths is None else protected_paths
        )

    def is_path_protected(self, request_path: str) -> bool:
        """
        Check if the given path matches any protected path pattern.
        Handles exact matches and wildcard patterns (e.g., /course/*).
        """
        request_path = request_path.rstrip("/")

        for protected_path in self.protected_paths:
            protected_path = protected_path.rstrip("/")

            # Handle wildcard patterns
            if protected_path.endswith("/*"):
                base_path = protected_path[:-2]  # Remove /* from the end
                if request_path.startswith(base_path):
                    return True
            # Handle exact matches
            elif request_path == protected_path:
                return True

        return False

    async def dispatch(self, request: Request, call_next):
        if environemt == ENV.DEV.value:
            email = os.getenv("DEV_USER_EMAIL")
            password = os.getenv("DEV_USER_PASSWORD")
            supabase.auth.sign_in_with_password({"email": email, "password": password})

        # check if the middleware is enabled
        if self.enabled:
            if not self.is_path_protected(request.url.path):
                return await call_next(request)
            user = supabase.auth.get_user()
            if not user:
                return Response("Unauthorized", status_code=401)

        request.state.user = user.user
        request.state.user_id = user.user.id
        request.state.user_email = user.user.email
        response = await call_next(request)
        return response
