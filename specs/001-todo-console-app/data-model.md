# Data Model: Todo In-Memory Python Console App

## Task Entity

### Fields
- **id**: `int` (required, unique, auto-generated)
  - Unique identifier for each task
  - Auto-incremented integer starting from 1
  - Primary key for task identification

- **title**: `str` (required, min_length: 1, max_length: 200)
  - Title or subject of the task
  - Must be non-empty string
  - Maximum length of 200 characters

- **description**: `str` (optional, nullable, max_length: 1000)
  - Detailed description of the task
  - Can be empty or null
  - Maximum length of 1000 characters

- **completed**: `bool` (required, default: False)
  - Status indicator for task completion
  - True if task is completed, False if pending
  - Default value is False when task is created

### Relationships
- No relationships with other entities (standalone entity)

### Validation Rules
1. **ID uniqueness**: Each task must have a unique ID
2. **Title requirement**: Title must be provided and not empty
3. **Title length**: Title must be between 1 and 200 characters
4. **Description length**: Description (if provided) must be less than 1000 characters
5. **Status constraint**: Completed status must be boolean value

### State Transitions
- **Created**: New task with `completed = False`
- **Completed**: Task status changed to `completed = True`
- **Reopened**: Task status changed back to `completed = False`

## Todo List Collection

### Structure
- **Storage mechanism**: Dictionary mapping ID (int) to Task objects
- **Key**: Task ID (unique integer)
- **Value**: Task object instance

### Operations
- **Add**: Insert new Task with unique ID
- **Get**: Retrieve Task by ID
- **Update**: Modify existing Task properties
- **Delete**: Remove Task by ID
- **List**: Retrieve all Tasks in collection

### Constraints
1. **Memory only**: All data stored in memory, lost on application exit
2. **Unique IDs**: No duplicate IDs allowed in collection
3. **Thread safety**: Not thread-safe (single user console application)