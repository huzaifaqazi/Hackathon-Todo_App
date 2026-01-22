# Data Model: Todo Full-Stack Web Application

## Entities

### User
- **Description**: Represents a registered user of the system
- **Fields**:
  - id (UUID/Integer): Primary key, unique identifier
  - email (String): Unique, required, valid email format
  - hashed_password (String): Required, securely hashed password
  - first_name (String): Optional, max length 50
  - last_name (String): Optional, max length 50
  - is_active (Boolean): Default true, indicates account status
  - created_at (DateTime): Auto-generated timestamp
  - updated_at (DateTime): Auto-generated timestamp, updated on changes

- **Validation Rules**:
  - Email must be unique and valid format
  - Password must meet security requirements (length, complexity)
  - Email and password required for registration

- **Relationships**:
  - One-to-many with Task (user has many tasks)

### Task
- **Description**: Represents a to-do item created by a user
- **Fields**:
  - id (UUID/Integer): Primary key, unique identifier
  - title (String): Required, max length 200
  - description (Text): Optional, detailed description
  - status (Enum): Required, values ['pending', 'in-progress', 'completed']
  - priority (Enum): Required, values ['low', 'medium', 'high']
  - user_id (UUID/Integer): Foreign key linking to User
  - due_date (DateTime): Optional, deadline for task completion
  - created_at (DateTime): Auto-generated timestamp
  - updated_at (DateTime): Auto-generated timestamp, updated on changes

- **Validation Rules**:
  - Title is required and must be 1-200 characters
  - Status must be one of the allowed enum values
  - Priority must be one of the allowed enum values
  - User_id must reference an existing user
  - Due date cannot be in the past (optional validation)

- **Relationships**:
  - Many-to-one with User (task belongs to one user)

### Session (Authentication)
- **Description**: Represents an active user session managed by JWT tokens
- **Fields**:
  - id (UUID/Integer): Primary key, unique identifier
  - user_id (UUID/Integer): Foreign key linking to User
  - token_hash (String): Hashed JWT token for validation
  - expires_at (DateTime): Expiration timestamp
  - created_at (DateTime): Auto-generated timestamp
  - is_revoked (Boolean): Default false, indicates if session is invalid

- **Validation Rules**:
  - Token hash is required and unique
  - Expires_at must be in the future
  - User_id must reference an existing user

- **Relationships**:
  - Many-to-one with User (session belongs to one user)

## State Transitions

### Task Status Transitions
- pending → in-progress: When user starts working on task
- in-progress → completed: When user finishes task
- completed → pending: When user reopens completed task
- in-progress → pending: When user stops working on task

### User Account States
- inactive → active: After email verification
- active → suspended: For policy violations (future feature)
- active → deactivated: When user requests account deletion (soft delete)

## Indexes

### Required Indexes
- User.email: Unique index for fast login and uniqueness enforcement
- Task.user_id: Index for efficient user-specific task retrieval
- Task.status: Index for filtering tasks by status
- Task.due_date: Index for sorting and filtering by deadline
- Session.token_hash: Index for fast session validation
- Session.expires_at: Index for efficient cleanup of expired sessions

## Constraints

### Database-Level Constraints
- User email uniqueness constraint
- Task user_id foreign key constraint with cascade options
- Task status and priority enum constraints
- Session token_hash uniqueness constraint
- Non-null constraints on required fields
- Length constraints on string fields

### Application-Level Constraints
- Users can only access their own tasks
- Tasks cannot be created without valid user reference
- Session validation against expiration time
- Password strength requirements