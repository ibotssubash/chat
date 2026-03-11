from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.db.database import get_db
from app.schemas.conversation import Conversation, ConversationCreate, ConversationSimple
from app.schemas.user import User
from app.crud.conversation import conversation_crud
from app.api.routes.auth import get_current_user
from app.models.user import User as UserModel

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("/", response_model=List[ConversationSimple])
async def get_conversations(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        conversations = await conversation_crud.get_user_conversations(
            db, user_id=current_user.id, skip=skip, limit=limit
        )
        # Convert to simple response
        simple_conversations = []
        for conv in conversations:
            # Get participant names (excluding current user)
            participant_names = []
            if conv.participants:
                for participant in conv.participants:
                    if participant.user_id != current_user.id:
                        # Try to get username from participant.user
                        if participant.user:
                            participant_names.append(participant.user.username)
                        else:
                            # Fallback: fetch user data if not loaded
                            user_result = await db.execute(select(UserModel).filter(UserModel.id == participant.user_id))
                            user = user_result.scalar_one_or_none()
                            if user:
                                participant_names.append(user.username)
                            else:
                                participant_names.append(f"User {participant.user_id}")
            
            simple_conversations.append(ConversationSimple(
                id=conv.id,
                created_at=conv.created_at,
                participant_count=len(conv.participants) if conv.participants else 0,
                participant_names=participant_names
            ))
        return simple_conversations
    except Exception as e:
        print(f"Error in get_conversations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading conversations: {str(e)}"
        )


@router.get("/{conversation_id}", response_model=Conversation)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        conversation = await conversation_crud.get_conversation_by_id(
            db, conversation_id=conversation_id, user_id=current_user.id
        )
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        return conversation
    except Exception as e:
        print(f"Error in get_conversation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading conversation: {str(e)}"
        )


@router.post("/", response_model=ConversationSimple)
async def create_conversation(
    conversation: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    print(f"POST /conversations/ - User: {current_user.username}, Participants: {conversation.participant_ids}")
    
    try:
        db_conversation = await conversation_crud.create_conversation(
            db, conversation=conversation, creator_id=current_user.id
        )
        print(f"Conversation created successfully: {db_conversation.id}")
        
        # Return simple response
        return ConversationSimple(
            id=db_conversation.id,
            created_at=db_conversation.created_at,
            participant_count=len(conversation.participant_ids) + 1  # +1 for creator
        )
    except ValueError as e:
        print(f"ValueError in conversation creation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Unexpected error in conversation creation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
