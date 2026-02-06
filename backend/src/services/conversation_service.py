"""Service for managing conversations in the AI chatbot feature."""

from datetime import datetime, timezone
from typing import List, Optional
from sqlmodel import Session, select
from ..models.conversation import Conversation, ConversationRead, ConversationBase
from ..models.message import Message
from uuid import uuid4, UUID


class ConversationService:
    """Service class for handling conversation operations."""

    def create_conversation(self, db_session: Session, user_id: str, initial_message: Optional[str] = None) -> ConversationRead:
        """Create a new conversation for a user."""
        # Generate a title based on initial message or timestamp
        title = f"Chat - {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')} UTC"

        if initial_message and len(initial_message.strip()) > 0:
            # Clean up the initial message to create a better title
            cleaned_message = initial_message.strip()

            # Remove common prefixes to make titles more meaningful
            prefixes_to_remove = [
                r'^add task ',
                r'^create task ',
                r'^show me ',
                r'^tell me ',
                r'^help me ',
                r'^can you ',
                r'^please ',
                r'^i want to ',
                r'^i need to ',
                r'^how do i ',
                r'^what is ',
                r'^what are '
            ]

            import re
            for prefix in prefixes_to_remove:
                cleaned_message = re.sub(prefix, '', cleaned_message, flags=re.IGNORECASE)

            # Truncate to 50 characters and add ellipsis if needed
            if len(cleaned_message) > 50:
                title = cleaned_message[:47] + "..."
            else:
                title = cleaned_message

            # Capitalize the first letter if it's lowercase
            if title and title[0].islower():
                title = title[0].upper() + title[1:]

        # Convert UUID to string for storage in database
        conversation = Conversation(
            user_id=str(user_id),
            title=title,
            is_active=True
        )

        db_session.add(conversation)
        db_session.commit()

        # Refresh to ensure the conversation ID is populated
        db_session.refresh(conversation)

        # Validate that conversation.id exists before returning
        if not conversation.id:
            raise ValueError("Failed to create conversation: ID is None after refresh")

        return ConversationRead(
            id=conversation.id,
            title=conversation.title,
            user_id=conversation.user_id,
            is_active=conversation.is_active,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at
        )

    def get_conversation(self, db_session: Session, conversation_id: str, user_id: str) -> Optional[Conversation]:
        """Retrieve a specific conversation for a user."""
        # Convert user_id to string for comparison with stored string
        actual_user_id = str(user_id)
        statement = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == actual_user_id
        )
        return db_session.exec(statement).first()

    def get_user_conversations(self, db_session: Session, user_id: str) -> List[Conversation]:
        """Retrieve all conversations for a user."""
        # Convert user_id to string for comparison with stored string
        actual_user_id = str(user_id) if hasattr(user_id, '__str__') else user_id
        statement = select(Conversation).where(Conversation.user_id == actual_user_id).order_by(Conversation.updated_at.desc())
        return db_session.exec(statement).all()

    def delete_conversation(self, db_session: Session, conversation_id: str, user_id: str) -> bool:
        """Delete a conversation for a user."""
        # Convert user_id to string for comparison with stored string
        actual_user_id = str(user_id)
        statement = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == actual_user_id
        )
        conversation = db_session.exec(statement).first()

        if conversation:
            db_session.delete(conversation)
            db_session.commit()
            return True

        return False

    def update_conversation_title(self, db_session: Session, conversation_id: str, user_id: str, title: str) -> Optional[Conversation]:
        """Update the title of a conversation."""
        # Convert user_id to string for comparison with stored string
        actual_user_id = str(user_id)
        statement = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == actual_user_id
        )
        conversation = db_session.exec(statement).first()

        if conversation:
            conversation.title = title
            conversation.updated_at = datetime.now(timezone.utc)
            db_session.add(conversation)
            db_session.commit()
            db_session.refresh(conversation)

        return conversation