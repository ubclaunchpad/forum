from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from backend.database.db import supabase


class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, enabled: bool = True, public_paths: list = None):
        super().__init__(app)
        self.enabled = enabled
        self.public_paths = public_paths

    async def dispatch(self, request: Request, call_next):
        # check if the middleware is enabled
        if self.enabled:
            if request.url.path in self.public_paths:
                return await call_next(request)
            user = supabase.auth.get_user()
            if not user:
                return Response("Unauthorized", status_code=401)
        # proceed to the next middleware or endpoint
        response = await call_next(request)
        return response
