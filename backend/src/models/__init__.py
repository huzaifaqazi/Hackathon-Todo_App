# Import all models to ensure they are registered with SQLModel
from .user import User, UserBase, UserCreate, UserRead, UserUpdate
from .task import Task, TaskBase, TaskCreate, TaskRead, TaskUpdate, TaskStatus, TaskPriority
from .session import Session, SessionBase, SessionCreate, SessionRead, SessionUpdate

# Ensure all models are properly registered
__all__ = [
    "User", "UserBase", "UserCreate", "UserRead", "UserUpdate",
    "Task", "TaskBase", "TaskCreate", "TaskRead", "TaskUpdate", "TaskStatus", "TaskPriority",
    "Session", "SessionBase", "SessionCreate", "SessionRead", "SessionUpdate"
]