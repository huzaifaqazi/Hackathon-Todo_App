# Quickstart Guide: AI-powered Todo Chatbot

## Overview
This guide provides setup instructions and key information for developing the AI-powered Todo Chatbot feature.

## Prerequisites
- Python 3.11+ with pip/uv package manager
- Node.js 18+ with npm/yarn
- PostgreSQL database (Neon Serverless recommended)
- OpenRouter API key for AI functionality
- Existing todo app backend (FastAPI) and frontend (Next.js) running

## Environment Setup

### Backend Setup
```bash
# Navigate to backend directory
cd backend/

# Install dependencies
uv pip install -r requirements.txt
# or if uv is not available:
pip install -r requirements.txt

# Set environment variables
export OPENROUTER_API_KEY=your_openrouter_api_key_here
export DATABASE_URL=postgresql://username:password@host:port/database
export SECRET_KEY=your_secret_key_for_auth
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend/

# Install dependencies
npm install
# or
yarn install

# Set environment variables
export NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
export NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

## Running the Application

### Backend Services
```bash
# Start the FastAPI backend
cd backend/
uv run python -m src.main
# or
python -m src.main
```

### Frontend Development Server
```bash
# Start the Next.js frontend
cd frontend/
npm run dev
# or
yarn dev
```

## Key Endpoints

### Chat API
- `GET /v1/chat/conversations` - List user conversations
- `POST /v1/chat/conversations` - Create new conversation
- `GET /v1/chat/conversations/{id}` - Get conversation details
- `DELETE /v1/chat/conversations/{id}` - Delete conversation
- `POST /v1/chat/conversations/{id}/chat` - Send message to AI

### MCP Tools Available
- `create_task` - Create a new task
- `list_tasks` - List all tasks for the user
- `update_task` - Update an existing task
- `delete_task` - Delete a task
- `complete_task` - Mark a task as completed

## Development Workflow

### Backend Development
1. Add new functionality to the appropriate service in `src/services/`
2. Create API endpoints in `src/api/v1/`
3. Define data models in `src/models/`
4. Write unit tests in `tests/unit/`
5. Run tests: `pytest tests/unit/`

### Frontend Development
1. Create new components in `src/components/chat/`
2. Add pages in `src/pages/chat/`
3. Implement API services in `src/services/`
4. Write component tests in `tests/unit/`
5. Run tests: `npm test` or `yarn test`

## MCP Integration

### Adding New Tools
1. Define the tool in `backend/src/tools/mcp_tools.py`
2. Register the tool with the AI service in `backend/src/services/ai_service.py`
3. Test the tool through the chat interface

### Example Tool Call
```json
{
  "name": "create_task",
  "arguments": {
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "due_date": "2024-01-15"
  }
}
```

## Database Schema

### Conversation Table
- `id` - UUID primary key
- `user_id` - Foreign key to users table
- `title` - Conversation title
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Message Table
- `id` - UUID primary key
- `conversation_id` - Foreign key to conversations
- `role` - user, assistant, or system
- `content` - Message content
- `timestamp` - Message timestamp
- `tool_calls` - JSON array of tool calls
- `tool_responses` - JSON array of tool responses

## Testing

### Backend Tests
```bash
# Run all backend tests
pytest tests/

# Run specific test file
pytest tests/unit/test_ai_service.py

# Run with coverage
pytest --cov=src tests/
```

### Frontend Tests
```bash
# Run all frontend tests
npm test

# Run specific test
npm test -- src/components/chat/ChatInterface.test.tsx
```

## Common Commands

### Database Operations
```bash
# Apply migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "Description of changes"
```

### Linting and Formatting
```bash
# Python linting
flake8 src/
black src/

# JavaScript/TypeScript linting
npm run lint
npm run format
```

## Troubleshooting

### Common Issues
- **OpenRouter API errors**: Verify your API key is set correctly
- **Database connection errors**: Check your DATABASE_URL configuration
- **Authentication errors**: Ensure Better Auth is properly configured
- **MCP tool execution fails**: Check that all required parameters are provided

### Debugging Tips
- Enable debug logging with `LOG_LEVEL=DEBUG`
- Check conversation history in the database directly
- Use the API directly with tools like curl or Postman
- Monitor network requests in browser developer tools