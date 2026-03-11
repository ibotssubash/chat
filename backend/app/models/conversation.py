from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships with CASCADE delete
    participants = relationship(
        "ConversationParticipant",
        back_populates="conversation",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


class ConversationParticipant(Base):
    __tablename__ = "conversation_participants"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(
        Integer, 
        ForeignKey("conversations.id", ondelete="CASCADE"), 
        nullable=False
    )
    user_id = Column(
        Integer, 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False
    )
    
    # Relationships
    conversation = relationship("Conversation", back_populates="participants")
    user = relationship("User", back_populates="conversation_participants")
