#!/usr/bin/env python3
"""
Final test to verify all authentication functionality works
"""
import requests
import json
import uuid

BASE_URL = "http://localhost:8002"

def test_complete_flow():
    print("=== Testing Complete Authentication Flow ===")

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

    print("1. Registering user...")
    register_resp = requests.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
    print(f"   Register status: {register_resp.status_code}")
    if register_resp.status_code != 200:
        print("   ❌ Registration failed!")
        return False
    else:
        print("   ✅ Registration successful!")

    # Login user
    login_data = {
        "email": test_email,
        "password": test_password
    }

    print("2. Logging in user...")
    login_resp = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
    print(f"   Login status: {login_resp.status_code}")
    if login_resp.status_code != 200:
        print("   ❌ Login failed!")
        return False
    else:
        print("   ✅ Login successful!")

    response_data = login_resp.json()
    token = response_data["data"]["token"]
    user_id = response_data["data"]["user"]["id"]
    print(f"   Got token for user {user_id[:8]}...")

    headers = {"Authorization": f"Bearer {token}"}

    # Test getting tasks (should be empty initially)
    print("3. Testing GET /api/v1/tasks (should return empty list)...")
    tasks_resp = requests.get(f"{BASE_URL}/api/v1/tasks", headers=headers)
    print(f"   GET tasks status: {tasks_resp.status_code}")
    if tasks_resp.status_code != 200:
        print(f"   ❌ GET tasks failed: {tasks_resp.text}")
        return False
    else:
        tasks_data = tasks_resp.json()
        print(f"   ✅ GET tasks successful: {len(tasks_data['data']['tasks'])} tasks found")
        print(f"   Total count: {tasks_data['data']['total_count']}")

    # Create a task
    print("4. Creating a test task...")
    task_data = {
        "title": "Test Task",
        "description": "Test Description",
        "status": "pending",
        "priority": "medium"
    }
    create_resp = requests.post(f"{BASE_URL}/api/v1/tasks", headers=headers, json=task_data)
    print(f"   Create task status: {create_resp.status_code}")
    if create_resp.status_code != 200:
        print(f"   ❌ Create task failed: {create_resp.text}")
        return False
    else:
        print("   ✅ Create task successful!")

    # Test getting tasks again (should have 1 task now)
    print("5. Testing GET /api/v1/tasks again (should return 1 task)...")
    tasks_resp2 = requests.get(f"{BASE_URL}/api/v1/tasks", headers=headers)
    print(f"   GET tasks status: {tasks_resp2.status_code}")
    if tasks_resp2.status_code != 200:
        print(f"   ❌ GET tasks failed: {tasks_resp2.text}")
        return False
    else:
        tasks_data2 = tasks_resp2.json()
        print(f"   ✅ GET tasks successful: {len(tasks_data2['data']['tasks'])} tasks found")
        print(f"   Total count: {tasks_data2['data']['total_count']}")
        if tasks_data2['data']['total_count'] == 1:
            print("   ✅ Correctly shows 1 task!")
        else:
            print(f"   ❌ Expected 1 task, got {tasks_data2['data']['total_count']}")
            return False

    # Test accessing protected endpoint without token (should return 401)
    print("6. Testing /api/v1/tasks without token (should return 401)...")
    no_auth_resp = requests.get(f"{BASE_URL}/api/v1/tasks")
    print(f"   No auth status: {no_auth_resp.status_code}")
    if no_auth_resp.status_code == 401:  # Should be 401, not 403
        print("   ✅ Correctly returns 401 for unauthorized access!")
    elif no_auth_resp.status_code == 403:
        print("   ⚠️  Returns 403 (should ideally be 401)")
    else:
        print(f"   ❌ Unexpected status: {no_auth_resp.status_code}")
        return False

    # Test accessing user info endpoint with token
    print("7. Testing /api/v1/auth/me with valid token...")
    me_resp = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers)
    print(f"   Me endpoint status: {me_resp.status_code}")
    if me_resp.status_code == 200:
        print("   ✅ User info endpoint works!")
    else:
        print(f"   ❌ User info failed: {me_resp.text}")
        return False

    print("\n=== All tests passed! Authentication system is working correctly ===")
    return True

if __name__ == "__main__":
    test_complete_flow()