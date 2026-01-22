import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from unittest.mock import patch
import uuid
from src.main import app
from src.database import engine
from src.models.user import User
from src.models.task import Task, TaskStatus, TaskPriority
from src.services.auth_service import hash_password


@pytest.fixture
def client():
    """Create a test client for the API"""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def db_session():
    """Create a database session for testing"""
    with Session(engine) as session:
        yield session


@pytest.fixture
def test_user(db_session):
    """Create a test user for authentication"""
    user_data = {
        "email": "test@example.com",
        "hashed_password": hash_password("password123"),
        "first_name": "Test",
        "last_name": "User"
    }
    user = User(**user_data)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers by logging in the test user"""
    login_data = {
        "email": test_user.email,
        "password": "password123"
    }

    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200

    token = response.json()["data"]["token"]
    return {"Authorization": f"Bearer {token}"}


def test_get_all_tasks_empty(client, auth_headers, db_session, test_user):
    """Test getting all tasks when none exist"""
    response = client.get("/api/v1/tasks", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert data["data"]["tasks"] == []
    assert data["data"]["total_count"] == 0


def test_create_task_success(client, auth_headers, db_session, test_user):
    """Test creating a new task successfully"""
    task_data = {
        "title": "Test Task",
        "description": "Test Description",
        "status": "pending",
        "priority": "medium",
        "due_date": "2024-12-31T10:00:00"
    }

    response = client.post("/api/v1/tasks", json=task_data, headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert data["message"] == "Task created successfully"
    assert data["data"]["task"]["title"] == "Test Task"
    assert data["data"]["task"]["user_id"] == str(test_user.id)


def test_get_task_by_id_success(client, auth_headers, db_session, test_user):
    """Test retrieving a specific task by ID"""
    # First create a task
    task_data = {
        "title": "Test Task",
        "description": "Test Description",
        "status": "pending",
        "priority": "medium"
    }

    create_response = client.post("/api/v1/tasks", json=task_data, headers=auth_headers)
    assert create_response.status_code == 200

    task_id = create_response.json()["data"]["task"]["id"]

    # Retrieve the task
    response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert data["data"]["task"]["id"] == task_id
    assert data["data"]["task"]["title"] == "Test Task"


def test_get_task_by_id_not_found(client, auth_headers):
    """Test retrieving a task that doesn't exist"""
    fake_task_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/tasks/{fake_task_id}", headers=auth_headers)
    assert response.status_code == 404


def test_update_task_put_success(client, auth_headers, db_session, test_user):
    """Test updating a task using PUT method"""
    # First create a task
    task_data = {
        "title": "Original Task",
        "description": "Original Description",
        "status": "pending",
        "priority": "medium"
    }

    create_response = client.post("/api/v1/tasks", json=task_data, headers=auth_headers)
    assert create_response.status_code == 200

    task_id = create_response.json()["data"]["task"]["id"]

    # Update the task
    update_data = {
        "title": "Updated Task",
        "description": "Updated Description",
        "status": "in-progress",
        "priority": "high"
    }

    response = client.put(f"/api/v1/tasks/{task_id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert data["message"] == "Task updated successfully"
    assert data["data"]["task"]["title"] == "Updated Task"
    assert data["data"]["task"]["status"] == "in-progress"


def test_update_task_patch_success(client, auth_headers, db_session, test_user):
    """Test updating a task using PATCH method (partial update)"""
    # First create a task
    task_data = {
        "title": "Original Task",
        "description": "Original Description",
        "status": "pending",
        "priority": "medium"
    }

    create_response = client.post("/api/v1/tasks", json=task_data, headers=auth_headers)
    assert create_response.status_code == 200

    task_id = create_response.json()["data"]["task"]["id"]

    # Partially update the task
    update_data = {
        "title": "Partially Updated Task",
        "status": "completed"
    }

    response = client.patch(f"/api/v1/tasks/{task_id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert data["message"] == "Task updated successfully"
    assert data["data"]["task"]["title"] == "Partially Updated Task"
    assert data["data"]["task"]["status"] == "completed"
    # Description should remain unchanged
    assert data["data"]["task"]["description"] == "Original Description"


def test_delete_task_success(client, auth_headers, db_session, test_user):
    """Test deleting a task successfully"""
    # First create a task
    task_data = {
        "title": "Task to Delete",
        "description": "Description to Delete",
        "status": "pending",
        "priority": "medium"
    }

    create_response = client.post("/api/v1/tasks", json=task_data, headers=auth_headers)
    assert create_response.status_code == 200

    task_id = create_response.json()["data"]["task"]["id"]

    # Verify task exists
    get_response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert get_response.status_code == 200

    # Delete the task
    response = client.delete(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert data["message"] == "Task deleted successfully"

    # Verify task is gone
    get_response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert get_response.status_code == 404


def test_get_tasks_with_filters(client, auth_headers, db_session, test_user):
    """Test getting tasks with status and priority filters"""
    # Create multiple tasks with different statuses and priorities
    tasks_data = [
        {"title": "Task 1", "description": "Desc 1", "status": "pending", "priority": "low"},
        {"title": "Task 2", "description": "Desc 2", "status": "in-progress", "priority": "high"},
        {"title": "Task 3", "description": "Desc 3", "status": "completed", "priority": "medium"}
    ]

    for task_data in tasks_data:
        response = client.post("/api/v1/tasks", json=task_data, headers=auth_headers)
        assert response.status_code == 200

    # Test filtering by status
    response = client.get("/api/v1/tasks?status=pending", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]["tasks"]) == 1
    assert data["data"]["tasks"][0]["status"] == "pending"

    # Test filtering by priority
    response = client.get("/api/v1/tasks?priority=high", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]["tasks"]) == 1
    assert data["data"]["tasks"][0]["priority"] == "high"


def test_unauthorized_access(client):
    """Test that unauthorized access is denied"""
    # Try to access without authentication
    response = client.get("/api/v1/tasks")
    assert response.status_code == 401

    # Try to create a task without authentication
    task_data = {
        "title": "Unauthorized Task",
        "description": "Should not be created",
        "status": "pending",
        "priority": "medium"
    }
    response = client.post("/api/v1/tasks", json=task_data)
    assert response.status_code == 401


def test_invalid_task_id_format(client, auth_headers):
    """Test that invalid task ID formats are handled properly"""
    response = client.get("/api/v1/tasks/invalid-uuid-format", headers=auth_headers)
    assert response.status_code == 400
    assert "Invalid task ID format" in response.json()["detail"]

    response = client.put("/api/v1/tasks/invalid-uuid-format", json={}, headers=auth_headers)
    assert response.status_code == 400
    assert "Invalid task ID format" in response.json()["detail"]

    response = client.delete("/api/v1/tasks/invalid-uuid-format", headers=auth_headers)
    assert response.status_code == 400
    assert "Invalid task ID format" in response.json()["detail"]


def test_task_validation_errors(client, auth_headers):
    """Test validation errors for task creation/update"""
    # Test creating task without title
    task_data = {
        "description": "Task without title",
        "status": "pending",
        "priority": "medium"
    }

    response = client.post("/api/v1/tasks", json=task_data, headers=auth_headers)
    # Should fail because title is required
    assert response.status_code == 422  # Validation error


if __name__ == "__main__":
    pytest.main([__file__])