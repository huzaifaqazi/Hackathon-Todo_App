# Quickstart Guide: Task CRUD Enhancement

## Prerequisites

- Python 3.11+ installed
- Node.js 18+ installed
- Neon PostgreSQL database configured
- Better Auth set up for authentication

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install fastapi sqlmodel uvicorn python-multipart python-jose[cryptography] passlib[bcrypt]
```

3. Configure database connection in `settings.py`:
```python
DATABASE_URL = "postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
```

4. Run the backend server:
```bash
uvicorn src.main:app --reload
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install axios
```

3. Run the development server:
```bash
npm run dev
```

## API Endpoints

### Available Task Endpoints

- `GET /api/v1/tasks` - List all user tasks
- `GET /api/v1/tasks/{id}` - Get specific task details
- `PUT /api/v1/tasks/{id}` - Update entire task
- `PATCH /api/v1/tasks/{id}` - Partially update task
- `DELETE /api/v1/tasks/{id}` - Delete task

### Authentication

All task endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token_here>
```

## Frontend Components

### TaskItem Component

The enhanced TaskItem component now includes:
- View button - Shows detailed task information
- Edit button - Opens task editing modal
- Delete button - Deletes the task with confirmation

### Error Handling

The system handles common error cases:
- 401: Unauthorized access (invalid/expired token)
- 403: Forbidden access (attempting to access another user's task)
- 404: Task not found
- 400: Invalid request data

## Development Commands

### Running Tests

Backend tests:
```bash
pytest tests/
```

Frontend tests:
```bash
npm test
```

### Database Migrations

Apply migrations:
```bash
python -m src.database.migrate
```