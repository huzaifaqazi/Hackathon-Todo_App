"""Message model for the AI chatbot feature."""

from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional
from sqlmodel import Field, SQLModel
import uuid
import json


class RoleType(str, Enum):
    """Role types for message senders."""
    user = "user"
    assistant = "assistant"
    system = "system"


class MessageType(str, Enum):
    """Types of messages."""
    text = "text"
    tool_result = "tool_result"
    feedback = "feedback"


class ToolCall(SQLModel):
    """Schema for MCP tool calls."""
    id: str
    type: str = "function"
    function: Dict[str, str]


class ToolResponse(SQLModel):
    """Schema for MCP tool responses."""
    tool_call_id: str
    name: str
    content: str


class MessageBase(SQLModel):
    """Base class for Message model with shared attributes."""
    conversation_id: str
    role: RoleType
    content: str
    tool_calls: Optional[str] = Field(default=None)  # JSON string of tool calls
    tool_responses: Optional[str] = Field(default=None)  # JSON string of tool responses
    message_type: MessageType = MessageType.text


class Message(MessageBase, table=True):
    """Message model representing individual exchanges within a conversation."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MessageRead(MessageBase):
    """Schema for reading message data."""
    id: str
    timestamp: datetime