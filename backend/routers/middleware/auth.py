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
    def __init__(
        self, 
        app, 
        enabled: bool = True, 
        protected_paths: Optional[List[str]] = None
    ):
        super().__init__(app)
        self.enabled = enabled
        self.protected_paths = (
            ["courses/*", "users/*"] if protected_paths is None else protected_paths
        )
        # Normalize paths during initialization
        self.split_protected_paths = [
            path.strip("/").split("/") for path in self.protected_paths
        ]

    def is_path_protected(self, request_path: str) -> bool:
        """
        Check if the given path matches any protected path pattern.
        Handles exact matches and wildcard patterns (e.g., /course/*).
        
        Args:
            request_path (str): The path to check against protected paths
            
        Returns:
            bool: True if path matches any protected pattern, False otherwise
            
        Examples:
            >>> middleware = AuthMiddleware(app)
            >>> middleware.is_path_protected("/courses/123")  # True
            >>> middleware.is_path_protected("/public")      # False
        """
        # Handle empty or root path
        if not request_path or request_path == "/":
            return False
            
        # Normalize and split the request path
        request_path_segments = request_path.strip("/").split("/")
        
        # Check against each protected path pattern
        for protected_segments in self.split_protected_paths:
            # Handle empty protected path
            if not protected_segments:
                continue
                
            # Skip if lengths don't match (unless protected path ends with wildcard)
            if len(protected_segments) != len(request_path_segments):
                if not (protected_segments[-1] == "*" and 
                       len(protected_segments) <= len(request_path_segments) + 1):
                    continue
                    
            # Compare each segment
            is_match = True
            for i, protected_segment in enumerate(protected_segments):
                # Handle wildcard at the end
                if protected_segment == "*":
                    break
                    
                # If we've reached the end of request path or segments don't match
                if (i >= len(request_path_segments) or 
                    protected_segment != request_path_segments[i]):
                    is_match = False
                    break
                    
            if is_match:
                return True
                
        return False

    async def dispatch(self, request: Request, call_next):
        if not self.enabled:
            return await call_next(request)

        if request.method == "OPTIONS":
            return await call_next(request)

        if not self.is_path_protected(request.url.path):
            return await call_next(request)

        user = None
        # Development mode authentication
        if (environment == ENV.DEV.value and 
            request.headers.get("Authorization") is None and 
            login_required):
            
            logger.warning(
                "DEV_LOGIN is enabled. Using DEV_USER_EMAIL and DEV_USER_PASSWORD for authentication."
            )
            email = os.getenv("DEV_USER_EMAIL")
            password = os.getenv("DEV_USER_PASSWORD")
            
            if not email or not password:
                raise RuntimeError("DEV_USER_EMAIL and DEV_USER_PASSWORD must be set in .env")
                
            user = supabase.auth.sign_in_with_password(
                {"email": email, "password": password}
            )
            if not user:
                user = supabase.auth.sign_up({"email": email, "password": password})

        # Production authentication
        if not user and login_required:
            auth_header = request.headers.get("Authorization")
            if not auth_header:
                return Response("Unauthorized", status_code=401)
                
            try:
                bearer_token = auth_header.split("Bearer ")[1]
                user = supabase.auth.get_user(bearer_token)
            except IndexError:
                return Response("Invalid authorization header", status_code=401)
            except Exception as e:
                logger.error(f"Authentication error: {str(e)}")
                return Response("Authentication failed", status_code=401)

        if not user or not user.user:
            return Response("Unauthorized", status_code=401)

        # Set user info in request state
        request.state.user = user.user
        request.state.user_id = user.user.id
        request.state.user_email = user.user.email

        try:
            # Sign out so service key can get past Row Level Security
            supabase.auth.sign_out()
            response = await call_next(request)
            return response
        except Exception as e:
            logger.error(f"Error processing request: {str(e)}")
            return Response("Internal server error", status_code=500)