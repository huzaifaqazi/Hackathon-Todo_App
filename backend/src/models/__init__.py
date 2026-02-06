# Import all models to ensure they are registered with SQLModel
from .user import User, UserBase, UserCreate, UserRead, UserUpdate
from .task import Task, TaskBase, TaskCreate, TaskRead, TaskUpdate, TaskStatus, TaskPriority
from .session import Session, SessionBase, SessionCreate, SessionRead, SessionUpdate
from .conversation import Conversation, ConversationBase, ConversationRead
from .message import Message, MessageBase, MessageRead, RoleType, MessageType
from .tool_execution import ToolExecution, ToolExecutionBase, ToolExecutionRead, ToolExecutionStatus

# Ensure all models are properly registered
__all__ = [
    "User", "UserBase", "UserCreate", "UserRead", "UserUpdate",
    "Task", "TaskBase", "TaskCreate", "TaskRead", "TaskUpdate", "TaskStatus", "TaskPriority",
    "Session", "SessionBase", "SessionCreate", "SessionRead", "SessionUpdate",
    "Conversation", "ConversationBase", "ConversationRead",
    "Message", "MessageBase", "MessageRead", "RoleType", "MessageType",
    "ToolExecution", "ToolExecutionBase", "ToolExecutionRead", "ToolExecutionStatus"
]