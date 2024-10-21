from fastapi import FastAPI, Depends
import uvicorn
import os
from supabase import create_client, Client
from routers.auth import router as auth_router
from middleware.auth import AuthMiddleware

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = FastAPI()

# flag to enable auth middleware for ALL endpoints
AUTH_MIDDLEWARE_ENABLED = True
# endpoints that will be public (requires AUTH_MIDDLEWARE_ENABLE == True to work)
PUBLIC_PATHS = ['/']

# middlewares
app.add_middleware(AuthMiddleware, enabled=AUTH_MIDDLEWARE_ENABLED, exempt_paths=PUBLIC_PATHS)

@app.get("/")
def root():
    return {"message": "Hello from the backend!"}

app.include_router(
    auth_router, prefix="/auth", dependencies=[Depends(lambda: supabase)]
)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
