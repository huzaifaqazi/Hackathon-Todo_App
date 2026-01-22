from sqlmodel import SQLModel, Field, Column, DateTime, Boolean, Relationship
from typing import Optional
from datetime import datetime
import uuid

class SessionBase(SQLModel):
    user_id: uuid.UUID = Field(nullable=False, foreign_key="users.id")
    token_hash: str = Field(unique=True, nullable=False, max_length=255)
    expires_at: datetime = Field(nullable=False)
    is_revoked: bool = Field(default=False)


class Session(SessionBase, table=True):
    __tablename__ = "sessions"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        unique=True,
        nullable=False
    )
    created_at: datetime = Field(
        sa_column=Column(DateTime, default=datetime.utcnow, nullable=False)
    )

    # Relationship with User (using string reference and proper back_populates)
    user: "User" = Relationship(back_populates="sessions")


class SessionCreate(SessionBase):
    pass


class SessionRead(SessionBase):
    id: uuid.UUID
    created_at: datetime


class SessionUpdate(SQLModel):
    is_revoked: Optional[bool] = None
    expires_at: Optional[datetime] = None