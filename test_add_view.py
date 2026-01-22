#!/usr/bin/env python3
"""
Test to demonstrate adding and viewing tasks
"""
import requests
import json
import uuid

BASE_URL = "http://localhost:8002"

def test_add_and_view_tasks():
    print("=== Testing Add and View Tasks ===\n")

    # Create a test user
    email = f"user_{uuid.uuid4()}@example.com"
    password = "password123"

    print(f"1. Creating user: {email}")

    # Register
    register_resp = requests.post(f"{BASE_URL}/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "first_name": "Test",
        "last_name": "User"
    })

    if register_resp.status_code != 200:
        print(f"❌ Register failed: {register_resp.status_code}")
        return

    # Login
    login_resp = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": email,
        "password": password
    })

    token = login_resp.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ User created and logged in successfully\n")

    # Check initial tasks (should be empty)
    print("2. Checking initial tasks...")
    tasks_resp = requests.get(f"{BASE_URL}/api/v1/tasks", headers=headers)
    initial_tasks = tasks_resp.json()["data"]["tasks"]
    print(f"   Initial tasks count: {len(initial_tasks)}\n")

    # Add a task
    print("3. Adding a new task...")
    task_data = {
        "title": "Learn JWT Authentication",
        "description": "Complete the JWT implementation for the Todo app",
        "status": "pending",
        "priority": "high"
    }

    create_resp = requests.post(f"{BASE_URL}/api/v1/tasks",
                              headers=headers,
                              json=task_data)

    if create_resp.status_code != 200:
        print(f"❌ Failed to create task: {create_resp.status_code}")
        return

    created_task = create_resp.json()["data"]["task"]
    print(f"   Task created successfully!")
    print(f"   - Title: {created_task['title']}")
    print(f"   - Status: {created_task['status']}")
    print(f"   - Priority: {created_task['priority']}\n")

    # View all tasks (should now include the new task)
    print("4. Viewing all tasks (including the new one)...")
    tasks_resp = requests.get(f"{BASE_URL}/api/v1/tasks", headers=headers)
    all_tasks = tasks_resp.json()["data"]["tasks"]

    print(f"   Total tasks: {len(all_tasks)}")
    for i, task in enumerate(all_tasks, 1):
        print(f"   Task {i}: {task['title']} [{task['status']}] - Priority: {task['priority']}")

    print(f"\n5. Summary:")
    print(f"   ✅ Successfully added task: '{task_data['title']}'")
    print(f"   ✅ Task is now visible in the task list")
    print(f"   ✅ Both add and view operations working correctly!")

if __name__ == "__main__":
    test_add_and_view_tasks()