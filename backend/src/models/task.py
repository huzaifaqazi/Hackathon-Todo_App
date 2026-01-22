from sqlmodel import SQLModel, Field, Column, DateTime, Boolean, Relationship
from typing import Optional
from datetime import datetime
import uuid

# Define the enums for status and priority
from enum import Enum
from sqlalchemy import Enum as SQLEnum

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TaskBase(SQLModel):
    title: str = Field(nullable=False, max_length=200)
    description: Optional[str] = Field(default=None)
    status: TaskStatus = Field(sa_column=Column(SQLEnum(TaskStatus), nullable=False))
    priority: TaskPriority = Field(sa_column=Column(SQLEnum(TaskPriority), nullable=False))
    due_date: Optional[datetime] = Field(default=None)
    user_id: uuid.UUID = Field(nullable=False, foreign_key="users.id")


class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        unique=True,
        nullable=False
    )
    created_at: datetime = Field(
        sa_column=Column(DateTime, default=datetime.utcnow, nullable=False)
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    )

    # Relationship with User (using string reference and proper back_populates)
    user: "User" = Relationship(back_populates="tasks")


class TaskCreate(SQLModel):
    title: str = Field(nullable=False, max_length=200)
    description: Optional[str] = Field(default=None)
    status: TaskStatus = Field(sa_column=Column(SQLEnum(TaskStatus), nullable=False))
    priority: TaskPriority = Field(sa_column=Column(SQLEnum(TaskPriority), nullable=False))
    due_date: Optional[datetime] = Field(default=None)
    # user_id is not included in TaskCreate - it's set automatically from authenticated user


class TaskRead(TaskBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None