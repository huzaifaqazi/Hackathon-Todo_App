"""
Integration tests for the CLI interface.
"""
import sys
from io import StringIO
from unittest.mock import patch
import pytest
from src.todo_app.cli.cli import TodoCLI


class TestCLI:
    """Integration tests for the CLI interface."""

    def setup_method(self):
        """Set up a fresh TodoCLI instance for each test."""
        self.cli = TodoCLI()

    def test_add_task_command(self):
        """Test the add command through CLI."""
        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output

        # Mock command line arguments for adding a task
        test_args = ["add", "--title", "Test Task", "--description", "Test Description"]

        # Run the CLI with test args
        exit_code = self.cli.run(test_args)

        # Restore stdout
        sys.stdout = sys.__stdout__

        output = captured_output.getvalue()

        # Verify the exit code and output
        assert exit_code == 0
        assert "Task added successfully!" in output
        assert "Test Task" in output
        assert "Test Description" in output
        assert "Pending" in output

    def test_list_tasks_command_empty(self):
        """Test the list command when no tasks exist."""
        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output

        # Mock command line arguments for listing tasks
        test_args = ["list"]

        # Run the CLI with test args
        exit_code = self.cli.run(test_args)

        # Restore stdout
        sys.stdout = sys.__stdout__

        output = captured_output.getvalue()

        # Verify the exit code and output
        assert exit_code == 0
        assert "Todo List is empty" in output

    def test_list_tasks_command_with_tasks(self):
        """Test the list command when tasks exist."""
        # First add a task
        self.cli.service.add_task("Test Task", "Test Description")
        self.cli.service.add_task("Another Task")

        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output

        # Mock command line arguments for listing tasks
        test_args = ["list"]

        # Run the CLI with test args
        exit_code = self.cli.run(test_args)

        # Restore stdout
        sys.stdout = sys.__stdout__

        output = captured_output.getvalue()

        # Verify the exit code and output
        assert exit_code == 0
        assert "Todo List:" in output
        assert "Test Task" in output
        assert "Another Task" in output
        assert "Total tasks: 2" in output

    def test_complete_task_command(self):
        """Test the complete command through CLI."""
        # First add a task
        task = self.cli.service.add_task("Test Task")

        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output

        # Mock command line arguments for completing a task
        test_args = ["complete", "--id", str(task.id)]

        # Run the CLI with test args
        exit_code = self.cli.run(test_args)

        # Restore stdout
        sys.stdout = sys.__stdout__

        output = captured_output.getvalue()

        # Verify the exit code and output
        assert exit_code == 0
        assert "Task marked as complete!" in output
        assert str(task.id) in output
        assert "Test Task" in output

    def test_incomplete_task_command(self):
        """Test the incomplete command through CLI."""
        # First add and complete a task
        task = self.cli.service.add_task("Test Task")
        self.cli.service.mark_task_complete(task.id)

        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output

        # Mock command line arguments for marking task as incomplete
        test_args = ["incomplete", "--id", str(task.id)]

        # Run the CLI with test args
        exit_code = self.cli.run(test_args)

        # Restore stdout
        sys.stdout = sys.__stdout__

        output = captured_output.getvalue()

        # Verify the exit code and output
        assert exit_code == 0
        assert "Task marked as incomplete!" in output
        assert str(task.id) in output
        assert "Test Task" in output

    def test_update_task_command(self):
        """Test the update command through CLI."""
        # First add a task
        task = self.cli.service.add_task("Original Task", "Original Description")

        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output

        # Mock command line arguments for updating a task
        test_args = ["update", "--id", str(task.id), "--title", "Updated Task", "--description", "Updated Description"]

        # Run the CLI with test args
        exit_code = self.cli.run(test_args)

        # Restore stdout
        sys.stdout = sys.__stdout__

        output = captured_output.getvalue()

        # Verify the exit code and output
        assert exit_code == 0
        assert "Task updated successfully!" in output
        assert "Updated Task" in output
        assert "Updated Description" in output

    def test_delete_task_command(self):
        """Test the delete command through CLI."""
        # First add a task
        task = self.cli.service.add_task("Test Task")

        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output

        # Mock command line arguments for deleting a task
        test_args = ["delete", "--id", str(task.id)]

        # Run the CLI with test args
        exit_code = self.cli.run(test_args)

        # Restore stdout
        sys.stdout = sys.__stdout__

        output = captured_output.getvalue()

        # Verify the exit code and output
        assert exit_code == 0
        assert "Task deleted successfully!" in output
        assert str(task.id) in output
        assert "Test Task" in output

    def test_invalid_task_id_error(self):
        """Test that CLI properly handles invalid task IDs."""
        # Capture stdout and stderr
        captured_output = StringIO()
        captured_error = StringIO()
        sys.stdout = captured_output
        sys.stderr = captured_error

        # Mock command line arguments for completing a non-existent task
        test_args = ["complete", "--id", "999"]

        # Run the CLI with test args
        exit_code = self.cli.run(test_args)

        # Restore stdout and stderr
        sys.stdout = sys.__stdout__
        sys.stderr = sys.__stderr__

        error_output = captured_error.getvalue()

        # Verify the exit code and error output
        assert exit_code == 1
        assert "Error: Task with ID 999 not found" in error_output

    def test_invalid_title_error(self):
        """Test that CLI properly handles invalid titles."""
        # Capture stdout and stderr
        captured_output = StringIO()
        captured_error = StringIO()
        sys.stdout = captured_output
        sys.stderr = captured_error

        # Mock command line arguments for adding a task with empty title
        test_args = ["add", "--title", ""]

        # Run the CLI with test args
        exit_code = self.cli.run(test_args)

        # Restore stdout and stderr
        sys.stdout = sys.__stdout__
        sys.stderr = sys.__stderr__

        error_output = captured_error.getvalue()

        # Verify the exit code and error output
        assert exit_code == 1
        assert "Error: Title is required and cannot be empty" in error_output