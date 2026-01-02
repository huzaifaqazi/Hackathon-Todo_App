"""
Unit tests for the TodoService.
"""
import pytest
from src.todo_app.services.todo_service import TodoService
from src.todo_app.models.task import Task


class TestTodoService:
    """Test cases for the TodoService."""

    def setup_method(self):
        """Set up a fresh TodoService instance for each test."""
        self.service = TodoService()

    def test_add_task_success(self):
        """Test adding a valid task."""
        task = self.service.add_task("Test Task", "Test Description")
        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description == "Test Description"
        assert task.completed is False
        assert len(self.service.tasks) == 1

    def test_add_task_without_description(self):
        """Test adding a task without a description."""
        task = self.service.add_task("Test Task")
        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description is None
        assert task.completed is False

    def test_add_task_invalid_title_empty(self):
        """Test adding a task with empty title raises an error."""
        with pytest.raises(ValueError, match="Title is required and cannot be empty"):
            self.service.add_task("", "Test Description")

    def test_add_task_invalid_title_whitespace(self):
        """Test adding a task with whitespace-only title raises an error."""
        with pytest.raises(ValueError, match="Title is required and cannot be empty"):
            self.service.add_task("   ", "Test Description")

    def test_add_task_invalid_title_too_long(self):
        """Test adding a task with title longer than 200 chars raises an error."""
        long_title = "A" * 201
        with pytest.raises(ValueError, match="Title must be 200 characters or less"):
            self.service.add_task(long_title, "Test Description")

    def test_add_task_invalid_description_too_long(self):
        """Test adding a task with description longer than 1000 chars raises an error."""
        long_description = "A" * 1001
        with pytest.raises(ValueError, match="Description must be 1000 characters or less"):
            self.service.add_task("Test Task", long_description)

    def test_list_tasks_empty(self):
        """Test listing tasks when no tasks exist."""
        tasks = self.service.list_tasks()
        assert len(tasks) == 0

    def test_list_tasks_with_tasks(self):
        """Test listing tasks when tasks exist."""
        task1 = self.service.add_task("Task 1")
        task2 = self.service.add_task("Task 2")
        tasks = self.service.list_tasks()
        assert len(tasks) == 2
        assert tasks[0].id == 1
        assert tasks[1].id == 2

    def test_get_task_exists(self):
        """Test getting an existing task."""
        task = self.service.add_task("Test Task")
        retrieved_task = self.service.get_task(task.id)
        assert retrieved_task is not None
        assert retrieved_task.id == task.id
        assert retrieved_task.title == task.title

    def test_get_task_not_exists(self):
        """Test getting a non-existent task returns None."""
        retrieved_task = self.service.get_task(999)
        assert retrieved_task is None

    def test_update_task_title(self):
        """Test updating a task's title."""
        task = self.service.add_task("Original Task")
        updated_task = self.service.update_task(task.id, title="Updated Task")
        assert updated_task.title == "Updated Task"
        assert self.service.get_task(task.id).title == "Updated Task"

    def test_update_task_description(self):
        """Test updating a task's description."""
        task = self.service.add_task("Test Task", "Original Description")
        updated_task = self.service.update_task(task.id, description="Updated Description")
        assert updated_task.description == "Updated Description"
        assert self.service.get_task(task.id).description == "Updated Description"

    def test_update_task_both_fields(self):
        """Test updating both title and description of a task."""
        task = self.service.add_task("Original Task", "Original Description")
        updated_task = self.service.update_task(task.id, title="Updated Task", description="Updated Description")
        assert updated_task.title == "Updated Task"
        assert updated_task.description == "Updated Description"
        current_task = self.service.get_task(task.id)
        assert current_task.title == "Updated Task"
        assert current_task.description == "Updated Description"

    def test_update_task_invalid_id(self):
        """Test updating a non-existent task raises an error."""
        with pytest.raises(ValueError, match="Task with ID 999 not found"):
            self.service.update_task(999, title="Updated Task")

    def test_update_task_invalid_title(self):
        """Test updating a task with invalid title raises an error."""
        task = self.service.add_task("Test Task")
        with pytest.raises(ValueError, match="Title is required and cannot be empty"):
            self.service.update_task(task.id, title="")

    def test_delete_task_success(self):
        """Test deleting an existing task."""
        task = self.service.add_task("Test Task")
        deleted_task = self.service.delete_task(task.id)
        assert deleted_task.id == task.id
        assert deleted_task.title == task.title
        assert len(self.service.tasks) == 0

    def test_delete_task_invalid_id(self):
        """Test deleting a non-existent task raises an error."""
        with pytest.raises(ValueError, match="Task with ID 999 not found"):
            self.service.delete_task(999)

    def test_mark_task_complete(self):
        """Test marking a task as complete."""
        task = self.service.add_task("Test Task")
        assert task.completed is False
        completed_task = self.service.mark_task_complete(task.id)
        assert completed_task.completed is True
        assert self.service.get_task(task.id).completed is True

    def test_mark_task_incomplete(self):
        """Test marking a task as incomplete."""
        task = self.service.add_task("Test Task")
        completed_task = self.service.mark_task_complete(task.id)
        assert completed_task.completed is True
        incomplete_task = self.service.mark_task_incomplete(task.id)
        assert incomplete_task.completed is False
        assert self.service.get_task(task.id).completed is False

    def test_mark_task_complete_invalid_id(self):
        """Test marking a non-existent task as complete raises an error."""
        with pytest.raises(ValueError, match="Task with ID 999 not found"):
            self.service.mark_task_complete(999)

    def test_mark_task_incomplete_invalid_id(self):
        """Test marking a non-existent task as incomplete raises an error."""
        with pytest.raises(ValueError, match="Task with ID 999 not found"):
            self.service.mark_task_incomplete(999)

    def test_get_task_counts_empty(self):
        """Test getting task counts when no tasks exist."""
        counts = self.service.get_task_counts()
        assert counts['total'] == 0
        assert counts['pending'] == 0
        assert counts['completed'] == 0

    def test_get_task_counts_mixed(self):
        """Test getting task counts with mixed status tasks."""
        task1 = self.service.add_task("Pending Task")
        task2 = self.service.add_task("Completed Task")
        self.service.mark_task_complete(task2.id)

        counts = self.service.get_task_counts()
        assert counts['total'] == 2
        assert counts['pending'] == 1
        assert counts['completed'] == 1