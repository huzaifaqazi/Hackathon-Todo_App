"""API routes for the chatbot feature."""

import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from ..database import get_session
from ..models.conversation import Conversation, ConversationRead, ConversationBase
from ..models.message import Message, MessageRead, MessageBase, RoleType, MessageType
from ..models.user import User  # Import the User model
from ..services.conversation_service import ConversationService
from ..services.message_service import MessageService
from ..services.ai_service import get_ai_service
from ..utils.auth import get_current_user
from pydantic import BaseModel


class ChatRequest(BaseModel):
    """Request model for sending a message to the AI."""
    message: str
    stream: bool = False


class ChatResponse(BaseModel):
    """Response model for AI chat responses."""
    response: MessageRead


class CreateConversationRequest(BaseModel):
    """Request model for creating a new conversation."""
    initial_message: str


router = APIRouter(tags=["chat"])

conversation_service = ConversationService()
message_service = MessageService()


import logging

logger = logging.getLogger(__name__)

from fastapi.responses import JSONResponse
from typing import Dict, Any

@router.post("/conversations")
def create_conversation(
    request: CreateConversationRequest,
    current_user: User = Depends(get_current_user),
    db_session: Session = Depends(get_session)
):
    """Create a new conversation with an initial message."""
    try:
        logger.info(f"Creating conversation for user: {current_user.id}")
        conversation = conversation_service.create_conversation(
            db_session=db_session,
            user_id=current_user.id,
            initial_message=request.initial_message
        )

        # Validate that the conversation has a valid ID
        if not conversation.id:
            logger.error("Conversation created but ID is None or empty")
            raise HTTPException(status_code=500, detail="Failed to create conversation: invalid ID returned")

        # Create the initial message in the conversation
        logger.info(f"Creating initial message for conversation: {conversation.id}")
        message_service.create_message(
            db_session=db_session,
            conversation_id=conversation.id,
            role=RoleType.user,
            content=request.initial_message,
            message_type=MessageType.text
        )

        # Update conversation's updated_at timestamp after adding the initial message
        # Need to fetch the conversation from DB since the returned object is a Pydantic model
        try:
            conversation_from_db = db_session.get(Conversation, conversation.id)
            if conversation_from_db:
                conversation_from_db.updated_at = datetime.now(timezone.utc)
                db_session.add(conversation_from_db)
                db_session.commit()
        except Exception as e:
            logger.warning(f"Could not update conversation updated_at: {str(e)}")
            # Continue without failing as this is not critical for the main functionality

        logger.info(f"Successfully created conversation: {conversation.id}")

        # Return response in the format expected by the frontend
        return {
            "conversation": {
                "id": conversation.id,
                "title": conversation.title,
                "user_id": conversation.user_id,
                "created_at": conversation.created_at.isoformat() if hasattr(conversation, 'created_at') and conversation.created_at else None,
                "updated_at": conversation.updated_at.isoformat() if hasattr(conversation, 'updated_at') and conversation.updated_at else None,
                "is_active": conversation.is_active
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating conversation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error creating conversation: {str(e)}")


@router.get("/conversations")
def get_user_conversations(
    current_user: User = Depends(get_current_user),
    db_session: Session = Depends(get_session)
):
    """Get all conversations for the current user."""
    try:
        logger.info(f"Fetching conversations for user: {current_user.id}")
        conversations = conversation_service.get_user_conversations(
            db_session=db_session,
            user_id=current_user.id
        )
        logger.info(f"Found {len(conversations)} conversations for user: {current_user.id}")

        # Format response to match frontend expectations
        formatted_conversations = []
        for conv in conversations:
            formatted_conversations.append({
                "id": conv.id,
                "title": conv.title,
                "user_id": conv.user_id,
                "created_at": conv.created_at.isoformat() if hasattr(conv, 'created_at') and conv.created_at else None,
                "updated_at": conv.updated_at.isoformat() if hasattr(conv, 'updated_at') and conv.updated_at else None,
                "is_active": conv.is_active
            })

        return {"conversations": formatted_conversations}
    except Exception as e:
        logger.error(f"Error fetching conversations for user {current_user.id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching conversations: {str(e)}")


@router.get("/conversations/{conversation_id}")
def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db_session: Session = Depends(get_session)
):
    """Get a specific conversation for the current user."""
    try:
        conversation = conversation_service.get_conversation(
            db_session=db_session,
            conversation_id=conversation_id,
            user_id=current_user.id
        )

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Format response to match frontend expectations
        return {
            "id": conversation.id,
            "title": conversation.title,
            "user_id": conversation.user_id,
            "created_at": conversation.created_at.isoformat() if hasattr(conversation, 'created_at') and conversation.created_at else None,
            "updated_at": conversation.updated_at.isoformat() if hasattr(conversation, 'updated_at') and conversation.updated_at else None,
            "is_active": conversation.is_active
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db_session: Session = Depends(get_session)
):
    """Delete a specific conversation for the current user."""
    try:
        success = conversation_service.delete_conversation(
            db_session=db_session,
            conversation_id=conversation_id,
            user_id=current_user.id
        )

        if not success:
            raise HTTPException(status_code=404, detail="Conversation not found")

        return {"message": "Conversation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/{conversation_id}/messages")
def get_conversation_messages(
    conversation_id: str,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db_session: Session = Depends(get_session)
):
    """Get all messages in a specific conversation."""
    try:
        # First verify that the conversation belongs to the user
        conversation = conversation_service.get_conversation(
            db_session=db_session,
            conversation_id=conversation_id,
            user_id=current_user.id
        )

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        messages = message_service.get_messages_by_conversation(
            db_session=db_session,
            conversation_id=conversation_id,
            limit=limit,
            offset=offset
        )

        # Format response to match frontend expectations
        formatted_messages = []
        for msg in messages:
            formatted_messages.append({
                "id": msg.id,
                "conversation_id": msg.conversation_id,
                "role": msg.role.value if hasattr(msg.role, 'value') else msg.role,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat() if hasattr(msg, 'timestamp') and msg.timestamp else None,
                "tool_calls": msg.tool_calls,
                "tool_responses": msg.tool_responses,
                "message_type": msg.message_type.value if hasattr(msg.message_type, 'value') else msg.message_type
            })

        return {"messages": formatted_messages}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/conversations/{conversation_id}/chat")
async def chat_with_ai(
    conversation_id: str,
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db_session: Session = Depends(get_session)
):
    """Send a message to the AI and get a response."""
    try:
        logger.info(f"Processing chat message for user: {current_user.id}, conversation: {conversation_id}")

        # Verify that the conversation belongs to the user
        conversation = conversation_service.get_conversation(
            db_session=db_session,
            conversation_id=conversation_id,
            user_id=current_user.id
        )

        if not conversation:
            logger.warning(f"Conversation {conversation_id} not found for user {current_user.id}")
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Get conversation history to provide context to the AI
        logger.debug(f"Fetching conversation history for {conversation_id}")
        conversation_history = message_service.get_messages_by_conversation(
            db_session=db_session,
            conversation_id=conversation_id,
            limit=10  # Get last 10 messages as context
        )

        # Format the history for the AI
        formatted_history = []
        for msg in conversation_history:
            formatted_history.append({
                "role": msg.role.value,
                "content": msg.content
            })

        # Save the user's message to the conversation
        logger.debug(f"Saving user message to conversation {conversation_id}")
        user_message = message_service.create_message(
            db_session=db_session,
            conversation_id=conversation_id,
            role=RoleType.user,
            content=request.message,
            message_type=MessageType.text
        )

        # Update conversation's updated_at timestamp to reflect the new activity
        # Ensure conversation is properly attached to session
        try:
            conversation_db = db_session.get(Conversation, conversation_id)
            if conversation_db:
                conversation_db.updated_at = datetime.now(timezone.utc)
                db_session.add(conversation_db)
                db_session.commit()
        except Exception as e:
            logger.warning(f"Could not update conversation updated_at after user message: {str(e)}")
            # Continue without failing as this is not critical for the main functionality

        # Process the message with the AI
        logger.debug(f"Processing message with AI service for user: {current_user.id}")
        ai_service_instance = get_ai_service()
        ai_response = await ai_service_instance.process_chat_message(
            user_message=request.message,
            conversation_history=formatted_history,
            user_id=current_user.id,
            session=db_session
        )

        # Create the AI's response message
        logger.debug(f"Saving AI response to conversation {conversation_id}")
        ai_message = message_service.create_message(
            db_session=db_session,
            conversation_id=conversation_id,
            role=RoleType.assistant,
            content=ai_response["content"],
            message_type=MessageType.text,
            tool_calls=json.dumps(ai_response["tool_calls"]) if ai_response["tool_calls"] else None,
            tool_responses=json.dumps(ai_response["tool_responses"]) if ai_response["tool_responses"] else None
        )

        # Update conversation's updated_at timestamp to reflect the new activity
        # Ensure conversation is properly attached to session
        try:
            conversation_db = db_session.get(Conversation, conversation_id)
            if conversation_db:
                conversation_db.updated_at = datetime.utcnow()
                db_session.add(conversation_db)
                db_session.commit()
        except Exception as e:
            logger.warning(f"Could not update conversation updated_at after AI response: {str(e)}")
            # Continue without failing as this is not critical for the main functionality

        # Update conversation title if this is the first message in the conversation
        # Get the conversation to check if this was the first user message
        existing_messages = message_service.get_messages_by_conversation(
            db_session=db_session,
            conversation_id=conversation_id,
            limit=2,  # We expect 2 messages: the user's and the AI's
            offset=0
        )

        # If there are exactly 2 messages (user + AI), then this was the first exchange
        # and we should update the conversation title based on the user's initial message
        if len(existing_messages) == 2:
            # Get the user's message (should be the first one)
            user_message = None
            for msg in existing_messages:
                if msg.role == RoleType.user:
                    user_message = msg
                    break

            if user_message:
                # Clean up the message to create a better title
                import re
                cleaned_message = user_message.content.strip()

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

                # Update the conversation title
                conversation_service.update_conversation_title(
                    db_session=db_session,
                    conversation_id=conversation_id,
                    user_id=current_user.id,
                    title=title
                )

        logger.info(f"Successfully processed chat message for conversation {conversation_id}")

        # Format response to match frontend expectations
        return {
            "response": {
                "id": ai_message.id,
                "conversation_id": ai_message.conversation_id,
                "role": ai_message.role.value if hasattr(ai_message.role, 'value') else ai_message.role,
                "content": ai_message.content,
                "timestamp": ai_message.timestamp.isoformat() if hasattr(ai_message, 'timestamp') and ai_message.timestamp else None,
                "tool_calls": ai_message.tool_calls,
                "tool_responses": ai_message.tool_responses,
                "message_type": ai_message.message_type.value if hasattr(ai_message.message_type, 'value') else ai_message.message_type
            }
        }
    except HTTPException:
        logger.warning(f"HTTP exception in chat endpoint: {conversation_id}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing chat message for conversation {conversation_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing chat message: {str(e)}")