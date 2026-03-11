from fastapi import WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.models.conversation import ConversationParticipant
from app.crud.message import message_crud
from app.schemas.message import MessageCreate, MessageBroadcast
from app.websocket.connection_manager import manager
from app.core.security import verify_token
from app.crud.user import user_crud
import json


async def websocket_endpoint(
    websocket: WebSocket,
    conversation_id: int,
    token: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Verify token and get user
        user_id = await manager.verify_websocket_token(token, db)
        
        # Verify user is participant in conversation
        participant_result = await db.execute(
            select(ConversationParticipant)
            .filter(
                ConversationParticipant.conversation_id == conversation_id,
                ConversationParticipant.user_id == user_id
            )
        )
        if not participant_result.scalar_one_or_none():
            raise ValueError("User is not a participant in this conversation")
        
        # Connect to websocket
        await manager.connect(websocket, conversation_id, user_id)
        
        try:
            while True:
                # Receive message from client
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                # Create message
                message_create = MessageCreate(
                    conversation_id=conversation_id,
                    content=message_data["content"]
                )
                
                # Save message to database
                db_message = await message_crud.create_message(
                    db, message=message_create, sender_id=user_id
                )
                
                # Get sender username for broadcast
                sender = await user_crud.get_user_by_id(db, user_id)
                sender_username = sender.username if sender else "Unknown User"
                
                # Create broadcast message
                broadcast_message = MessageBroadcast(
                    id=db_message.id,
                    conversation_id=db_message.conversation_id,
                    sender_id=db_message.sender_id,
                    content=db_message.content,
                    created_at=db_message.created_at,
                    sender_username=sender_username
                )
                
                # Broadcast to all participants in conversation
                await manager.broadcast_to_conversation(broadcast_message, conversation_id)
                
        except WebSocketDisconnect:
            manager.disconnect(websocket)
            
    except ValueError as e:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason=str(e))
    except Exception as e:
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR, reason="Internal server error")
