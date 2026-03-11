from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import desc
from app.models.message import Message
from app.models.conversation import ConversationParticipant
from app.schemas.message import MessageCreate


class MessageCRUD:
    async def get_conversation_messages(
        self, 
        db: AsyncSession, 
        conversation_id: int,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> list[Message]:
        # Verify user is participant
        participant_result = await db.execute(
            select(ConversationParticipant)
            .filter(
                ConversationParticipant.conversation_id == conversation_id,
                ConversationParticipant.user_id == user_id
            )
        )
        if not participant_result.scalar_one_or_none():
            raise ValueError("User is not a participant in this conversation")
        
        # Get messages
        result = await db.execute(
            select(Message)
            .options(selectinload(Message.sender))
            .filter(Message.conversation_id == conversation_id)
            .order_by(desc(Message.created_at))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def create_message(
        self, 
        db: AsyncSession, 
        message: MessageCreate,
        sender_id: int
    ) -> Message:
        # Verify user is participant
        participant_result = await db.execute(
            select(ConversationParticipant)
            .filter(
                ConversationParticipant.conversation_id == message.conversation_id,
                ConversationParticipant.user_id == sender_id
            )
        )
        if not participant_result.scalar_one_or_none():
            raise ValueError("User is not a participant in this conversation")
        
        # Create message
        db_message = Message(
            conversation_id=message.conversation_id,
            sender_id=sender_id,
            content=message.content
        )
        db.add(db_message)
        await db.commit()
        await db.refresh(db_message)
        
        # Load sender for return
        result = await db.execute(
            select(Message)
            .options(selectinload(Message.sender))
            .filter(Message.id == db_message.id)
        )
        return result.scalar_one()


message_crud = MessageCRUD()
