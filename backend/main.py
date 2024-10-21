from fastapi import FastAPI, Depends
import uvicorn
import os
from supabase import create_client, Client
from routers.auth import router as auth_router

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = FastAPI()

#


@app.get("/")
def root():
    return {"message": "Hello from the backend!"}


app.include_router(
    auth_router, prefix="/auth", dependencies=[Depends(lambda: supabase)]
)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
