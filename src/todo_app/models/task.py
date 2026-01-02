from dataclasses import dataclass
from typing import Optional


@dataclass
class Task:
    """
    Represents a todo task with ID, title, description, and completion status.

    Fields:
    - id: Unique identifier for each task (int, required)
    - title: Title or subject of the task (str, required, min_length: 1, max_length: 200)
    - description: Detailed description of the task (str, optional, max_length: 1000)
    - completed: Status indicator for task completion (bool, required, default: False)
    """
    id: int
    title: str
    description: Optional[str] = None
    completed: bool = False

    def __post_init__(self):
        """Validate task properties after initialization."""
        if not self.title or len(self.title.strip()) == 0:
            raise ValueError("Title is required and cannot be empty")

        if len(self.title) > 200:
            raise ValueError("Title must be 200 characters or less")

        if self.description and len(self.description) > 1000:
            raise ValueError("Description must be 1000 characters or less")