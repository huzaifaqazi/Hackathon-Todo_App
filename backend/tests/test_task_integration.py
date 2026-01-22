import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from unittest.mock import patch
import uuid
from src.main import app
from src.database import engine
from src.models.user import User
from src.models.task import Task
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
        "email": "integration_test@example.com",
        "hashed_password": hash_password("password123"),
        "first_name": "Integration",
        "last_name": "Test"
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


def test_complete_task_crud_flow(client, auth_headers, db_session, test_user):
    """Integration test for complete task CRUD flow"""
    # Step 1: Create a task
    task_data = {
        "title": "Integration Test Task",
        "description": "This is a test task for integration testing",
        "status": "pending",
        "priority": "medium"
    }

    create_response = client.post("/api/v1/tasks", json=task_data, headers=auth_headers)
    assert create_response.status_code == 200

    created_task = create_response.json()["data"]["task"]
    task_id = created_task["id"]
    assert created_task["title"] == "Integration Test Task"
    assert created_task["status"] == "pending"
    assert created_task["user_id"] == str(test_user.id)

    # Step 2: Retrieve the task
    get_response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert get_response.status_code == 200

    retrieved_task = get_response.json()["data"]["task"]
    assert retrieved_task["id"] == task_id
    assert retrieved_task["title"] == "Integration Test Task"
    assert retrieved_task["status"] == "pending"

    # Step 3: Update the task
    update_data = {
        "title": "Updated Integration Test Task",
        "status": "in-progress",
        "description": "Updated description"
    }

    update_response = client.put(f"/api/v1/tasks/{task_id}", json=update_data, headers=auth_headers)
    assert update_response.status_code == 200

    updated_task = update_response.json()["data"]["task"]
    assert updated_task["id"] == task_id
    assert updated_task["title"] == "Updated Integration Test Task"
    assert updated_task["status"] == "in-progress"

    # Step 4: Verify the update persisted
    verify_response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert verify_response.status_code == 200

    verified_task = verify_response.json()["data"]["task"]
    assert verified_task["title"] == "Updated Integration Test Task"
    assert verified_task["status"] == "in-progress"

    # Step 5: Test partial update with PATCH
    patch_data = {
        "status": "completed"
    }

    patch_response = client.patch(f"/api/v1/tasks/{task_id}", json=patch_data, headers=auth_headers)
    assert patch_response.status_code == 200

    patched_task = patch_response.json()["data"]["task"]
    assert patched_task["status"] == "completed"
    # Title should remain unchanged
    assert patched_task["title"] == "Updated Integration Test Task"

    # Step 6: List all tasks and verify the updated task is in the list
    list_response = client.get("/api/v1/tasks", headers=auth_headers)
    assert list_response.status_code == 200

    tasks_list = list_response.json()["data"]["tasks"]
    assert len(tasks_list) >= 1
    task_titles = [task["title"] for task in tasks_list]
    assert "Updated Integration Test Task" in task_titles

    # Step 7: Delete the task
    delete_response = client.delete(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert delete_response.status_code == 200

    # Step 8: Verify the task is deleted
    deleted_response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert deleted_response.status_code == 404


def test_user_isolation(client, db_session):
    """Test that users can only access their own tasks"""
    # Create first user and authenticate
    user1_data = {
        "email": "user1@example.com",
        "hashed_password": hash_password("password123"),
        "first_name": "User",
        "last_name": "One"
    }
    user1 = User(**user1_data)
    db_session.add(user1)
    db_session.commit()
    db_session.refresh(user1)

    # Create second user and authenticate
    user2_data = {
        "email": "user2@example.com",
        "hashed_password": hash_password("password123"),
        "first_name": "User",
        "last_name": "Two"
    }
    user2 = User(**user2_data)
    db_session.add(user2)
    db_session.commit()
    db_session.refresh(user2)

    # Login as user1 and create a task
    login1_data = {"email": user1.email, "password": "password123"}
    login1_response = client.post("/api/v1/auth/login", json=login1_data)
    assert login1_response.status_code == 200
    user1_token = login1_response.json()["data"]["token"]
    user1_headers = {"Authorization": f"Bearer {user1_token}"}

    task_data = {
        "title": "User1's Task",
        "description": "This belongs to user1",
        "status": "pending",
        "priority": "medium"
    }

    create_response = client.post("/api/v1/tasks", json=task_data, headers=user1_headers)
    assert create_response.status_code == 200
    task_id = create_response.json()["data"]["task"]["id"]

    # Login as user2
    login2_data = {"email": user2.email, "password": "password123"}
    login2_response = client.post("/api/v1/auth/login", json=login2_data)
    assert login2_response.status_code == 200
    user2_token = login2_response.json()["data"]["token"]
    user2_headers = {"Authorization": f"Bearer {user2_token}"}

    # User2 should not be able to access user1's task
    get_response = client.get(f"/api/v1/tasks/{task_id}", headers=user2_headers)
    assert get_response.status_code == 404

    # User2 should not be able to update user1's task
    update_data = {"title": "Attempted Update"}
    update_response = client.put(f"/api/v1/tasks/{task_id}", json=update_data, headers=user2_headers)
    assert update_response.status_code == 404

    # User2 should not be able to delete user1's task
    delete_response = client.delete(f"/api/v1/tasks/{task_id}", headers=user2_headers)
    assert delete_response.status_code == 404

    # User1 should still be able to access their task
    get_response = client.get(f"/api/v1/tasks/{task_id}", headers=user1_headers)
    assert get_response.status_code == 200

    # Clean up
    client.delete(f"/api/v1/tasks/{task_id}", headers=user1_headers)


def test_pagination_and_filtering_integration(client, auth_headers, db_session, test_user):
    """Test pagination and filtering together"""
    # Create multiple tasks
    tasks_data = [
        {"title": "High Priority Task", "description": "Desc", "status": "pending", "priority": "high"},
        {"title": "Medium Priority Task", "description": "Desc", "status": "in-progress", "priority": "medium"},
        {"title": "Low Priority Task", "description": "Desc", "status": "completed", "priority": "low"},
        {"title": "Another Pending Task", "description": "Desc", "status": "pending", "priority": "medium"},
        {"title": "Another In-Progress Task", "description": "Desc", "status": "in-progress", "priority": "high"}
    ]

    for task_data in tasks_data:
        response = client.post("/api/v1/tasks", json=task_data, headers=auth_headers)
        assert response.status_code == 200

    # Test listing with pagination
    response = client.get("/api/v1/tasks?limit=2&offset=0", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]["tasks"]) == 2
    assert data["data"]["total_count"] >= 5

    # Test filtering by status
    response = client.get("/api/v1/tasks?status=pending", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    pending_tasks = data["data"]["tasks"]
    assert len(pending_tasks) >= 2
    for task in pending_tasks:
        assert task["status"] == "pending"

    # Test filtering by priority
    response = client.get("/api/v1/tasks?priority=high", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    high_priority_tasks = data["data"]["tasks"]
    assert len(high_priority_tasks) >= 2
    for task in high_priority_tasks:
        assert task["priority"] == "high"

    # Test combined filtering and pagination
    response = client.get("/api/v1/tasks?status=in-progress&limit=1", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    in_progress_tasks = data["data"]["tasks"]
    assert len(in_progress_tasks) == 1
    assert in_progress_tasks[0]["status"] == "in-progress"


if __name__ == "__main__":
    pytest.main([__file__])