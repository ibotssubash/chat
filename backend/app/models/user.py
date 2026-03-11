from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships with CASCADE delete
    sent_messages = relationship(
        "Message",
        back_populates="sender",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    
    conversation_participants = relationship(
        "ConversationParticipant",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
