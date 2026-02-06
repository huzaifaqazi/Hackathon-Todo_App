"""ToolExecution model for tracking MCP tool executions in the AI chatbot feature."""

from datetime import datetime
from enum import Enum
from typing import Dict, Optional
from sqlmodel import Field, SQLModel
import uuid


class ToolExecutionStatus(str, Enum):
    """Status of tool execution."""
    success = "success"
    error = "error"
    pending = "pending"


class ToolExecutionBase(SQLModel):
    """Base class for ToolExecution model with shared attributes."""
    message_id: str  # Reference to the message that triggered this tool
    tool_name: str  # Name of the tool executed
    arguments: str  # JSON string of arguments passed to the tool
    result: str  # JSON string of result from tool execution
    status: ToolExecutionStatus  # Execution status


class ToolExecution(ToolExecutionBase, table=True):
    """ToolExecution model representing the execution of MCP tools during conversation processing."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    executed_at: datetime = Field(default_factory=datetime.utcnow)


class ToolExecutionRead(ToolExecutionBase):
    """Schema for reading tool execution data."""
    id: str
    executed_at: datetime