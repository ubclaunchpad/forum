from fastapi import FastAPI

app = FastAPI()
items = []
@app.get("/")
def root():
    return {"message": "Hello"}

@app.post("/items")
def create_item(item: str):
    items.append(item)
    return {"message" : items}