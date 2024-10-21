from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from fastapi import Request
import jwt  # Example for JWT authentication

# Define your secret key for decoding JWT tokens
SECRET_KEY = "your_secret_key"

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Extract the Authorization header
        auth_header = request.headers.get("Authorization")
        
        if auth_header:
            try:
                # Assume token is sent in format "Bearer <token>"
                token = auth_header.split(" ")[1]
                # Decode the token using the secret key (add error handling for expired tokens, etc.)
                payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                
                # Attach user info to the request state for use in the route
                request.state.user = payload["sub"]  # Assuming 'sub' contains user identifier
            except (IndexError, jwt.DecodeError, jwt.ExpiredSignatureError):
                return JSONResponse({"detail": "Invalid or expired token"}, status_code=401)
        else:
            return JSONResponse({"detail": "Authorization header missing"}, status_code=401)
        
        # Proceed to the next middleware or request handler
        response = await call_next(request)
        return response
