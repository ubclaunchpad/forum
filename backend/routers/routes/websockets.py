import json

from controllers import websocket_controller
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from models.schemas import message_schema

web_router = APIRouter()

@web_router.websocket("/ws/chat/{room_id}")
async def chat_room(websocket: WebSocket, room_id: int):
    """Handle WebSocket connections for a chat room."""
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        websocket_controller.sendMessage(data)
        await websocket.send_text(f"Message text was: {data}")
        
