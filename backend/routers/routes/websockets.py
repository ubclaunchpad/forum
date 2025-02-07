import datetime
import json
from typing import Annotated, List

from controllers import websocket_controller
from fastapi import (
    APIRouter,
    Cookie,
    Depends,
    Query,
    Request,
    WebSocket,
    WebSocketDisconnect,
    WebSocketException,
    status,
)
from models.schemas import message_schema
from pydantic import BaseModel


class Item(BaseModel):
    name : str
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
    res = websocket_controller.createChannel(item.user_id, item.users, item.name)
    return res

async def get_token(
    websocket: WebSocket,
    token: Annotated[str | None, Query()] = None,
):
    if token is None:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    
    return token


@web_router.websocket("/ws/chat/{channel_id}")
async def websocket_endpoint(
    *, websocket: WebSocket, 
    channel_id: str, 
    q: int | None = None, 
    token: Annotated[str, Depends(get_token)]):

    user_id = await websocket_controller.verifyToken(token)
    if not websocket_controller.verifyUserChannel(user_id, channel_id):
        raise Exception("This sucks")

    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_id = websocket_controller.sendMessage(data, user_id, channel_id)

            payload = {
                "id" : str(message_id),
                "created_by": user_id,              # Details about who sent the message
                "channel_id": channel_id,        # The channel the message belongs to
                "content" : data,
                "created_at": datetime.datetime.now().isoformat(),  # Optional timestamp
            }
            json_message = json.dumps(payload)
            await manager.broadcast(json_message)
    except WebSocketDisconnect:
        manager.disconnect(websocket)