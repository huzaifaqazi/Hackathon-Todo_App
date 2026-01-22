#!/usr/bin/env python3
"""
More detailed API test to debug the 500 error
"""
import requests
import json
import uuid

BASE_URL = "http://localhost:8002"

def test_detailed():
    print("Testing registration and login...")

    # Generate unique email
    test_email = f"test_user_{uuid.uuid4()}@example.com"
    test_password = "testpassword123"

    print(f"Using email: {test_email}")

    # Register user
    register_data = {
        "email": test_email,
        "password": test_password,
        "first_name": "Test",
        "last_name": "User"
    }

    print("Registering user...")
    register_resp = requests.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
    print(f"Register status: {register_resp.status_code}")

    if register_resp.status_code != 200:
        print("Registration failed!")
        return False

    # Login user
    login_data = {
        "email": test_email,
        "password": test_password
    }

    print("Logging in user...")
    login_resp = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
    print(f"Login status: {login_resp.status_code}")

    if login_resp.status_code != 200:
        print("Login failed!")
        return False

    response_data = login_resp.json()
    token = response_data["data"]["token"]
    user_id = response_data["data"]["user"]["id"]
    print(f"Got token for user {user_id}")

    headers = {"Authorization": f"Bearer {token}"}

    # Test accessing protected endpoint with token - get tasks
    print("Testing /api/v1/tasks endpoint with valid token...")
    try:
        tasks_resp = requests.get(f"{BASE_URL}/api/v1/tasks", headers=headers)
        print(f"Tasks endpoint status: {tasks_resp.status_code}")
        if tasks_resp.status_code != 200:
            print(f"Tasks endpoint response: {tasks_resp.text}")
        else:
            print(f"Tasks endpoint success: {tasks_resp.text[:200]}...")
    except Exception as e:
        print(f"Error accessing tasks endpoint: {e}")

    # Test creating a task
    print("Creating a test task...")
    task_data = {
        "title": "Test Task",
        "description": "Test Description",
        "status": "pending",
        "priority": "medium"
    }
    try:
        create_resp = requests.post(f"{BASE_URL}/api/v1/tasks", headers=headers, json=task_data)
        print(f"Create task status: {create_resp.status_code}")
        if create_resp.status_code != 200:
            print(f"Create task response: {create_resp.text}")
        else:
            print(f"Create task success: {create_resp.text[:200]}...")
    except Exception as e:
        print(f"Error creating task: {e}")

    return True

if __name__ == "__main__":
    test_detailed()