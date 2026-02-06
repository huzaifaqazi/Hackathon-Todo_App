"""Service for managing tool executions in the AI chatbot feature."""

from datetime import datetime
from typing import List, Optional
from sqlmodel import Session, select
from ..models.tool_execution import ToolExecution, ToolExecutionRead, ToolExecutionBase, ToolExecutionStatus
from uuid import uuid4


class ToolExecutionService:
    """Service class for handling tool execution operations."""

    def create_tool_execution(self, db_session: Session, message_id: str, tool_name: str,
                             arguments: str, result: str, status: ToolExecutionStatus) -> ToolExecutionRead:
        """Create a new tool execution record."""
        tool_execution = ToolExecution(
            message_id=message_id,
            tool_name=tool_name,
            arguments=arguments,
            result=result,
            status=status
        )

        db_session.add(tool_execution)
        db_session.commit()
        db_session.refresh(tool_execution)

        return ToolExecutionRead(
            id=tool_execution.id,
            message_id=tool_execution.message_id,
            tool_name=tool_execution.tool_name,
            arguments=tool_execution.arguments,
            result=tool_execution.result,
            status=tool_execution.status,
            executed_at=tool_execution.executed_at
        )

    def get_tool_executions_by_message(self, db_session: Session, message_id: str) -> List[ToolExecution]:
        """Retrieve all tool executions for a specific message."""
        statement = select(ToolExecution).where(ToolExecution.message_id == message_id)
        return db_session.exec(statement).all()

    def get_tool_execution(self, db_session: Session, tool_execution_id: str) -> Optional[ToolExecution]:
        """Retrieve a specific tool execution by ID."""
        statement = select(ToolExecution).where(ToolExecution.id == tool_execution_id)
        return db_session.exec(statement).first()

    def update_tool_execution_status(self, db_session: Session, tool_execution_id: str,
                                   status: ToolExecutionStatus) -> Optional[ToolExecution]:
        """Update the status of a tool execution."""
        statement = select(ToolExecution).where(ToolExecution.id == tool_execution_id)
        tool_execution = db_session.exec(statement).first()

        if tool_execution:
            tool_execution.status = status
            tool_execution.executed_at = datetime.utcnow()
            db_session.add(tool_execution)
            db_session.commit()
            db_session.refresh(tool_execution)

        return tool_execution