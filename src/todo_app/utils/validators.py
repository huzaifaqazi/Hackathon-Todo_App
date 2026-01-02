from typing import Optional


def validate_title(title: str) -> bool:
    """
    Validate a task title according to the specification.

    Args:
        title: The title to validate

    Returns:
        bool: True if the title is valid, False otherwise
    """
    if not title or len(title.strip()) == 0:
        return False

    if len(title) > 200:
        return False

    return True


def validate_description(description: Optional[str]) -> bool:
    """
    Validate a task description according to the specification.

    Args:
        description: The description to validate (can be None)

    Returns:
        bool: True if the description is valid, False otherwise
    """
    if description is None:
        return True

    if len(description) > 1000:
        return False

    return True


def validate_task_id(task_id: int) -> bool:
    """
    Validate a task ID according to the specification.

    Args:
        task_id: The ID to validate

    Returns:
        bool: True if the ID is valid, False otherwise
    """
    if not isinstance(task_id, int):
        return False

    if task_id <= 0:
        return False

    return True


def sanitize_title(title: str) -> str:
    """
    Sanitize a task title by stripping whitespace.

    Args:
        title: The title to sanitize

    Returns:
        str: The sanitized title
    """
    return title.strip()


def sanitize_description(description: Optional[str]) -> Optional[str]:
    """
    Sanitize a task description by returning it as-is or None.

    Args:
        description: The description to sanitize (can be None)

    Returns:
        Optional[str]: The sanitized description
    """
    return description