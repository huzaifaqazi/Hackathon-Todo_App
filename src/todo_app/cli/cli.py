import argparse
import sys
import logging
from typing import Optional
from ..services.todo_service import TodoService


# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class TodoCLI:
    """
    Command-line interface for the Todo application.
    Handles all command-line argument parsing and user interaction.
    """

    def __init__(self):
        """Initialize the CLI with a TodoService instance."""
        self.service = TodoService()

    def run(self, args: Optional[list] = None) -> int:
        """
        Main entry point for the CLI application.

        Args:
            args: Command line arguments (for testing purposes, otherwise uses sys.argv)

        Returns:
            int: Exit code (0 for success, 1 for errors)
        """
        parser = argparse.ArgumentParser(
            description="Todo Console Application - Manage your tasks efficiently"
        )
        subparsers = parser.add_subparsers(dest="command", help="Available commands", required=True)

        # Add command - now accepts a single positional argument for the task
        add_parser = subparsers.add_parser("add", help="Add a new task")
        add_parser.add_argument("task", nargs='+', help="Task title and optional description (e.g., 'buy groceries' or 'buy groceries -- get milk and bread')")

        # List command
        list_parser = subparsers.add_parser("list", help="List all tasks")

        # Update command - now accepts ID as first positional argument, then new task text
        update_parser = subparsers.add_parser("update", help="Update an existing task")
        update_parser.add_argument("id", type=int, help="ID of the task to update")
        update_parser.add_argument("task", nargs='*', help="New title and optional description for the task")

        # Delete command - now accepts ID as positional argument
        delete_parser = subparsers.add_parser("delete", help="Delete a task")
        delete_parser.add_argument("id", type=int, help="ID of the task to delete")

        # Complete command - now accepts ID as positional argument
        complete_parser = subparsers.add_parser("complete", help="Mark a task as complete")
        complete_parser.add_argument("id", type=int, help="ID of the task to mark as complete")

        # Incomplete command - now accepts ID as positional argument
        incomplete_parser = subparsers.add_parser("incomplete", help="Mark a task as incomplete")
        incomplete_parser.add_argument("id", type=int, help="ID of the task to mark as incomplete")

        # Parse arguments
        parsed_args = parser.parse_args(args)

        try:
            # Route to appropriate command handler
            if parsed_args.command == "add":
                return self._handle_add(parsed_args)
            elif parsed_args.command == "list":
                return self._handle_list(parsed_args)
            elif parsed_args.command == "update":
                return self._handle_update(parsed_args)
            elif parsed_args.command == "delete":
                return self._handle_delete(parsed_args)
            elif parsed_args.command == "complete":
                return self._handle_complete(parsed_args)
            elif parsed_args.command == "incomplete":
                return self._handle_incomplete(parsed_args)
            else:
                # This shouldn't happen due to argparse validation, but included for completeness
                print(f"Unknown command: {parsed_args.command}", file=sys.stderr)
                return 1
        except ValueError as e:
            print(f"Error: {e}", file=sys.stderr)
            return 1
        except Exception as e:
            print(f"Unexpected error: {e}", file=sys.stderr)
            return 1

    def _handle_add(self, args) -> int:
        """Handle the 'add' command."""
        try:
            # Join the task parts to form the full task text
            task_parts = ' '.join(args.task)

            # Split the task text into title and description if there's a separator
            # We'll use a simple approach: if there's a separator like '--', split on it
            if '--' in task_parts:
                parts = task_parts.split('--', 1)  # Split only on first occurrence
                title = parts[0].strip()
                description = parts[1].strip()
            else:
                title = task_parts.strip()
                description = None

            logger.info(f"Adding task: title='{title}', description='{description}'")
            task = self.service.add_task(title, description)
            print("Task added successfully!")
            print(f"ID: {task.id}")
            print(f"Title: {task.title}")
            if task.description:
                print(f"Description: {task.description}")
            print(f"Status: {'Completed' if task.completed else 'Pending'}")
            logger.info(f"Task added successfully with ID: {task.id}")
            return 0
        except ValueError as e:
            logger.error(f"Error adding task: {e}")
            print(f"Error: {e}", file=sys.stderr)
            return 1

    def _handle_list(self, args) -> int:
        """Handle the 'list' command."""
        logger.info("Listing all tasks")
        tasks = self.service.list_tasks()

        if not tasks:
            print("Todo List is empty")
            logger.info("Todo list is empty")
        else:
            print("Todo List:")
            for task in tasks:
                status = "[x]" if task.completed else "[ ]"
                desc = f" - {task.description}" if task.description else ""
                print(f"{task.id}. {status} {task.title}{desc}")

            counts = self.service.get_task_counts()
            print(f"\nTotal tasks: {counts['total']}")
            print(f"Pending: {counts['pending']}")
            print(f"Completed: {counts['completed']}")
            logger.info(f"Listed {counts['total']} tasks")

        return 0

    def _handle_update(self, args) -> int:
        """Handle the 'update' command."""
        try:
            if args.task:  # If task text is provided
                # Join the task parts to form the full task text
                task_parts = ' '.join(args.task)

                # Split the task text into title and description if there's a separator
                if '--' in task_parts:
                    parts = task_parts.split('--', 1)  # Split only on first occurrence
                    title = parts[0].strip()
                    description = parts[1].strip()
                else:
                    title = task_parts.strip()
                    description = None
            else:
                # If no task text provided, we can't update anything
                print("Error: New task title is required", file=sys.stderr)
                return 1

            logger.info(f"Updating task ID {args.id}: title='{title}', description='{description}'")
            task = self.service.update_task(args.id, title, description)
            print("Task updated successfully!")
            print(f"ID: {task.id}")
            print(f"Title: {task.title}")
            if task.description:
                print(f"Description: {task.description}")
            logger.info(f"Task updated successfully with ID: {task.id}")
            return 0
        except ValueError as e:
            logger.error(f"Error updating task ID {args.id}: {e}")
            print(f"Error: {e}", file=sys.stderr)
            return 1

    def _handle_delete(self, args) -> int:
        """Handle the 'delete' command."""
        try:
            logger.info(f"Deleting task ID {args.id}")
            task = self.service.delete_task(args.id)
            print("Task deleted successfully!")
            print(f"ID: {task.id}")
            print(f"Title: {task.title}")
            logger.info(f"Task deleted successfully with ID: {task.id}")
            return 0
        except ValueError as e:
            logger.error(f"Error deleting task ID {args.id}: {e}")
            print(f"Error: {e}", file=sys.stderr)
            return 1

    def _handle_complete(self, args) -> int:
        """Handle the 'complete' command."""
        try:
            logger.info(f"Marking task ID {args.id} as complete")
            task = self.service.mark_task_complete(args.id)
            print("Task marked as complete!")
            print(f"ID: {task.id}")
            print(f"Title: {task.title}")
            logger.info(f"Task marked as complete with ID: {task.id}")
            return 0
        except ValueError as e:
            logger.error(f"Error marking task ID {args.id} as complete: {e}")
            print(f"Error: {e}", file=sys.stderr)
            return 1

    def _handle_incomplete(self, args) -> int:
        """Handle the 'incomplete' command."""
        try:
            logger.info(f"Marking task ID {args.id} as incomplete")
            task = self.service.mark_task_incomplete(args.id)
            print("Task marked as incomplete!")
            print(f"ID: {task.id}")
            print(f"Title: {task.title}")
            logger.info(f"Task marked as incomplete with ID: {task.id}")
            return 0
        except ValueError as e:
            logger.error(f"Error marking task ID {args.id} as incomplete: {e}")
            print(f"Error: {e}", file=sys.stderr)
            return 1


def main():
    """Main entry point for the application."""
    cli = TodoCLI()
    sys.exit(cli.run())


if __name__ == "__main__":
    main()