# Task API Documentation

## Overview
The Task API provides full CRUD (Create, Read, Update, Delete) operations for managing tasks in the Todo application. All endpoints require authentication via JWT token.

## Authentication
All task endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token_here>
```

## Base URL
`/api/v1/tasks`

---

## Endpoints

### GET /api/v1/tasks
Retrieve all tasks for the authenticated user.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter tasks by status (pending, in-progress, completed) |
| priority | string | No | Filter tasks by priority (low, medium, high) |
| limit | integer | No | Number of tasks to return (default: 20, max: 100) |
| offset | integer | No | Number of tasks to skip (default: 0) |

#### Response
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "uuid-string",
        "title": "Task Title",
        "description": "Task Description",
        "status": "pending",
        "priority": "medium",
        "due_date": "2024-12-31T10:00:00",
        "user_id": "user-uuid",
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z"
      }
    ],
    "total_count": 5,
    "limit": 20,
    "offset": 0
  }
}
```

#### Example Request
```
GET /api/v1/tasks?status=pending&limit=10
Authorization: Bearer your_jwt_token
```

---

### POST /api/v1/tasks
Create a new task for the authenticated user.

#### Request Body
```json
{
  "title": "New Task Title",
  "description": "Task description (optional)",
  "status": "pending",
  "priority": "medium",
  "due_date": "2024-12-31T10:00:00" (optional)
}
```

#### Response
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "id": "uuid-string",
      "title": "New Task Title",
      "description": "Task description (optional)",
      "status": "pending",
      "priority": "medium",
      "due_date": "2024-12-31T10:00:00",
      "user_id": "user-uuid",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  }
}
```

#### Example Request
```
POST /api/v1/tasks
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
  "title": "My New Task",
  "description": "This is a sample task",
  "status": "pending",
  "priority": "high"
}
```

---

### GET /api/v1/tasks/{id}
Retrieve a specific task by ID.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The UUID of the task to retrieve |

#### Response
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "uuid-string",
      "title": "Task Title",
      "description": "Task Description",
      "status": "pending",
      "priority": "medium",
      "due_date": "2024-12-31T10:00:00",
      "user_id": "user-uuid",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  }
}
```

#### Example Request
```
GET /api/v1/tasks/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer your_jwt_token
```

---

### PUT /api/v1/tasks/{id}
Update an entire task with new data.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The UUID of the task to update |

#### Request Body
```json
{
  "title": "Updated Task Title",
  "description": "Updated task description",
  "status": "in-progress",
  "priority": "high",
  "due_date": "2024-12-31T10:00:00"
}
```

#### Response
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "task": {
      "id": "uuid-string",
      "title": "Updated Task Title",
      "description": "Updated task description",
      "status": "in-progress",
      "priority": "high",
      "due_date": "2024-12-31T10:00:00",
      "user_id": "user-uuid",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  }
}
```

#### Example Request
```
PUT /api/v1/tasks/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
  "title": "Updated Task",
  "description": "Updated description",
  "status": "completed",
  "priority": "medium"
}
```

---

### PATCH /api/v1/tasks/{id}
Partially update a task with only the provided fields.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The UUID of the task to update |

#### Request Body
```json
{
  "title": "Partially Updated Title",
  "status": "in-progress"
}
```

#### Response
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "task": {
      "id": "uuid-string",
      "title": "Partially Updated Title",
      "description": "Original description remains unchanged",
      "status": "in-progress",
      "priority": "Original priority remains unchanged",
      "due_date": "Original due date remains unchanged",
      "user_id": "user-uuid",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  }
}
```

#### Example Request
```
PATCH /api/v1/tasks/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
  "status": "completed"
}
```

---

### DELETE /api/v1/tasks/{id}
Delete a specific task by ID.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The UUID of the task to delete |

#### Response
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

#### Example Request
```
DELETE /api/v1/tasks/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer your_jwt_token
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Invalid task ID format"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Access forbidden"
}
```

### 404 Not Found
```json
{
  "detail": "Task not found or user doesn't have access"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "Field required",
      "type": "missing"
    }
  ]
}
```

## Task Status Values
- `pending`: Task is waiting to be started
- `in-progress`: Task is currently being worked on
- `completed`: Task has been finished

## Task Priority Values
- `low`: Low priority task
- `medium`: Medium priority task
- `high`: High priority task