#!/usr/bin/env python3
"""
Test script to verify the backend is working with Neon database
"""
import requests
import json
import uuid

BASE_URL = "http://localhost:8002"

def test_backend():
    print("Testing backend with Neon database connection...")

    # Create a test user
    test_email = f"test_{uuid.uuid4()}@example.com"
    test_password = "password123"

    print(f"Creating user: {test_email}")

    # Register
    register_data = {
        "email": test_email,
        "password": test_password,
        "first_name": "Test",
        "last_name": "User"
    }

    try:
        register_resp = requests.post(f"{BASE_URL}/api/v1/auth/register",
                                   json=register_data,
                                   timeout=15)  # Increased timeout
        print(f"Register status: {register_resp.status_code}")

        if register_resp.status_code == 200:
            print("✅ Registration successful!")
        else:
            print(f"❌ Registration failed: {register_resp.text}")
            return

        # Login
        login_data = {
            "email": test_email,
            "password": test_password
        }

        login_resp = requests.post(f"{BASE_URL}/api/v1/auth/login",
                                 json=login_data,
                                 timeout=15)  # Increased timeout
        print(f"Login status: {login_resp.status_code}")

        if login_resp.status_code == 200:
            token = login_resp.json()["data"]["token"]
            print("✅ Login successful!")

            # Test getting tasks (should be empty)
            headers = {"Authorization": f"Bearer {token}"}
            tasks_resp = requests.get(f"{BASE_URL}/api/v1/tasks",
                                   headers=headers,
                                   timeout=15)  # Increased timeout
            print(f"Get tasks status: {tasks_resp.status_code}")

            if tasks_resp.status_code == 200:
                print("✅ Get tasks successful!")

                # Try creating a task
                task_data = {
                    "title": "Test task from Neon",
                    "description": "Task created in Neon database",
                    "status": "pending",
                    "priority": "medium"
                }

                create_resp = requests.post(f"{BASE_URL}/api/v1/tasks",
                                         headers=headers,
                                         json=task_data,
                                         timeout=15)  # Increased timeout
                print(f"Create task status: {create_resp.status_code}")

                if create_resp.status_code == 200:
                    print("✅ Task creation successful!")
                    print("🎉 Backend is working properly with Neon database!")
                else:
                    print(f"❌ Task creation failed: {create_resp.text}")
            else:
                print(f"❌ Get tasks failed: {tasks_resp.text}")
        else:
            print(f"❌ Login failed: {login_resp.text}")

    except requests.exceptions.Timeout:
        print("❌ Request timed out - database connection might be slow")
    except Exception as e:
        print(f"❌ Error during testing: {e}")

if __name__ == "__main__":
    test_backend()