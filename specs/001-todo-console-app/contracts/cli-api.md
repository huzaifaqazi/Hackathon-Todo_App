# CLI API Contract: Todo In-Memory Python Console App

## Overview

This document defines the command-line interface contract for the Todo console application. The application provides a command-line interface for managing tasks with add, view, update, delete, and completion marking functionality.

## Command Structure

All commands follow the pattern: `python main.py <command> [options]`

## Commands

### 1. Add Task

**Command**: `add`

**Purpose**: Add a new task to the todo list

**Arguments**:
- `--title` (required, string): Title of the task (1-200 characters)
- `--description` (optional, string): Description of the task (max 1000 characters)

**Exit Codes**:
- `0`: Success
- `1`: Error (invalid input, validation failure)

**Examples**:
```bash
python main.py add --title "Buy groceries"
python main.py add --title "Buy groceries" --description "Milk, bread, eggs"
```

**Success Output**:
```
Task added successfully!
ID: 1
Title: Buy groceries
Description: Milk, bread, eggs
Status: Pending
```

**Error Output**:
```
Error: Title is required and cannot be empty
```

### 2. List Tasks

**Command**: `list`

**Purpose**: Display all tasks in the todo list

**Arguments**: None

**Exit Codes**:
- `0`: Success
- `1`: Error (no tasks found returns 0, but with empty list message)

**Examples**:
```bash
python main.py list
```

**Success Output**:
```
Todo List:
1. [ ] Buy groceries - Milk, bread, eggs
2. [x] Complete project - Final implementation
3. [ ] Schedule meeting - With team lead

Total tasks: 3
Pending: 2
Completed: 1
```

**Empty List Output**:
```
Todo List is empty
```

### 3. Update Task

**Command**: `update`

**Purpose**: Update the title or description of an existing task

**Arguments**:
- `--id` (required, int): ID of the task to update
- `--title` (optional, string): New title for the task (1-200 characters)
- `--description` (optional, string): New description for the task (max 1000 characters)

**Exit Codes**:
- `0`: Success
- `1`: Error (task not found, invalid ID, validation failure)

**Examples**:
```bash
python main.py update --id 1 --title "Buy weekly groceries"
python main.py update --id 1 --title "Buy weekly groceries" --description "Milk, bread, eggs, fruits"
```

**Success Output**:
```
Task updated successfully!
ID: 1
Title: Buy weekly groceries
Description: Milk, bread, eggs, fruits
```

**Error Output**:
```
Error: Task with ID 1 not found
```

### 4. Delete Task

**Command**: `delete`

**Purpose**: Remove a task from the todo list

**Arguments**:
- `--id` (required, int): ID of the task to delete

**Exit Codes**:
- `0`: Success
- `1`: Error (task not found, invalid ID)

**Examples**:
```bash
python main.py delete --id 1
```

**Success Output**:
```
Task deleted successfully!
ID: 1
Title: Buy groceries
```

**Error Output**:
```
Error: Task with ID 1 not found
```

### 5. Mark Task Complete

**Command**: `complete`

**Purpose**: Mark a task as completed

**Arguments**:
- `--id` (required, int): ID of the task to mark as complete

**Exit Codes**:
- `0`: Success
- `1`: Error (task not found, invalid ID)

**Examples**:
```bash
python main.py complete --id 1
```

**Success Output**:
```
Task marked as complete!
ID: 1
Title: Buy groceries
```

**Error Output**:
```
Error: Task with ID 1 not found
```

### 6. Mark Task Incomplete

**Command**: `incomplete`

**Purpose**: Mark a task as incomplete (pending)

**Arguments**:
- `--id` (required, int): ID of the task to mark as incomplete

**Exit Codes**:
- `0`: Success
- `1`: Error (task not found, invalid ID)

**Examples**:
```bash
python main.py incomplete --id 1
```

**Success Output**:
```
Task marked as incomplete!
ID: 1
Title: Buy groceries
```

**Error Output**:
```
Error: Task with ID 1 not found
```

## Common Error Cases

### Invalid Task ID
**Scenario**: User provides an ID that doesn't exist
**Output**: `Error: Task with ID {id} not found`
**Exit Code**: `1`

### Invalid Input
**Scenario**: User provides invalid input (e.g., empty title, negative ID)
**Output**: `Error: {specific error message}`
**Exit Code**: `1`

### Missing Required Arguments
**Scenario**: User doesn't provide required arguments
**Output**: Built-in argparse error message with usage
**Exit Code**: `2` (argparse default)

## Output Format Specifications

### Task Status Indicators
- Pending task: `[ ]` (empty brackets)
- Completed task: `[x]` (cross in brackets)

### List Command Format
```
Todo List:
{id}. [{status}] {title} - {description}
{id}. [{status}] {title} - {description}

Total tasks: {count}
Pending: {pending_count}
Completed: {completed_count}
```

### Success Message Format
```
{Operation} successfully!
ID: {id}
Title: {title}
[Description: {description}] (if applicable)
```

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