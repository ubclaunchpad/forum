"""Main file for the API"""

import os
import sys

import uvicorn
from core.util.env_util import ENV, parse_bool_env
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import supabase
from middleware.auth import AuthMiddleware
from routers.routes.courses import course_router
from routers.routes.documents import document_router
from routers.routes.posts import post_router
from routers.routes.users import user_router

load_dotenv()

environment = os.getenv("ENV")

AUTH_MIDDLEWARE_ENABLED = parse_bool_env("AUTH_MIDDLEWARE_ENABLED", default=True)
allowed_origins = (
    ["http://localhost:3000", "http://0.0.0.0:8000"]
    if environment == ENV.DEV.value
    else []
)

app = FastAPI()

# Sub-routers
app.include_router(user_router, tags=["Users"], prefix="/users")
app.include_router(course_router, tags=["Courses"], prefix="/courses")

# Nested routers
course_router.include_router(
    document_router, tags=["Documents"], prefix="/{course_id}/documents"
)
course_router.include_router(post_router, tags=["Posts"], prefix="/{course_id}/posts")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add the backend folder to Python's module search path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


app.add_middleware(AuthMiddleware, enabled=AUTH_MIDDLEWARE_ENABLED)


# For use on Postman to login for a specific user, postman will save token as auth bearer token for requests
@app.post("/login")
def login(email: str, password: str):
    response = supabase.auth.sign_in_with_password(
        {"email": email, "password": password}
    )
    return response


if __name__ == "__main__":
    uvicorn.run(
        "main:app", host="0.0.0.0", port=8000, reload=ENV.DEV.value == environment
    )
