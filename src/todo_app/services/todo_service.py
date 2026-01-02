from typing import Dict, List, Optional
from ..models.task import Task


class TodoService:
    """
    Core business logic for task management.
    Handles all operations related to tasks including add, list, update, delete, and status changes.
    """

    def __init__(self):
        """Initialize the service with an empty task collection and ID counter."""
        self.tasks: Dict[int, Task] = {}
        self._next_id: int = 1

    def _generate_id(self) -> int:
        """Generate a unique ID for a new task."""
        new_id = self._next_id
        self._next_id += 1
        return new_id

    def add_task(self, title: str, description: Optional[str] = None) -> Task:
        """
        Add a new task to the todo list.

        Args:
            title: Title of the task (required)
            description: Description of the task (optional)

        Returns:
            Task: The newly created task with a unique ID

        Raises:
            ValueError: If title is invalid
        """
        # Validate title before creating task
        if not title or len(title.strip()) == 0:
            raise ValueError("Title is required and cannot be empty")

        if len(title) > 200:
            raise ValueError("Title must be 200 characters or less")

        if description and len(description) > 1000:
            raise ValueError("Description must be 1000 characters or less")

        # Create task with unique ID
        task_id = self._generate_id()
        task = Task(id=task_id, title=title.strip(), description=description, completed=False)

        # Add to collection
        self.tasks[task_id] = task
        return task

    def list_tasks(self) -> List[Task]:
        """
        Retrieve all tasks in the todo list.

        Returns:
            List[Task]: All tasks sorted by ID
        """
        return sorted(self.tasks.values(), key=lambda t: t.id)

    def get_task(self, task_id: int) -> Optional[Task]:
        """
        Retrieve a specific task by ID.

        Args:
            task_id: The ID of the task to retrieve

        Returns:
            Task: The task if found, None otherwise
        """
        return self.tasks.get(task_id)

    def update_task(self, task_id: int, title: Optional[str] = None, description: Optional[str] = None) -> Task:
        """
        Update an existing task's title or description.

        Args:
            task_id: ID of the task to update
            title: New title (optional)
            description: New description (optional)

        Returns:
            Task: The updated task

        Raises:
            ValueError: If task doesn't exist or new values are invalid
        """
        if task_id not in self.tasks:
            raise ValueError(f"Task with ID {task_id} not found")

        task = self.tasks[task_id]

        # Apply updates if provided
        if title is not None:
            if not title or len(title.strip()) == 0:
                raise ValueError("Title is required and cannot be empty")

            if len(title) > 200:
                raise ValueError("Title must be 200 characters or less")

            task.title = title.strip()

        if description is not None:
            if len(description) > 1000:
                raise ValueError("Description must be 1000 characters or less")

            task.description = description

        return task

    def delete_task(self, task_id: int) -> Task:
        """
        Remove a task from the todo list.

        Args:
            task_id: ID of the task to delete

        Returns:
            Task: The deleted task

        Raises:
            ValueError: If task doesn't exist
        """
        if task_id not in self.tasks:
            raise ValueError(f"Task with ID {task_id} not found")

        task = self.tasks.pop(task_id)
        return task

    def mark_task_complete(self, task_id: int) -> Task:
        """
        Mark a task as completed.

        Args:
            task_id: ID of the task to mark as complete

        Returns:
            Task: The updated task

        Raises:
            ValueError: If task doesn't exist
        """
        if task_id not in self.tasks:
            raise ValueError(f"Task with ID {task_id} not found")

        task = self.tasks[task_id]
        task.completed = True
        return task

    def mark_task_incomplete(self, task_id: int) -> Task:
        """
        Mark a task as incomplete (pending).

        Args:
            task_id: ID of the task to mark as incomplete

        Returns:
            Task: The updated task

        Raises:
            ValueError: If task doesn't exist
        """
        if task_id not in self.tasks:
            raise ValueError(f"Task with ID {task_id} not found")

        task = self.tasks[task_id]
        task.completed = False
        return task

    def get_task_counts(self) -> Dict[str, int]:
        """
        Get counts of total, pending, and completed tasks.

        Returns:
            Dict with keys: 'total', 'pending', 'completed'
        """
        total = len(self.tasks)
        completed = sum(1 for task in self.tasks.values() if task.completed)
        pending = total - completed

        return {
            'total': total,
            'pending': pending,
            'completed': completed
        }