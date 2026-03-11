from typing import Dict, List
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import verify_token
from app.crud.user import user_crud
from app.schemas.message import MessageBroadcast


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
        self.user_connections: Dict[WebSocket, int] = {}

    async def connect(self, websocket: WebSocket, conversation_id: int, user_id: int):
        await websocket.accept()
        
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = []
        
        self.active_connections[conversation_id].append(websocket)
        self.user_connections[websocket] = user_id

    def disconnect(self, websocket: WebSocket):
        user_id = self.user_connections.get(websocket)
        if user_id:
            del self.user_connections[websocket]
        
        # Remove from all conversations
        for conversation_id, connections in self.active_connections.items():
            if websocket in connections:
                connections.remove(websocket)
                if not connections:
                    del self.active_connections[conversation_id]
                break

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_conversation(self, message: MessageBroadcast, conversation_id: int):
        if conversation_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[conversation_id]:
                try:
                    await connection.send_text(message.model_dump_json())
                except:
                    disconnected.append(connection)
            
            # Clean up disconnected connections
            for connection in disconnected:
                self.disconnect(connection)

    async def verify_websocket_token(self, token: str, db: AsyncSession) -> int:
        username = verify_token(token)
        if not username:
            raise ValueError("Invalid token")
        
        user = await user_crud.get_user_by_username(db, username)
        if not user:
            raise ValueError("User not found")
        
        return user.id


manager = ConnectionManager()
