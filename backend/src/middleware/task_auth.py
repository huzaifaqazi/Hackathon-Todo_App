from fastapi import HTTPException, status
from sqlmodel import Session, select
from src.models.task import Task
from src.models.user import User
from typing import Optional
import uuid


def verify_task_ownership(task_id: uuid.UUID, user_id: uuid.UUID, db_session: Session) -> bool:
    """
    Verify that the authenticated user owns the task they're trying to access.

    Args:
        task_id: The UUID of the task to check
        user_id: The UUID of the authenticated user
        db_session: Database session

    Returns:
        bool: True if user owns the task, raises HTTPException otherwise
    """
    # Query the task to check ownership
    task = db_session.exec(
        select(Task)
        .where(Task.id == task_id)
        .where(Task.user_id == user_id)
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or user doesn't have access"
        )

    return True


def validate_user_access_to_task(task_id: str, current_user: User, db_session: Session) -> Task:
    """
    Validate that the current user has access to the specified task.

    Args:
        task_id: The ID of the task to access
        current_user: The authenticated user
        db_session: Database session

    Returns:
        Task: The task object if access is granted

    Raises:
        HTTPException: If access is denied
    """
    from uuid import UUID

    try:
        task_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    # Get the task
    task = db_session.get(Task, task_uuid)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Check if the current user owns this task
    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You don't have permission to access this task"
        )

    return task