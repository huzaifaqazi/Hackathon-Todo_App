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


def test_complete_user_workflow_e2e(client, db_session):
    """
    End-to-end test for complete user workflow:
    1. User registration
    2. User login
    3. Create multiple tasks
    4. Retrieve and verify tasks
    5. Update tasks
    6. Delete tasks
    7. Logout (simulated by forgetting the token)
    """

    # Step 1: Register a new user
    email = "e2e_test@example.com"
    password = "SecurePassword123!"
    first_name = "E2E"
    last_name = "Tester"

    register_data = {
        "email": email,
        "password": password,
        "first_name": first_name,
        "last_name": last_name
    }

    register_response = client.post("/api/v1/auth/register", json=register_data)
    assert register_response.status_code == 200

    register_result = register_response.json()
    assert register_result["success"] is True
    assert "token" in register_result["data"]

    # Extract the authentication token
    auth_token = register_result["data"]["token"]
    auth_headers = {"Authorization": f"Bearer {auth_token}"}

    # Step 2: Login with the same credentials (should work)
    login_data = {
        "email": email,
        "password": password
    }

    login_response = client.post("/api/v1/auth/login", json=login_data)
    assert login_response.status_code == 200

    login_result = login_response.json()
    assert login_result["success"] is True
    assert "token" in login_result["data"]

    # Use the new token from login
    auth_token = login_result["data"]["token"]
    auth_headers = {"Authorization": f"Bearer {auth_token}"}

    # Step 3: Get tasks (should be empty initially)
    get_tasks_response = client.get("/api/v1/tasks", headers=auth_headers)
    assert get_tasks_response.status_code == 200

    tasks_result = get_tasks_response.json()
    assert tasks_result["success"] is True
    assert len(tasks_result["data"]["tasks"]) == 0
    assert tasks_result["data"]["total_count"] == 0

    # Step 4: Create multiple tasks
    tasks_to_create = [
        {
            "title": "E2E Task 1",
            "description": "First end-to-end test task",
            "status": "pending",
            "priority": "medium"
        },
        {
            "title": "E2E Task 2",
            "description": "Second end-to-end test task",
            "status": "in-progress",
            "priority": "high"
        },
        {
            "title": "E2E Task 3",
            "description": "Third end-to-end test task",
            "status": "completed",
            "priority": "low"
        }
    ]

    created_task_ids = []
    for task_data in tasks_to_create:
        create_response = client.post("/api/v1/tasks", json=task_data, headers=auth_headers)
        assert create_response.status_code == 200

        create_result = create_response.json()
        assert create_result["success"] is True
        assert create_result["message"] == "Task created successfully"

        task_id = create_result["data"]["task"]["id"]
        created_task_ids.append(task_id)
        assert create_result["data"]["task"]["title"] == task_data["title"]
        assert create_result["data"]["task"]["status"] == task_data["status"]

    # Step 5: Retrieve all tasks and verify they exist
    get_all_response = client.get("/api/v1/tasks", headers=auth_headers)
    assert get_all_response.status_code == 200

    all_tasks_result = get_all_response.json()
    assert all_tasks_result["success"] is True
    assert len(all_tasks_result["data"]["tasks"]) == 3
    assert all_tasks_result["data"]["total_count"] == 3

    # Verify all created tasks are present
    retrieved_task_titles = [task["title"] for task in all_tasks_result["data"]["tasks"]]
    for task_data in tasks_to_create:
        assert task_data["title"] in retrieved_task_titles

    # Step 6: Retrieve each task individually and verify details
    for i, task_id in enumerate(created_task_ids):
        get_single_response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
        assert get_single_response.status_code == 200

        single_task_result = get_single_response.json()
        assert single_task_result["success"] is True
        assert single_task_result["data"]["task"]["id"] == task_id
        assert single_task_result["data"]["task"]["title"] == tasks_to_create[i]["title"]

    # Step 7: Update tasks using both PUT and PATCH
    # Update first task using PUT (full update)
    updated_task_1_data = {
        "title": "Updated E2E Task 1",
        "description": "Updated description for first task",
        "status": "in-progress",
        "priority": "high",
        "due_date": "2024-12-31T10:00:00"
    }

    put_response = client.put(f"/api/v1/tasks/{created_task_ids[0]}",
                             json=updated_task_1_data, headers=auth_headers)
    assert put_response.status_code == 200

    put_result = put_response.json()
    assert put_result["success"] is True
    assert put_result["data"]["task"]["title"] == "Updated E2E Task 1"
    assert put_result["data"]["task"]["status"] == "in-progress"

    # Update second task using PATCH (partial update)
    patch_data = {
        "status": "completed",
        "priority": "low"
    }

    patch_response = client.patch(f"/api/v1/tasks/{created_task_ids[1]}",
                                 json=patch_data, headers=auth_headers)
    assert patch_response.status_code == 200

    patch_result = patch_response.json()
    assert patch_result["success"] is True
    assert patch_result["data"]["task"]["status"] == "completed"
    assert patch_result["data"]["task"]["priority"] == "low"
    # Title should remain unchanged
    assert patch_result["data"]["task"]["title"] == "E2E Task 2"

    # Step 8: Apply filters and verify they work correctly
    # Filter by status
    pending_response = client.get("/api/v1/tasks?status=pending", headers=auth_headers)
    assert pending_response.status_code == 200
    pending_result = pending_response.json()
    pending_tasks = pending_result["data"]["tasks"]
    # Only the third task should still be pending
    assert len(pending_tasks) == 1
    assert pending_tasks[0]["id"] == created_task_ids[2]

    # Filter by priority
    high_response = client.get("/api/v1/tasks?priority=high", headers=auth_headers)
    assert high_response.status_code == 200
    high_result = high_response.json()
    high_tasks = high_result["data"]["tasks"]
    # Only the first task should have high priority now
    assert len(high_tasks) == 1
    assert high_tasks[0]["id"] == created_task_ids[0]

    # Step 9: Delete tasks
    # Delete the third task
    delete_response = client.delete(f"/api/v1/tasks/{created_task_ids[2]}", headers=auth_headers)
    assert delete_response.status_code == 200

    delete_result = delete_response.json()
    assert delete_result["success"] is True
    assert delete_result["message"] == "Task deleted successfully"

    # Verify the deleted task is gone
    verify_deleted_response = client.get(f"/api/v1/tasks/{created_task_ids[2]}", headers=auth_headers)
    assert verify_deleted_response.status_code == 404

    # Verify other tasks still exist
    remaining_response = client.get("/api/v1/tasks", headers=auth_headers)
    assert remaining_response.status_code == 200
    remaining_result = remaining_response.json()
    assert len(remaining_result["data"]["tasks"]) == 2

    # Step 10: Test user isolation (create another user and verify they can't access first user's tasks)
    # Create second user
    user2_email = "e2e_test2@example.com"
    user2_password = "SecurePassword123!"

    user2_register_data = {
        "email": user2_email,
        "password": user2_password,
        "first_name": "E2E",
        "last_name": "Tester2"
    }

    user2_register_response = client.post("/api/v1/auth/register", json=user2_register_data)
    assert user2_register_response.status_code == 200

    user2_token = user2_register_response.json()["data"]["token"]
    user2_auth_headers = {"Authorization": f"Bearer {user2_token}"}

    # Second user should not see first user's tasks
    user2_tasks_response = client.get("/api/v1/tasks", headers=user2_auth_headers)
    assert user2_tasks_response.status_code == 200
    user2_tasks_result = user2_tasks_response.json()
    assert len(user2_tasks_result["data"]["tasks"]) == 0  # Should be empty

    # Second user should not be able to access first user's tasks
    for task_id in created_task_ids:
        access_response = client.get(f"/api/v1/tasks/{task_id}", headers=user2_auth_headers)
        # Should either get 404 (not found) or 403 (forbidden) depending on implementation
        # Both indicate proper isolation
        assert access_response.status_code in [404, 403]

    print("✅ Complete end-to-end workflow test passed!")


if __name__ == "__main__":
    pytest.main([__file__])