"""Conversation model for the AI chatbot feature."""

from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel
import uuid


class ConversationBase(SQLModel):
    """Base class for Conversation model with shared attributes."""
    title: Optional[str] = Field(default=None, max_length=100)
    user_id: str  # Reference to the user who owns this conversation
    is_active: bool = Field(default=True)


class Conversation(ConversationBase, table=True):
    """Conversation model representing a chat session between user and AI assistant."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ConversationRead(ConversationBase):
    """Schema for reading conversation data."""
    id: str
    created_at: datetime
    updated_at: datetime