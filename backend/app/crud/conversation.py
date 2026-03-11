from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.conversation import Conversation, ConversationParticipant
from app.models.user import User
from app.schemas.conversation import ConversationCreate


class ConversationCRUD:
    async def get_conversation_by_id(
        self, 
        db: AsyncSession, 
        conversation_id: int,
        user_id: int
    ) -> Conversation | None:
        result = await db.execute(
            select(Conversation)
            .options(selectinload(Conversation.participants))
            .join(ConversationParticipant)
            .filter(
                Conversation.id == conversation_id,
                ConversationParticipant.user_id == user_id
            )
        )
        return result.scalar_one_or_none()
    
    async def get_user_conversations(
        self, 
        db: AsyncSession, 
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> list[Conversation]:
        result = await db.execute(
            select(Conversation)
            .options(selectinload(Conversation.participants).selectinload(ConversationParticipant.user))
            .join(ConversationParticipant)
            .filter(ConversationParticipant.user_id == user_id)
            .order_by(Conversation.created_at.desc())  # Order by latest first
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def create_conversation(
        self, 
        db: AsyncSession, 
        conversation: ConversationCreate,
        creator_id: int
    ) -> Conversation:
        print(f"Creating conversation with participants: {conversation.participant_ids}, creator_id: {creator_id}")
        
        try:
            # Create conversation
            db_conversation = Conversation()
            db.add(db_conversation)
            await db.flush()  # Get the conversation ID
            print(f"Conversation created with ID: {db_conversation.id}")
            
            # Add all participants (including creator)
            participant_ids = list(set(conversation.participant_ids + [creator_id]))
            print(f"Final participant IDs: {participant_ids}")
            
            for participant_id in participant_ids:
                # Verify user exists
                user_result = await db.execute(select(User).filter(User.id == participant_id))
                user = user_result.scalar_one_or_none()
                if not user:
                    print(f"User with id {participant_id} does not exist")
                    raise ValueError(f"User with id {participant_id} does not exist")
                
                print(f"Adding participant: {user.username} (ID: {user.id})")
                participant = ConversationParticipant(
                    conversation_id=db_conversation.id,
                    user_id=participant_id
                )
                db.add(participant)
            
            await db.commit()
            print("Conversation and participants saved to database")
            
            # Return simple conversation object
            await db.refresh(db_conversation)
            print(f"Final conversation: ID={db_conversation.id}, Created={db_conversation.created_at}")
            return db_conversation
            
        except Exception as e:
            print(f"Error in create_conversation: {str(e)}")
            await db.rollback()
            raise


conversation_crud = ConversationCRUD()
