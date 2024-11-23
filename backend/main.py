"""Main file for the API"""

import os
import sys

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from middleware.auth import AuthMiddleware
from routers.routes.courses import course_router
from routers.routes.documents import document_router
from routers.routes.users import user_router

app = FastAPI()
app.include_router(user_router)
app.include_router(course_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

course_router.include_router(document_router, prefix="/{course_id}", tags=["documents"])  # type: ignore


# Add the backend folder to Python's module search path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# flag to enable auth middleware for ALL endpoints
AUTH_MIDDLEWARE_ENABLED = False
# endpoints that will be public (requires AUTH_MIDDLEWARE_ENABLE == True to work)
PUBLIC_PATHS = ["/"]

# middlewares
app.add_middleware(
    AuthMiddleware, enabled=AUTH_MIDDLEWARE_ENABLED, public_paths=PUBLIC_PATHS
)


@app.get("/")
def root():
    """Root path"""
    return {"message": "Hello from the backend!"}


# @app.get("/protected")
# def filler_protected_path():  # NOTE: delete later, used for testing
#     return {"message": "Protect route!"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
