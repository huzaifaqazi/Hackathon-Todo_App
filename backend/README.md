# Todo App Backend

## Deployment on Railway

This backend is configured for deployment on Railway. Here's what you need to know:

### Environment Variables Required:
- `DATABASE_URL`: PostgreSQL database connection string (provided by Railway's PostgreSQL addon)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS (optional, defaults to localhost)

### Deployment Steps:
1. Connect your GitHub repository to Railway
2. Select the `backend` directory as the root
3. Set the build command to use the Procfile
4. Add the required environment variables
5. Deploy!

### Stack:
- Python 3.11
- FastAPI
- SQLModel with PostgreSQL
- Uvicorn ASGI server

### Endpoints:
- `/` - Health check
- `/health` - Health check
- `/api/v1/auth/*` - Authentication endpoints
- `/api/v1/tasks/*` - Task management endpoints