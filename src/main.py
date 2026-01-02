"""
Entry point for the Todo Console Application.

This module serves as the main entry point for the application.
It initializes the CLI and runs it with the provided arguments.
"""

import sys
from todo_app.cli.cli import TodoCLI


def interactive_mode():
    """Run the application in interactive mode."""
    cli = TodoCLI()
    print("Welcome to the Interactive Todo App!")
    print("Commands: add, list, update, delete, complete, incomplete, quit")
    print("Type 'help' for detailed usage information.")

    while True:
        try:
            user_input = input("\nEnter command: ").strip()

            if not user_input:
                continue

            # Properly parse the command with arguments, handling quoted strings
            import shlex
            try:
                user_input = shlex.split(user_input)
            except ValueError:
                print("Error: Unmatched quotes in command. Please check your syntax.")
                continue

            if not user_input:
                continue

            command = user_input[0].lower()

            if command == 'quit' or command == 'exit':
                print("Goodbye!")
                break
            elif command == 'help':
                print("\nAvailable commands:")
                print("  add \"TITLE\"                                    : Add a new task")
                print("  add \"TITLE -- DESCRIPTION\"                     : Add a new task with description")
                print("  list                                         : List all tasks")
                print("  update ID \"TITLE\"                              : Update a task title")
                print("  update ID \"TITLE -- DESCRIPTION\"               : Update a task with title and description")
                print("  delete ID                                    : Delete a task")
                print("  complete ID                                  : Mark task as complete")
                print("  incomplete ID                                : Mark task as incomplete")
                print("  quit                                         : Exit the application")
                continue
            elif command in ['add', 'list', 'update', 'delete', 'complete', 'incomplete']:
                # Handle the command, catching any system exits to continue the interactive session
                try:
                    cli.run(user_input)
                except SystemExit:
                    # Continue the interactive session even if there's an error in the command
                    continue
            else:
                print(f"Unknown command: {command}. Type 'help' for available commands.")

        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except EOFError:
            print("\n\nGoodbye!")
            break


def main():
    """Main entry point for the application."""
    # Check if no arguments were provided (interactive mode)
    if len(sys.argv) == 1:
        interactive_mode()
    else:
        from todo_app.cli.cli import main as cli_main
        cli_main()


if __name__ == "__main__":
    main()