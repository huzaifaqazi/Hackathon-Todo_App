from sqlmodel import Session, select
from src.models.task import Task, TaskCreate, TaskUpdate
from src.models.user import User
from typing import List, Optional
import uuid

def create_task(task_create: TaskCreate, user_id: uuid.UUID, db_session: Session) -> Task:
    """Create a new task for a user."""
    task = Task(
        title=task_create.title,
        description=task_create.description,
        status=task_create.status,
        priority=task_create.priority,
        due_date=task_create.due_date,
        user_id=user_id
    )

    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)

    return task


def get_tasks(user_id: uuid.UUID, db_session: Session,
              status: Optional[str] = None,
              priority: Optional[str] = None,
              limit: int = 20,
              offset: int = 0) -> List[Task]:
    """Get all tasks for a user with optional filters."""
    query = select(Task).where(Task.user_id == user_id)

    if status:
        query = query.where(Task.status == status)

    if priority:
        query = query.where(Task.priority == priority)

    query = query.offset(offset).limit(limit)

    tasks = db_session.exec(query).all()
    return tasks


def get_task_by_id(task_id: uuid.UUID, user_id: uuid.UUID, db_session: Session) -> Optional[Task]:
    """Get a specific task by ID for a user."""
    task = db_session.exec(
        select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
    ).first()

    return task


def update_task(task_id: uuid.UUID, user_id: uuid.UUID, task_update: TaskUpdate, db_session: Session) -> Optional[Task]:
    """Update a task for a user."""
    task = db_session.exec(
        select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
    ).first()

    if not task:
        return None

    # Update only the fields that are provided in task_update
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)

    return task


def delete_task(task_id: uuid.UUID, user_id: uuid.UUID, db_session: Session) -> bool:
    """Delete a task for a user."""
    task = db_session.exec(
        select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
    ).first()

    if not task:
        return False

    db_session.delete(task)
    db_session.commit()

    return True


def get_task_count(user_id: uuid.UUID, db_session: Session) -> int:
    """Get total count of tasks for a user."""
    from sqlmodel import func
    count_query = select(func.count(Task.id)).where(Task.user_id == user_id)
    count = db_session.exec(count_query).one()

    return count