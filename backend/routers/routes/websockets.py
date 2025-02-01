import json
from typing import List

from controllers import websocket_controller
from fastapi import APIRouter, Query, Request, WebSocket, WebSocketDisconnect
from models.schemas import message_schema
from pydantic import BaseModel


class Item(BaseModel):
    user_id : str
    users: List[str]


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

web_router = APIRouter()
manager = ConnectionManager()


@web_router.get("/chat/userChannels")
async def getUserChannels(user_id: str):
    channels = websocket_controller.getUserChannels(user_id)
    return [channel.channel_id for channel in channels]


@web_router.get("/chat/{channel_id}/history")
async def getMessageHistory(channel_id: str):
    messages = websocket_controller.getMessageHistory(channel_id)
    return messages

@web_router.post("/chat/userChannels")
async def createNewChannel(item: Item, request: Request):
    print(request.state)
    res = websocket_controller.createChannel(item.user_id, item.users)
    return res


@web_router.websocket("/ws/chat/{channel_id}")
async def websocket_endpoint(websocket: WebSocket, channel_id: str, id : str = Query(None)):
    if not websocket_controller.verifyUserChannel(id, channel_id):
        return

    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            websocket_controller.sendMessage(data, id)
            await manager.send_personal_message(f"You wrote: {data}", websocket)
            await manager.broadcast(f"Client #{channel_id} says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{channel_id} left the chat")