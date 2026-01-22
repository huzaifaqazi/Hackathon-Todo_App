from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import Dict, Any, List, Optional
from src.database import get_session
from src.models.user import User
from src.models.task import Task, TaskCreate, TaskUpdate, TaskRead
from src.services.task_service import (
    create_task, get_tasks, get_task_by_id, update_task, delete_task, get_task_count
)
from src.utils.auth import get_current_user
from src.middleware.task_auth import validate_user_access_to_task

router = APIRouter()

@router.get("/", response_model=Dict[str, Any])
def get_all_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Retrieve all tasks for the authenticated user."""
    tasks = get_tasks(
        user_id=current_user.id,
        db_session=db,
        status=status_filter,
        priority=priority_filter,
        limit=limit,
        offset=offset
    )

    total_count = get_task_count(current_user.id, db)

    # Convert tasks to TaskRead objects for serialization
    task_list = []
    for task in tasks:
        task_read = TaskRead(
            id=task.id,
            title=task.title,
            description=task.description,
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            user_id=task.user_id,
            created_at=task.created_at,
            updated_at=task.updated_at
        )
        task_list.append(task_read)

    return {
        "success": True,
        "data": {
            "tasks": task_list,
            "total_count": total_count,
            "limit": limit,
            "offset": offset
        }
    }


@router.post("/", response_model=Dict[str, Any])
def create_new_task(
    task_create: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Create a new task for the authenticated user."""
    task = create_task(task_create, current_user.id, db)

    task_response = TaskRead(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        user_id=task.user_id,
        created_at=task.created_at,
        updated_at=task.updated_at
    )

    return {
        "success": True,
        "message": "Task created successfully",
        "data": {
            "task": task_response
        }
    }


@router.get("/{task_id}", response_model=Dict[str, Any])
def get_task_by_id_endpoint(
    task_id: str,  # Changed to str to handle UUID conversion
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Retrieve a specific task by ID."""
    from uuid import UUID

    try:
        task_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    task = get_task_by_id(task_uuid, current_user.id, db)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or user doesn't have access"
        )

    task_response = TaskRead(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        user_id=task.user_id,
        created_at=task.created_at,
        updated_at=task.updated_at
    )

    return {
        "success": True,
        "data": {
            "task": task_response
        }
    }


@router.put("/{task_id}", response_model=Dict[str, Any])
def update_existing_task(
    task_id: str,  # Changed to str to handle UUID conversion
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Update an existing task."""
    from uuid import UUID

    try:
        task_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    updated_task = update_task(task_uuid, current_user.id, task_update, db)

    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or user doesn't have access"
        )

    task_response = TaskRead(
        id=updated_task.id,
        title=updated_task.title,
        description=updated_task.description,
        status=updated_task.status,
        priority=updated_task.priority,
        due_date=updated_task.due_date,
        user_id=updated_task.user_id,
        created_at=updated_task.created_at,
        updated_at=updated_task.updated_at
    )

    return {
        "success": True,
        "message": "Task updated successfully",
        "data": {
            "task": task_response
        }
    }


@router.patch("/{task_id}", response_model=Dict[str, Any])
def partially_update_task(
    task_id: str,  # Changed to str to handle UUID conversion
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Partially update an existing task."""
    from uuid import UUID

    try:
        task_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    updated_task = update_task(task_uuid, current_user.id, task_update, db)

    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or user doesn't have access"
        )

    task_response = TaskRead(
        id=updated_task.id,
        title=updated_task.title,
        description=updated_task.description,
        status=updated_task.status,
        priority=updated_task.priority,
        due_date=updated_task.due_date,
        user_id=updated_task.user_id,
        created_at=updated_task.created_at,
        updated_at=updated_task.updated_at
    )

    return {
        "success": True,
        "message": "Task updated successfully",
        "data": {
            "task": task_response
        }
    }


@router.delete("/{task_id}", response_model=Dict[str, Any])
def delete_task_endpoint(
    task_id: str,  # Changed to str to handle UUID conversion
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Delete a specific task."""
    from uuid import UUID

    try:
        task_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    success = delete_task(task_uuid, current_user.id, db)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or user doesn't have access"
        )

    return {
        "success": True,
        "message": "Task deleted successfully"
    }