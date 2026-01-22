# Task API Contract

## Base URL
`/api/v1/tasks`

## Endpoints

### GET /
Retrieve all tasks for the authenticated user

#### Headers
```
Authorization: Bearer {jwt_token}
```

#### Query Parameters
- status: Filter by status (pending, in-progress, completed)
- priority: Filter by priority (low, medium, high)
- limit: Number of records to return (default: 20, max: 100)
- offset: Number of records to skip (default: 0)

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "uuid-string",
        "title": "Complete project",
        "description": "Finish the project documentation",
        "status": "pending",
        "priority": "high",
        "user_id": "user-uuid-string",
        "due_date": "2023-12-31T23:59:59Z",
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z"
      }
    ],
    "total_count": 1,
    "limit": 20,
    "offset": 0
  }
}
```

#### Error Responses
- 401: Invalid or expired token

### POST /
Create a new task for the authenticated user

#### Headers
```
Authorization: Bearer {jwt_token}
```

#### Request
```json
{
  "title": "Complete project",
  "description": "Finish the project documentation",
  "status": "pending",
  "priority": "high",
  "due_date": "2023-12-31T23:59:59Z"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "id": "uuid-string",
      "title": "Complete project",
      "description": "Finish the project documentation",
      "status": "pending",
      "priority": "high",
      "user_id": "user-uuid-string",
      "due_date": "2023-12-31T23:59:59Z",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  }
}
```

#### Error Responses
- 400: Invalid input data
- 401: Invalid or expired token

### GET /{task_id}
Retrieve a specific task by ID

#### Headers
```
Authorization: Bearer {jwt_token}
```

#### Parameters
- task_id: UUID of the task to retrieve

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "uuid-string",
      "title": "Complete project",
      "description": "Finish the project documentation",
      "status": "pending",
      "priority": "high",
      "user_id": "user-uuid-string",
      "due_date": "2023-12-31T23:59:59Z",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  }
}
```

#### Error Responses
- 401: Invalid or expired token
- 404: Task not found or user doesn't have access

### PUT /{task_id}
Update an existing task

#### Headers
```
Authorization: Bearer {jwt_token}
```

#### Parameters
- task_id: UUID of the task to update

#### Request
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "in-progress",
  "priority": "medium",
  "due_date": "2023-12-31T23:59:59Z"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "task": {
      "id": "uuid-string",
      "title": "Updated task title",
      "description": "Updated description",
      "status": "in-progress",
      "priority": "medium",
      "user_id": "user-uuid-string",
      "due_date": "2023-12-31T23:59:59Z",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-02T00:00:00Z"
    }
  }
}
```

#### Error Responses
- 400: Invalid input data
- 401: Invalid or expired token
- 404: Task not found or user doesn't have access

### DELETE /{task_id}
Delete a specific task

#### Headers
```
Authorization: Bearer {jwt_token}
```

#### Parameters
- task_id: UUID of the task to delete

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

#### Error Responses
- 401: Invalid or expired token
- 404: Task not found or user doesn't have access