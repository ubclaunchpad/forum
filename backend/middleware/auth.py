from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, enabled: bool = True, exempt_paths: list = None):
        super().__init__(app)
        self.enabled = enabled
        self.exempt_paths = exempt_paths

    async def dispatch(self, request: Request, call_next):
        # Check if the middleware is enabled
        if self.enabled:
            # Skip authentication for exempt paths
            if request.url.path in self.exempt_paths:
                return await call_next(request)
            
            # Middleware logic goes here (e.g., authentication checks) !!!TODO!!!
            token = request.headers.get("Authorization")
            if not token:
                return Response("Unauthorized", status_code=401)

        # Proceed to the next middleware or endpoint
        response = await call_next(request)
        return response
