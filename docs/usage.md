# Usage Documentation: Todo Console Application

## Overview

This document provides detailed instructions on how to use the Todo Console Application. The application allows users to manage their tasks through a command-line interface with add, list, update, delete, and completion marking functionality.

## Installation

### Prerequisites
- Python 3.13 or higher
- UV package manager

### Setup
1. Clone or create the project directory
2. Install UV package manager if not already installed:
   ```bash
   pip install uv
   ```
3. Create the project structure and install dependencies:
   ```bash
   uv sync --dev
   ```

## Running the Application

### Direct Execution
```bash
python src/main.py [command] [options]
```

### Using the Installed Command
```bash
todo [command] [options]
```

## Available Commands

### Add a Task
Add a new task to the todo list.

```bash
python src/main.py add --title "Task Title" --description "Task Description"
```

**Options:**
- `--title` (required): Title of the task (1-200 characters)
- `--description` (optional): Description of the task (max 1000 characters)

**Example:**
```bash
python src/main.py add --title "Buy groceries" --description "Milk, bread, eggs"
```

**Success Output:**
```
Task added successfully!
ID: 1
Title: Buy groceries
Description: Milk, bread, eggs
Status: Pending
```

### List All Tasks
Display all tasks in the todo list.

```bash
python src/main.py list
```

**Example:**
```bash
python src/main.py list
```

**Success Output:**
```
Todo List:
1. [ ] Buy groceries - Milk, bread, eggs
2. [x] Complete project - Final implementation
3. [ ] Schedule meeting - With team lead

Total tasks: 3
Pending: 2
Completed: 1
```

**Empty List Output:**
```
Todo List is empty
```

### Update a Task
Update the title or description of an existing task.

```bash
python src/main.py update --id 1 --title "New Title" --description "New Description"
```

**Options:**
- `--id` (required): ID of the task to update
- `--title` (optional): New title for the task (1-200 characters)
- `--description` (optional): New description for the task (max 1000 characters)

**Example:**
```bash
python src/main.py update --id 1 --title "Buy weekly groceries"
python src/main.py update --id 1 --title "Buy weekly groceries" --description "Milk, bread, eggs, fruits"
```

**Success Output:**
```
Task updated successfully!
ID: 1
Title: Buy weekly groceries
Description: Milk, bread, eggs, fruits
```

### Delete a Task
Remove a task from the todo list.

```bash
python src/main.py delete --id 1
```

**Options:**
- `--id` (required): ID of the task to delete

**Example:**
```bash
python src/main.py delete --id 1
```

**Success Output:**
```
Task deleted successfully!
ID: 1
Title: Buy groceries
```

### Mark Task Complete
Mark a task as completed.

```bash
python src/main.py complete --id 1
```

**Options:**
- `--id` (required): ID of the task to mark as complete

**Example:**
```bash
python src/main.py complete --id 1
```

**Success Output:**
```
Task marked as complete!
ID: 1
Title: Buy groceries
```

### Mark Task Incomplete
Mark a task as incomplete (pending).

```bash
python src/main.py incomplete --id 1
```

**Options:**
- `--id` (required): ID of the task to mark as incomplete

**Example:**
```bash
python src/main.py incomplete --id 1
```

**Success Output:**
```
Task marked as incomplete!
ID: 1
Title: Buy groceries
```

## Error Handling

### Invalid Task ID
**Scenario:** User provides an ID that doesn't exist
**Output:** `Error: Task with ID {id} not found`
**Exit Code:** `1`

### Invalid Input
**Scenario:** User provides invalid input (e.g., empty title, negative ID)
**Output:** `Error: {specific error message}`
**Exit Code:** `1`

### Missing Required Arguments
**Scenario:** User doesn't provide required arguments
**Output:** Built-in argparse error message with usage
**Exit Code:** `2` (argparse default)

## Task Status Indicators

- Pending task: `[ ]` (empty brackets)
- Completed task: `[x]` (cross in brackets)

## Validation Rules

### Title Validation
- Required field
- Must be 1-200 characters
- Cannot be empty or whitespace-only

### Description Validation
- Optional field
- Maximum 1000 characters
- Can be empty

### ID Validation
- Must be positive integer
- Must correspond to existing task
- Must be greater than 0

### Task Existence
- All operations requiring an ID must verify the task exists
- Operations on non-existent tasks return error

## Exit Codes

- `0`: Success
- `1`: Error (invalid input, validation failure, task not found)
- `2`: Error (missing required arguments - argparse default)

## Examples

### Complete Workflow
```bash
# Add tasks
python src/main.py add --title "Setup project" --description "Initialize project structure"
python src/main.py add --title "Write documentation"

# List all tasks
python src/main.py list

# Update a task
python src/main.py update --id 1 --title "Setup project structure"

# Mark a task as complete
python src/main.py complete --id 1

# List tasks again to see changes
python src/main.py list

# Delete a task
python src/main.py delete --id 2
```

## Troubleshooting

- **Command not found**: Ensure you've installed the package with `uv pip install -e .`
- **Python version error**: Ensure you're using Python 3.13 or higher
- **Dependency issues**: Try running `uv sync --refresh` to refresh dependencies
- **Permission errors**: Ensure you have write permissions in the project directory