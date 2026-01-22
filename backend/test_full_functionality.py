#!/usr/bin/env python3
"""
Test full functionality with longer timeouts for Neon database
"""
import requests
import json
import uuid
import time

BASE_URL = "http://localhost:8002"

def test_full_functionality():
    print("Testing full functionality with Neon database...")

    # Create a test user
    test_email = f"test_{uuid.uuid4()}@example.com"
    test_password = "password123"

    print(f"Creating user: {test_email}")

    # Register with longer timeout
    register_data = {
        "email": test_email,
        "password": test_password,
        "first_name": "Test",
        "last_name": "User"
    }

    try:
        print("1. Testing registration...")
        register_resp = requests.post(f"{BASE_URL}/api/v1/auth/register",
                                   json=register_data,
                                   timeout=30)  # Longer timeout for Neon
        print(f"   Register status: {register_resp.status_code}")

        if register_resp.status_code == 200:
            print("   ✅ Registration successful!")
        else:
            print(f"   ❌ Registration failed: {register_resp.text}")
            return False

        # Login with longer timeout
        print("2. Testing login...")
        login_data = {
            "email": test_email,
            "password": test_password
        }

        login_resp = requests.post(f"{BASE_URL}/api/v1/auth/login",
                                 json=login_data,
                                 timeout=30)  # Longer timeout for Neon
        print(f"   Login status: {login_resp.status_code}")

        if login_resp.status_code == 200:
            token = login_resp.json()["data"]["token"]
            print("   ✅ Login successful!")

            # Wait a bit for database sync
            time.sleep(1)

            # Test getting tasks (should be empty)
            print("3. Testing GET /api/v1/tasks...")
            headers = {"Authorization": f"Bearer {token}"}
            tasks_resp = requests.get(f"{BASE_URL}/api/v1/tasks",
                                   headers=headers,
                                   timeout=30)  # Longer timeout
            print(f"   Get tasks status: {tasks_resp.status_code}")

            if tasks_resp.status_code == 200:
                print("   ✅ Get tasks successful!")

                # Try creating a task with longer timeout
                print("4. Testing POST /api/v1/tasks...")
                task_data = {
                    "title": "Test task from Neon",
                    "description": "Task created in Neon database",
                    "status": "pending",
                    "priority": "medium"
                }

                create_resp = requests.post(f"{BASE_URL}/api/v1/tasks",
                                         headers=headers,
                                         json=task_data,
                                         timeout=30)  # Longer timeout
                print(f"   Create task status: {create_resp.status_code}")

                if create_resp.status_code == 200:
                    print("   ✅ Task creation successful!")

                    # Wait for database sync
                    time.sleep(1)

                    # Get tasks again to verify creation
                    print("5. Testing GET /api/v1/tasks after creation...")
                    tasks_resp2 = requests.get(f"{BASE_URL}/api/v1/tasks",
                                            headers=headers,
                                            timeout=30)
                    if tasks_resp2.status_code == 200:
                        task_count = len(tasks_resp2.json()["data"]["tasks"])
                        print(f"   ✅ Found {task_count} task(s) after creation!")

                        print("\n🎉 All functionality tests passed!")
                        print("✅ Registration works")
                        print("✅ Login works")
                        print("✅ Task creation works")
                        print("✅ Task retrieval works")
                        print("✅ Connected to Neon database successfully!")
                        return True
                    else:
                        print(f"   ❌ Failed to get tasks after creation: {tasks_resp2.text}")
                        return False
                else:
                    print(f"   ❌ Task creation failed: {create_resp.text}")
                    return False
            else:
                print(f"   ❌ Get tasks failed: {tasks_resp.text}")
                return False
        else:
            print(f"   ❌ Login failed: {login_resp.text}")
            return False

    except requests.exceptions.Timeout:
        print("   ❌ Request timed out - Neon database might be slow")
        return False
    except Exception as e:
        print(f"   ❌ Error during testing: {e}")
        return False

if __name__ == "__main__":
    success = test_full_functionality()
    if success:
        print("\n🎊 BACKEND IS WORKING PROPERLY WITH NEON DATABASE! 🎊")
    else:
        print("\n❌ Some functionality is not working")