from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from sqlmodel import SQLModel
from src.database import engine
from src.api.auth_routes import router as auth_router
from src.api.task_routes import router as task_router
import os

# Import all models to ensure they are registered with SQLModel before creating tables
from src.models.user import User
from src.models.task import Task
from src.models.session import Session

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager to initialize database tables."""
    # Create database tables
    SQLModel.metadata.create_all(bind=engine)
    yield
    # Cleanup if needed
    pass

# Create FastAPI app with lifespan
app = FastAPI(
    title="Todo App API",
    description="A full-featured todo application API with authentication",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js default port
        "http://localhost:3001",  # Alternative Next.js port
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://127.0.0.1:3001",  # Alternative localhost
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # Additional security headers
    allow_origin_regex=r"https?://localhost(:[0-9]+)?",
)

# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(task_router, prefix="/api/v1/tasks", tags=["tasks"])

@app.get("/")
def read_root():
    """Root endpoint for API health check."""
    return {"message": "Todo App API is running!"}

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "todo-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)