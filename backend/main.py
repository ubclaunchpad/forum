"""Main file for the API"""

import os
import sys

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from middleware.auth import AuthMiddleware
from routers.routes.courses import course_router
from routers.routes.users import user_router

load_dotenv()

AUTH_MIDDLEWARE_ENABLED = (
    True if os.getenv("AUTH_MIDDLEWARE_ENABLED") != "False" else False
)  # if env is missing, default to True

app = FastAPI()
app.include_router(user_router, tags=["Users"], prefix="/users")
app.include_router(course_router, tags=["Courses"], prefix="/courses")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Add the backend folder to Python's module search path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
# middlewares
app.add_middleware(AuthMiddleware, enabled=AUTH_MIDDLEWARE_ENABLED)


@app.get("/")
def root():
    """Root path"""
    return {"message": "Hello from the backend!"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
