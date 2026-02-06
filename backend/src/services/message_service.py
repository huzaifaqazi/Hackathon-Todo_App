"""Service for managing messages in the AI chatbot feature."""

from datetime import datetime, timezone
from typing import List, Optional
from sqlmodel import Session, select
from ..models.message import Message, MessageRead, MessageBase, RoleType, MessageType
from uuid import uuid4


class MessageService:
    """Service class for handling message operations."""

    def create_message(self, db_session: Session, conversation_id: str, role: RoleType, content: str,
                      message_type: MessageType = MessageType.text,
                      tool_calls: Optional[str] = None,
                      tool_responses: Optional[str] = None) -> MessageRead:
        """Create a new message in a conversation."""
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            message_type=message_type,
            tool_calls=tool_calls,
            tool_responses=tool_responses
        )

        db_session.add(message)
        db_session.commit()
        db_session.refresh(message)

        return MessageRead(
            id=message.id,
            conversation_id=message.conversation_id,
            role=message.role,
            content=message.content,
            timestamp=message.timestamp,
            tool_calls=message.tool_calls,
            tool_responses=message.tool_responses,
            message_type=message.message_type
        )

    def get_messages_by_conversation(self, db_session: Session, conversation_id: str,
                                   limit: int = 50, offset: int = 0) -> List[Message]:
        """Retrieve messages for a specific conversation ordered by timestamp."""
        statement = select(Message).where(
            Message.conversation_id == conversation_id
        ).order_by(Message.timestamp.asc()).offset(offset).limit(limit)

        return db_session.exec(statement).all()

    def get_message(self, db_session: Session, message_id: str) -> Optional[Message]:
        """Retrieve a specific message by ID."""
        statement = select(Message).where(Message.id == message_id)
        return db_session.exec(statement).first()

    def get_latest_messages(self, db_session: Session, conversation_id: str, limit: int = 10) -> List[Message]:
        """Retrieve the latest messages from a conversation."""
        statement = select(Message).where(
            Message.conversation_id == conversation_id
        ).order_by(Message.timestamp.desc()).limit(limit)

        # Return in chronological order (oldest first)
        messages = db_session.exec(statement).all()
        return list(reversed(messages))

    def update_message_content(self, db_session: Session, message_id: str, content: str) -> Optional[Message]:
        """Update the content of a message."""
        statement = select(Message).where(Message.id == message_id)
        message = db_session.exec(statement).first()

        if message:
            message.content = content
            message.timestamp = datetime.now(timezone.utc)
            db_session.add(message)
            db_session.commit()
            db_session.refresh(message)

        return message