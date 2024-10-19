from fastapi import FastAPI
import uvicorn
import os

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from supabase import Client, create_client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Hello from the backend!"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
