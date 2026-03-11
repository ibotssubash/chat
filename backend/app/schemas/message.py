from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import User


class MessageBase(BaseModel):
    content: str


class MessageCreate(MessageBase):
    conversation_id: int


class Message(MessageBase):
    id: int
    conversation_id: int
    sender_id: int
    created_at: datetime
    sender: Optional[User] = None
    
    class Config:
        from_attributes = True


class MessageBroadcast(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    content: str
    created_at: datetime
    sender_username: str
