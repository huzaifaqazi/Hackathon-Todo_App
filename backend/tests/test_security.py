import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from src.main import app
from src.database import engine
from src.models.user import User
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


def test_user_isolation_security(client, db_session):
    """
    Security test to ensure users can only access their own data
    """

    # Create first user
    user1_email = "security_user1@example.com"
    user1_password = "SecurePassword123!"

    user1_register_data = {
        "email": user1_email,
        "password": user1_password,
        "first_name": "Security",
        "last_name": "User1"
    }

    user1_register_response = client.post("/api/v1/auth/register", json=user1_register_data)
    assert user1_register_response.status_code == 200

    user1_token = user1_register_response.json()["data"]["token"]
    user1_auth_headers = {"Authorization": f"Bearer {user1_token}"}

    # Create second user
    user2_email = "security_user2@example.com"
    user2_password = "SecurePassword123!"

    user2_register_data = {
        "email": user2_email,
        "password": user2_password,
        "first_name": "Security",
        "last_name": "User2"
    }

    user2_register_response = client.post("/api/v1/auth/register", json=user2_register_data)
    assert user2_register_response.status_code == 200

    user2_token = user2_register_response.json()["data"]["token"]
    user2_auth_headers = {"Authorization": f"Bearer {user2_token}"}

    # User1 creates a task
    task_data = {
        "title": "User1's Private Task",
        "description": "This should only be accessible to User1",
        "status": "pending",
        "priority": "medium"
    }

    create_response = client.post("/api/v1/tasks", json=task_data, headers=user1_auth_headers)
    assert create_response.status_code == 200

    task_id = create_response.json()["data"]["task"]["id"]
    assert create_response.json()["data"]["task"]["title"] == "User1's Private Task"

    # Verify User1 can access their own task
    user1_get_response = client.get(f"/api/v1/tasks/{task_id}", headers=user1_auth_headers)
    assert user1_get_response.status_code == 200
    assert user1_get_response.json()["data"]["task"]["id"] == task_id

    # Verify User2 cannot access User1's task
    user2_get_response = client.get(f"/api/v1/tasks/{task_id}", headers=user2_auth_headers)
    assert user2_get_response.status_code == 404  # Should not find the task

    # Verify User2 cannot update User1's task
    update_data = {"title": "Attempted Update by User2"}
    user2_put_response = client.put(f"/api/v1/tasks/{task_id}", json=update_data, headers=user2_auth_headers)
    assert user2_put_response.status_code == 404  # Should not find the task to update

    # Verify User2 cannot delete User1's task
    user2_delete_response = client.delete(f"/api/v1/tasks/{task_id}", headers=user2_auth_headers)
    assert user2_delete_response.status_code == 404  # Should not find the task to delete

    # Verify User1 can still access their task after failed attempts by User2
    user1_verify_response = client.get(f"/api/v1/tasks/{task_id}", headers=user1_auth_headers)
    assert user1_verify_response.status_code == 200
    assert user1_verify_response.json()["data"]["task"]["id"] == task_id
    assert user1_verify_response.json()["data"]["task"]["title"] == "User1's Private Task"


def test_authentication_required(client):
    """
    Test that authentication is required for protected endpoints
    """

    # Try to access tasks endpoint without authentication
    response = client.get("/api/v1/tasks")
    assert response.status_code == 401  # Unauthorized

    # Try to create a task without authentication
    task_data = {
        "title": "Unauthorized Task",
        "description": "This should fail",
        "status": "pending",
        "priority": "medium"
    }
    create_response = client.post("/api/v1/tasks", json=task_data)
    assert create_response.status_code == 401  # Unauthorized

    # Try to access a specific task without authentication
    fake_task_id = "123e4567-e89b-12d3-a456-426614174000"  # Valid UUID format
    get_response = client.get(f"/api/v1/tasks/{fake_task_id}")
    assert get_response.status_code == 401  # Unauthorized

    # Try to update a task without authentication
    update_data = {"title": "Unauthorized Update"}
    put_response = client.put(f"/api/v1/tasks/{fake_task_id}", json=update_data)
    assert put_response.status_code == 401  # Unauthorized

    # Try to delete a task without authentication
    delete_response = client.delete(f"/api/v1/tasks/{fake_task_id}")
    assert delete_response.status_code == 401  # Unauthorized


def test_invalid_token_security(client, db_session):
    """
    Test that invalid tokens are rejected
    """

    # Create a valid user and task first
    user_email = "valid_user@example.com"
    user_password = "SecurePassword123!"

    register_data = {
        "email": user_email,
        "password": user_password,
        "first_name": "Valid",
        "last_name": "User"
    }

    register_response = client.post("/api/v1/auth/register", json=register_data)
    assert register_response.status_code == 200

    # Create a task
    task_data = {
        "title": "Test Task for Invalid Token Test",
        "description": "Testing invalid token access",
        "status": "pending",
        "priority": "medium"
    }

    auth_token = register_response.json()["data"]["token"]
    auth_headers = {"Authorization": f"Bearer {auth_token}"}

    create_response = client.post("/api/v1/tasks", json=task_data, headers=auth_headers)
    assert create_response.status_code == 200
    task_id = create_response.json()["data"]["task"]["id"]

    # Try with malformed token
    malformed_headers = {"Authorization": "Bearer invalid-token-format"}
    malformed_response = client.get(f"/api/v1/tasks/{task_id}", headers=malformed_headers)
    assert malformed_response.status_code == 401

    # Try with random token
    random_headers = {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"}
    random_response = client.get(f"/api/v1/tasks/{task_id}", headers=random_headers)
    assert random_response.status_code == 401

    # Try with empty token
    empty_headers = {"Authorization": ""}
    empty_response = client.get(f"/api/v1/tasks/{task_id}", headers=empty_headers)
    assert empty_response.status_code == 401


def test_cross_user_data_access_protection(client, db_session):
    """
    Test that users cannot access each other's data through various endpoints
    """

    # Create multiple users
    users = []
    headers = []

    for i in range(3):
        email = f"test_user_{i}@example.com"
        password = "SecurePassword123!"

        register_data = {
            "email": email,
            "password": password,
            "first_name": f"Test{i}",
            "last_name": f"User{i}"
        }

        register_response = client.post("/api/v1/auth/register", json=register_data)
        assert register_response.status_code == 200

        token = register_response.json()["data"]["token"]
        header = {"Authorization": f"Bearer {token}"}

        users.append({"email": email, "token": token})
        headers.append(header)

    # Each user creates a task
    created_tasks = []
    for i, header in enumerate(headers):
        task_data = {
            "title": f"Task for User {i}",
            "description": f"Task belonging to user {i}",
            "status": "pending",
            "priority": "medium"
        }

        create_response = client.post("/api/v1/tasks", json=task_data, headers=header)
        assert create_response.status_code == 200

        task_id = create_response.json()["data"]["task"]["id"]
        created_tasks.append(task_id)

    # Verify each user can only see their own task when requesting specific tasks
    for i, (header, task_id) in enumerate(zip(headers, created_tasks)):
        # User i accesses their own task - should succeed
        own_response = client.get(f"/api/v1/tasks/{task_id}", headers=header)
        assert own_response.status_code == 200
        assert own_response.json()["data"]["task"]["title"] == f"Task for User {i}"

        # User i tries to access other users' tasks - should fail
        for j, other_task_id in enumerate(created_tasks):
            if i != j:
                other_response = client.get(f"/api/v1/tasks/{other_task_id}", headers=header)
                assert other_response.status_code == 404  # Should not find other user's task

    # Verify each user can only see their own tasks in the list
    for i, header in enumerate(headers):
        list_response = client.get("/api/v1/tasks", headers=header)
        assert list_response.status_code == 200

        tasks = list_response.json()["data"]["tasks"]
        assert len(tasks) == 1  # Each user should only see their own task
        assert tasks[0]["title"] == f"Task for User {i}"


if __name__ == "__main__":
    pytest.main([__file__])