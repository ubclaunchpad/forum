import uvicorn
from database.db import supabase
from fastapi import Depends, FastAPI
from middleware.auth import AuthMiddleware
from routers.routes.courses import course_router
from routers.routes.users import user_router
from fastapi.middleware.cors import CORSMiddleware

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
    return {"message": "Hello from the backend!"}


@app.get("/protected")
def filler_protected_path():  # NOTE: delete later, used for testing
    return {"message": "Protect route!"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
