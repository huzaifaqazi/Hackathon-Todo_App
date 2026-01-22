# Data Model: Task CRUD Enhancement

## Task Entity

**Fields:**
- id (UUID/Integer): Primary key, unique identifier for the task
- title (String): Task title/name, required field
- description (Text): Detailed task description, optional field
- status (String): Task status (e.g., "pending", "in-progress", "completed"), default: "pending"
- created_at (DateTime): Timestamp when task was created
- updated_at (DateTime): Timestamp when task was last updated
- user_id (UUID/Integer): Foreign key linking to the user who owns the task

**Validation Rules:**
- Title must not be empty (min length: 1 character)
- Title must not exceed 255 characters
- Description, if provided, must not exceed 1000 characters
- Status must be one of the allowed values: "pending", "in-progress", "completed"
- user_id must reference an existing user record

**Relationships:**
- Belongs to: User (many-to-one relationship)
- User has many: Tasks (one-to-many relationship)

**State Transitions:**
- From "pending" to "in-progress" when task is started
- From "in-progress" to "completed" when task is finished
- From "completed" to "pending" if task needs to be reopened

## User Entity (Referenced)

**Fields:**
- id (UUID/Integer): Primary key, unique identifier for the user
- email (String): User's email address, unique
- username (String): User's display name, optional
- created_at (DateTime): Timestamp when user account was created

**Relationships:**
- Has many: Tasks (one-to-many relationship)
- Tasks belong to: User (many-to-one relationship)