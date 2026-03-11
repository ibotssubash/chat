from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.database import get_db
from app.schemas.message import Message, MessageCreate
from app.schemas.user import User
from app.crud.message import message_crud
from app.api.routes.auth import get_current_user

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/conversation/{conversation_id}", response_model=List[Message])
async def get_conversation_messages(
    conversation_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        messages = await message_crud.get_conversation_messages(
            db, conversation_id=conversation_id, user_id=current_user.id, skip=skip, limit=limit
        )
        return messages
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )


@router.post("/", response_model=Message)
async def create_message(
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        db_message = await message_crud.create_message(
            db, message=message, sender_id=current_user.id
        )
        return db_message
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
