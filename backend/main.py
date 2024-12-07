import os
import sys

import uvicorn
from core.util.env_util import ENV, parse_bool_env
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.db import get_db
from routers.middleware.auth import AuthMiddleware
from routers.routes.courses import course_router
from routers.routes.documents import document_router
from routers.routes.posts import post_router
from routers.routes.users import user_router

environment = os.getenv("ENV")
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")

AUTH_MIDDLEWARE_ENABLED = parse_bool_env("AUTH_MIDDLEWARE_ENABLED", default=True)
allowed_origins = (
    ["http://localhost:3000", "http://0.0.0.0:8000", 
     "https://forumai.me", "https://forumai.me/",
     "https://forumapp.up.railway.app", "https://forumapp.up.railway.app/"]
)

app = FastAPI(dependencies=[Depends(get_db)])

app.include_router(course_router, tags=["Courses"], prefix="/courses")
app.include_router(user_router, tags=["Users"], prefix="/users")
course_router.include_router(post_router, tags=["Posts"], prefix="/{c_id}/posts")
course_router.include_router(
    document_router, tags=["Documents"], prefix="/{c_id}/documents"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add the backend folder to Python's module search path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app.add_middleware(AuthMiddleware, enabled=AUTH_MIDDLEWARE_ENABLED)

@app.middleware("http")
async def debug_request(request, call_next):
    print(f"Incoming request origin: {request.headers.get('origin')}")
    response = await call_next(request)
    return response

@app.get("/")
def root():
    """Root path"""
    return {"message": "ForumAI is running!"}


print(f"Running in {environment} environment")
print(f"Auth middleware enabled: {AUTH_MIDDLEWARE_ENABLED}")
print(f"Allowed origins: {allowed_origins}")
print(f"Port: {PORT}")
print(f"Host: {HOST}")


if __name__ == "__main__":
    uvicorn.run(
        "main:app", host=HOST, port=PORT, reload=ENV.DEV.value == environment
    )
