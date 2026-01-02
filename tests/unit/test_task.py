"""
Unit tests for the Task model.
"""
import pytest
from src.todo_app.models.task import Task


class TestTask:
    """Test cases for the Task data model."""

    def test_task_creation_valid(self):
        """Test creating a valid task."""
        task = Task(id=1, title="Test Task", description="Test Description", completed=False)
        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description == "Test Description"
        assert task.completed is False

    def test_task_creation_defaults(self):
        """Test creating a task with default values."""
        task = Task(id=1, title="Test Task")
        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description is None
        assert task.completed is False

    def test_task_title_required(self):
        """Test that creating a task with empty title raises an error."""
        with pytest.raises(ValueError, match="Title is required and cannot be empty"):
            Task(id=1, title="")

    def test_task_title_whitespace_only(self):
        """Test that creating a task with whitespace-only title raises an error."""
        with pytest.raises(ValueError, match="Title is required and cannot be empty"):
            Task(id=1, title="   ")

    def test_task_title_too_long(self):
        """Test that creating a task with title longer than 200 chars raises an error."""
        long_title = "A" * 201
        with pytest.raises(ValueError, match="Title must be 200 characters or less"):
            Task(id=1, title=long_title)

    def test_task_description_too_long(self):
        """Test that creating a task with description longer than 1000 chars raises an error."""
        long_description = "A" * 1001
        with pytest.raises(ValueError, match="Description must be 1000 characters or less"):
            Task(id=1, title="Test Task", description=long_description)