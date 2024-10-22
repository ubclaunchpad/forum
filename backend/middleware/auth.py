from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv
import os
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)


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
