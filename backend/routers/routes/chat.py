import datetime
import json
import uuid
from typing import Annotated, List

from controllers import chat_controller
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
from models.schemas.chat_schema import CreateChannelRequest
from pydantic import BaseModel


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

chat_router = APIRouter()
manager = ConnectionManager()

@chat_router.get("")
async def getUserChannels(user_id: str):
    channels = chat_controller.getUserChannels(user_id)
    return [channel.channel_id for channel in channels]

@chat_router.post("")
async def createNewChannel(channel_req_info: CreateChannelRequest):
    res = chat_controller.createChannel(channel_req_info)
    return res

@chat_router.get("/{channel_id}/history")
async def getMessageHistory(channel_id: str):
    messages = chat_controller.getMessageHistory(channel_id)
    return messages


async def get_token(
    websocket: WebSocket,
    token: Annotated[str | None, Query()] = None,
):
    if token is None:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    
    return token


@chat_router.websocket("/chat/{channel_id}")
async def websocket_endpoint(
    *, websocket: WebSocket, 
    channel_id: str, 
    q: int | None = None, 
    token: Annotated[str, Depends(get_token)]):

    user_id = await chat_controller.verifyToken(token)
    if not chat_controller.verifyUserChannel(user_id, channel_id):
        raise Exception("This sucks")

    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_id = uuid.uuid4()
            payload = {
                "id" : str(message_id),
                "created_by": user_id,              # Details about who sent the message
                "channel_id": channel_id,        # The channel the message belongs to
                "content" : data,
                "created_at": datetime.datetime.now().isoformat(),  # Optional timestamp
            }
            json_message = json.dumps(payload)
            await manager.broadcast(json_message)
            message_id = chat_controller.sendMessage(data, user_id, channel_id, message_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket)