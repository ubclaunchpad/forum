from fastapi import FastAPI, Depends
import uvicorn
from dotenv import load_dotenv
import os
from supabase import create_client, Client
from middleware.auth import AuthMiddleware

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = FastAPI()

# flag to enable auth middleware for ALL endpoints
AUTH_MIDDLEWARE_ENABLED = True
# endpoints that will be public (requires AUTH_MIDDLEWARE_ENABLE == True to work)
PUBLIC_PATHS = ['/']

# middlewares
app.add_middleware(AuthMiddleware, enabled=AUTH_MIDDLEWARE_ENABLED, public_paths=PUBLIC_PATHS)

@app.get("/")
def root():
    return {"message": "Hello from the backend!"}

@app.get("/protected")
def filler_protected_path(): # NOTE: delete later, used for testing
    return {"message": "Protect route!"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
