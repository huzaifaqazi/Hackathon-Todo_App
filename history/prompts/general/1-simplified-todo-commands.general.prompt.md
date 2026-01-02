---
id: 1
title: Simplified Todo Commands
stage: general
date_iso: 2025-12-31
surface: agent
model: Claude Sonnet 4.5
feature: none
branch: 001-todo-console-app
user: huzaifa
command: "Modify Todo app to simplify command format"
labels: ["todo", "cli", "usability"]
spec: null
ticket: null
adr: null
pr: null
---

# Simplified Todo Commands

## User Request
Modify the Todo app so that when adding a task, users only need to provide the task name without requiring `--title` and `--description` flags. Also simplify other operations to use just task name or ID.

## Implementation
Modified the CLI argument parsing to use positional arguments instead of named arguments:

### Changes Made:
1. Updated `src/todo_app/cli/cli.py`:
   - Changed add command to accept `task` as positional argument with support for title/description separator (`--`)
   - Changed update, delete, complete, and incomplete commands to accept ID as positional argument
   - Updated command handlers to work with new argument format

2. Updated `src/main.py`:
   - Updated help text to reflect new simplified command format

### New Command Format:
- Add: `todo add "task title"` or `todo add "title -- description"`
- Update: `todo update 1 "new title"` or `todo update 1 "title -- description"`
- Delete: `todo delete 1`
- Complete: `todo complete 1`
- Incomplete: `todo incomplete 1`
- List: `todo list`

## Files Modified
- `src/todo_app/cli/cli.py`
- `src/main.py`

## Testing
All commands tested successfully:
- Add tasks with and without description
- Update tasks with and without description
- Delete, complete, and incomplete operations
- List functionality

## Outcome
The Todo app now has a much simpler and more intuitive command interface while maintaining all existing functionality and validation.

## Response Summary
Successfully simplified the Todo app command format to allow users to add tasks with just the task name (e.g., `todo add "tomorrow shopping"`) instead of requiring verbose flags. All operations now use simpler formats while maintaining full functionality.