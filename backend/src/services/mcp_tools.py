"""MCP (Model Context Protocol) tools for the AI chatbot feature."""

import json
from typing import Dict, Any, List
from sqlmodel import Session
from ..database import get_session
from ..models.task import Task, TaskCreate, TaskUpdate
from ..services.task_service import get_task_by_id, create_task, get_tasks, update_task, delete_task
from sqlmodel import Session
import uuid


def _ensure_uuid(value):
    """
    Helper function to ensure a value is converted to UUID.
    Handles both string and UUID object inputs.
    """
    if isinstance(value, uuid.UUID):
        return value
    if isinstance(value, str):
        try:
            return uuid.UUID(value)
        except ValueError:
            # If it's not a valid UUID string, it might be a user-friendly reference
            # For now, we'll return the error, but in the future we might implement
            # a mapping from user-friendly IDs to UUIDs
            raise
    # If it's neither string nor UUID, try converting to string first then to UUID
    return uuid.UUID(str(value))


def _normalize_priority_value(priority: str) -> str:
    """
    Normalize priority value to lowercase with proper enum mapping.

    Args:
        priority: Priority value to normalize

    Returns:
        Normalized priority value ('low', 'medium', 'high')
    """
    if priority is None:
        return priority

    # Convert to string first to handle cases where non-string values are passed
    priority_str = str(priority)
    priority_lower = priority_str.lower().strip()

    # Common variations to their correct enum values
    priority_mapping = {
        'low': 'low',
        'medium': 'medium',
        'high': 'high',
        'med': 'medium',
        'hi': 'high',
        'lo': 'low'
    }

    # Handle space-separated versions
    if ' ' in priority_lower:
        priority_lower = priority_lower.replace(' ', '-')

    # Check if it's already in the correct format
    if priority_lower in priority_mapping:
        return priority_mapping[priority_lower]

    # Check for partial matches
    for key, value in priority_mapping.items():
        if priority_lower.startswith(key) or key.startswith(priority_lower):
            return value

    # If no match found, return original value (validation will catch it)
    return priority_lower


def _normalize_status_value(status: str) -> str:
    """
    Normalize status value to lowercase with proper enum mapping.

    Args:
        status: Status value to normalize

    Returns:
        Normalized status value ('pending', 'in-progress', 'completed')
    """
    if status is None:
        return status

    # Convert to string first to handle cases where non-string values are passed
    status_str = str(status)
    status_lower = status_str.lower().strip()

    # Common variations to their correct enum values
    status_mapping = {
        'pending': 'pending',
        'in-progress': 'in-progress',
        'in_progress': 'in-progress',
        'in progress': 'in-progress',
        'completed': 'completed',
        'complete': 'completed',
        'done': 'completed',
        'todo': 'pending'
    }

    # Handle space-separated versions
    if ' ' in status_lower:
        status_lower = status_lower.replace(' ', '-')

    # Check if it's already in the correct format
    if status_lower in status_mapping:
        return status_mapping[status_lower]

    # Check for partial matches
    for key, value in status_mapping.items():
        if status_lower.startswith(key) or key.startswith(status_lower):
            return value

    # If no match found, return original value (validation will catch it)
    return status_lower


def _resolve_task_id(task_identifier, user_id, db_session):
    """
    Resolve a task identifier (could be UUID string, position number, or user-friendly reference) to actual UUID.

    Args:
        task_identifier: Could be UUID string, position number, or name
        user_id: User ID to filter tasks
        db_session: Database session

    Returns:
        UUID of the actual task, or None if not found
    """
    from ..services.task_service import get_tasks

    # Convert task_identifier to string to handle various input types
    task_identifier = str(task_identifier)

    # First, try to parse as UUID directly
    try:
        return uuid.UUID(task_identifier)
    except ValueError:
        pass

    # If it's not a UUID, it might be an integer position (e.g., "1", "2", etc.)
    try:
        position = int(task_identifier)
        # Get all tasks for the user
        user_uuid = _ensure_uuid(user_id)
        all_user_tasks = get_tasks(user_id=user_uuid, db_session=db_session)

        # Check if the position is valid (1-based indexing)
        if 1 <= position <= len(all_user_tasks):
            # Return the UUID of the task at that position
            return all_user_tasks[position - 1].id
        else:
            return None
    except ValueError:
        # If it's not a number either, it might be a title/name
        # Get all tasks for the user
        user_uuid = _ensure_uuid(user_id)
        all_user_tasks = get_tasks(user_id=user_uuid, db_session=db_session)

        # Try to find a task with a matching title (case-insensitive)
        task_identifier_lower = str(task_identifier).lower()

        # First, try exact match
        for task in all_user_tasks:
            if task.title.lower() == task_identifier_lower:
                return task.id

        # Then try partial match
        for task in all_user_tasks:
            if task_identifier_lower in task.title.lower():
                return task.id

        # If no match found, return None
        return None


class MCPTaskTools:
    """Class containing MCP tools for task operations."""

    def __init__(self, session: Session = None):
        """Initialize the MCP tools with database session."""
        self.session = session  # Accept session from caller rather than creating a new one

    def create_task(self, user_id: str, title: str, description: str = "", due_date: str = None, priority: str = "medium", status: str = "pending") -> Dict[str, Any]:
        """
        Create a new task.

        Args:
            user_id: ID of the user creating the task
            title: Title of the task
            description: Description of the task (optional)
            due_date: Due date for the task (optional, ISO format)
            priority: Priority level (low, medium, high) - default is medium
            status: Status of the task (pending, in-progress, completed) - default is pending

        Returns:
            Dictionary with success status and task details
        """
        try:
            # Validate inputs
            if not title or not title.strip():
                return {
                    "success": False,
                    "error": "Title is required",
                    "message": "Task creation failed: Title is required"
                }

            # Normalize enum values to ensure they match expected format
            normalized_priority = _normalize_priority_value(priority)
            normalized_status = _normalize_status_value(status)

            # Create TaskCreate object for the function
            task_create = TaskCreate(
                title=title.strip(),
                description=description.strip() if description else "",
                due_date=due_date,
                priority=normalized_priority,
                status=normalized_status
            )

            # Convert user_id to UUID (handles both string and UUID object)
            user_uuid = _ensure_uuid(user_id)

            new_task = create_task(
                task_create=task_create,
                user_id=user_uuid,
                db_session=self.session
            )

            return {
                "success": True,
                "task_id": str(new_task.id),
                "title": new_task.title,
                "message": f"✅ Created task: {new_task.title}"
            }
        except ValueError as e:
            # Handle invalid UUID
            return {
                "success": False,
                "error": str(e),
                "message": f"❌ Invalid user ID: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"❌ Failed to create task: {str(e)}"
            }

    def list_tasks(self, user_id: str, status: str = "all") -> Dict[str, Any]:
        """
        List all tasks for the user.

        Args:
            user_id: User ID to get tasks for
            status: Filter tasks by status ('all', 'pending', 'in-progress', 'completed')

        Returns:
            Dictionary with list of tasks
        """
        try:
            # Convert user_id to UUID (handles both string and UUID object)
            user_uuid = _ensure_uuid(user_id)

            # Get all tasks for the user
            all_tasks = get_tasks(
                user_id=user_uuid,
                db_session=self.session
            )

            # Normalize status filter to ensure it matches expected format
            normalized_status = _normalize_status_value(status) if status != "all" else status

            # Filter based on status
            if normalized_status == "pending":
                filtered_tasks = [task for task in all_tasks if task.status == 'pending']
            elif normalized_status == "completed":
                filtered_tasks = [task for task in all_tasks if task.status == 'completed']
            elif normalized_status == "in-progress":
                filtered_tasks = [task for task in all_tasks if task.status == 'in-progress']
            else:
                filtered_tasks = all_tasks

            task_list = []
            for idx, task in enumerate(filtered_tasks):
                task_list.append({
                    "id": str(task.id),
                    "short_id": str(idx + 1),  # 1-based indexing for user-friendly display
                    "display_id": str(idx + 1),  # Same as short_id for user reference
                    "title": task.title,
                    "description": task.description,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "priority": str(task.priority.value) if hasattr(task.priority, 'value') else str(task.priority),
                    "status": str(task.status.value) if hasattr(task.status, 'value') else str(task.status),
                    "user_id": str(task.user_id),
                    "created_at": task.created_at.isoformat() if task.created_at else None
                })

            return {
                "success": True,
                "tasks": task_list,
                "count": len(task_list),
                "message": f"📋 Found {len(task_list)} {'task' if len(task_list) == 1 else 'tasks'}"
            }
        except ValueError as e:
            # Handle invalid UUID
            return {
                "success": False,
                "error": str(e),
                "message": f"❌ Invalid user ID: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"❌ Failed to list tasks: {str(e)}"
            }

    def update_task(self, user_id: str, task_id: str, title: str = None, description: str = None,
                   due_date: str = None, priority: str = None, status: str = None) -> Dict[str, Any]:
        """
        Update an existing task.

        Args:
            user_id: ID of the user requesting the update
            task_id: ID of the task to update
            title: New title (optional)
            description: New description (optional)
            due_date: New due date (optional)
            priority: New priority (optional)
            status: New status (optional)

        Returns:
            Dictionary with update result
        """
        try:
            # Convert user_id to UUID and resolve task_id (handles UUIDs, positions, and names)
            user_uuid = _ensure_uuid(user_id)
            task_uuid = _resolve_task_id(task_id, user_id, self.session)

            if task_uuid is None:
                return {
                    "success": False,
                    "error": "Task not found",
                    "message": f"❌ Task '{task_id}' not found"
                }

            # Get the existing task first to check if it exists
            existing_task = get_task_by_id(
                task_id=task_uuid,
                user_id=user_uuid,
                db_session=self.session
            )

            if not existing_task:
                return {
                    "success": False,
                    "error": "Task not found",
                    "message": f"❌ Task with ID {task_id} not found"
                }

            # Prepare update data
            update_data = {}
            if title is not None:
                update_data['title'] = title.strip()
            if description is not None:
                update_data['description'] = description.strip()
            if due_date is not None:
                update_data['due_date'] = due_date
            if priority is not None:
                # Normalize priority value to ensure it matches expected enum format
                update_data['priority'] = _normalize_priority_value(priority)
            if status is not None:
                # Normalize status value to ensure it matches expected enum format
                update_data['status'] = _normalize_status_value(status)

            # Create TaskUpdate object
            task_update = TaskUpdate(**update_data)

            # Update the task
            updated_task = update_task(
                task_id=task_uuid,
                user_id=user_uuid,
                task_update=task_update,
                db_session=self.session
            )

            if updated_task:
                return {
                    "success": True,
                    "task_id": str(updated_task.id),
                    "message": f"✅ Updated task: {updated_task.title}"
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to update task",
                    "message": f"❌ Failed to update task with ID {task_id}"
                }
        except ValueError as e:
            # Handle invalid UUID
            return {
                "success": False,
                "error": str(e),
                "message": f"❌ Invalid user or task ID: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"❌ Failed to update task: {str(e)}"
            }

    def delete_task(self, user_id: str, task_id: str) -> Dict[str, Any]:
        """
        Delete a task.

        Args:
            user_id: ID of the user requesting the deletion
            task_id: ID of the task to delete (can be UUID, position number, or task name)

        Returns:
            Dictionary with deletion result
        """
        try:
            # Convert user_id to UUID and resolve task_id (handles UUIDs, positions, and names)
            user_uuid = _ensure_uuid(user_id)
            task_uuid = _resolve_task_id(task_id, user_id, self.session)

            if task_uuid is None:
                return {
                    "success": False,
                    "error": "Task not found",
                    "message": f"❌ Task '{task_id}' not found"
                }

            # Check if the task exists first
            existing_task = get_task_by_id(
                task_id=task_uuid,
                user_id=user_uuid,
                db_session=self.session
            )

            if not existing_task:
                return {
                    "success": False,
                    "error": "Task not found",
                    "message": f"❌ Task with ID {task_id} not found"
                }

            # Delete the task
            result = delete_task(
                task_id=task_uuid,
                user_id=user_uuid,
                db_session=self.session
            )

            if result:
                return {
                    "success": True,
                    "task_id": task_id,
                    "message": f"🗑️ Deleted task: {existing_task.title}"
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to delete task",
                    "message": f"❌ Failed to delete task with ID {task_id}"
                }
        except ValueError as e:
            # Handle invalid UUID
            return {
                "success": False,
                "error": str(e),
                "message": f"❌ Invalid user or task ID: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"❌ Failed to delete task: {str(e)}"
            }

    def complete_task(self, user_id: str, task_id: str, completed: bool = True) -> Dict[str, Any]:
        """
        Mark a task as completed or change its status.

        Args:
            user_id: ID of the user requesting the update
            task_id: ID of the task to update
            completed: Whether the task is completed (for backward compatibility)

        Returns:
            Dictionary with completion result
        """
        try:
            # Convert user_id to UUID and resolve task_id (handles UUIDs, positions, and names)
            user_uuid = _ensure_uuid(user_id)
            task_uuid = _resolve_task_id(task_id, user_id, self.session)

            if task_uuid is None:
                return {
                    "success": False,
                    "error": "Task not found",
                    "message": f"❌ Task '{task_id}' not found"
                }

            # Get the existing task first
            existing_task = get_task_by_id(
                task_id=task_uuid,
                user_id=user_uuid,
                db_session=self.session
            )

            if not existing_task:
                return {
                    "success": False,
                    "error": "Task not found",
                    "message": f"❌ Task with ID {task_id} not found"
                }

            # Determine the new status based on the completed flag
            new_status = "completed" if completed else "pending"

            # Normalize status value to ensure it matches expected enum format
            normalized_new_status = _normalize_status_value(new_status)

            # Update the task with the new status
            updated_task = update_task(
                task_id=task_uuid,
                user_id=user_uuid,
                task_update=TaskUpdate(status=normalized_new_status),
                db_session=self.session
            )

            if updated_task:
                status_text = "completed" if completed else "marked pending"
                return {
                    "success": True,
                    "task_id": str(updated_task.id),
                    "message": f"✅ Task {status_text}: {updated_task.title}"
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to update task",
                    "message": f"❌ Failed to update task completion for ID {task_id}"
                }
        except ValueError as e:
            # Handle invalid UUID
            return {
                "success": False,
                "error": str(e),
                "message": f"❌ Invalid user or task ID: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"❌ Failed to update task completion: {str(e)}"
            }

    def get_available_tools(self) -> List[Dict[str, Any]]:
        """
        Get list of available MCP tools.

        Returns:
            List of tool definitions
        """
        # Note: The actual function signatures require user_id as first parameter,
        # but the AI doesn't need to know about it in the tool definition
        # According to the error, OpenRouter expects the function definition under a "function" key
        return [
            {
                "type": "function",
                "function": {
                    "name": "create_task",
                    "description": "Create a new task with title, description, due date, and priority",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "Title of the task"},
                            "description": {"type": "string", "description": "Description of the task"},
                            "due_date": {"type": "string", "description": "Due date in ISO format (YYYY-MM-DD)"},
                            "priority": {"type": "string", "description": "Priority level: low, medium, or high (case-insensitive, will be normalized)"},
                            "status": {"type": "string", "description": "Status: pending, in-progress, or completed (case-insensitive, will be normalized)"}
                        },
                        "required": ["title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "List all tasks, optionally filtered by status",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "status": {"type": "string", "description": "Filter by status: all, pending, in-progress, or completed"}
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Update an existing task with new information",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "string", "description": "ID of the task to update"},
                            "title": {"type": "string", "description": "New title for the task"},
                            "description": {"type": "string", "description": "New description for the task"},
                            "due_date": {"type": "string", "description": "New due date in ISO format"},
                            "priority": {"type": "string", "description": "New priority level: low, medium, or high (case-insensitive, will be normalized)"},
                            "status": {"type": "string", "description": "New status: pending, in-progress, or completed (case-insensitive, will be normalized)"}
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Delete a task by ID",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "string", "description": "ID of the task to delete"}
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "complete_task",
                    "description": "Mark a task as completed or pending",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "string", "description": "ID of the task to update"},
                            "completed": {"type": "boolean", "description": "Whether the task is completed (true for completed, false for pending) (default: true)"}
                        },
                        "required": ["task_id"]
                    }
                }
            }
        ]