from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.user import User


class ConversationBase(BaseModel):
    pass


class ConversationCreate(ConversationBase):
    participant_ids: List[int]


class ConversationParticipant(BaseModel):
    id: int
    user_id: int
    conversation_id: int
    user: Optional[User] = None
    
    class Config:
        from_attributes = True


class Conversation(ConversationBase):
    id: int
    created_at: datetime
    participants: List[ConversationParticipant] = []
    
    class Config:
        from_attributes = True


class ConversationSimple(BaseModel):
    id: int
    created_at: datetime
    participant_count: int
    participant_names: List[str] = []
    
    class Config:
        from_attributes = True
