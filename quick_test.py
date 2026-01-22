#!/usr/bin/env python3
"""
Quick test to verify the main fix works
"""
import requests
import json
import uuid

BASE_URL = "http://localhost:8002"

def quick_test():
    print("Quick test to verify the main issue is fixed...")

    # Register and login a user
    test_email = f"test_{uuid.uuid4()}@example.com"
    test_password = "password123"

    print(f"Creating user: {test_email}")

    # Register
    register_resp = requests.post(f"{BASE_URL}/api/v1/auth/register", json={
        "email": test_email,
        "password": test_password,
        "first_name": "Test",
        "last_name": "User"
    })

    if register_resp.status_code != 200:
        print(f"❌ Register failed: {register_resp.status_code}")
        return False

    # Login
    login_resp = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": test_email,
        "password": test_password
    })

    if login_resp.status_code != 200:
        print(f"❌ Login failed: {login_resp.status_code}")
        return False

    token = login_resp.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test the main issue - GET /api/v1/tasks should return 200, not 500
    print("Testing GET /api/v1/tasks (this was returning 500 before the fix)...")
    tasks_resp = requests.get(f"{BASE_URL}/api/v1/tasks", headers=headers)

    print(f"Status: {tasks_resp.status_code}")
    if tasks_resp.status_code == 200:
        print("✅ SUCCESS: GET /api/v1/tasks now returns 200 instead of 500!")
        data = tasks_resp.json()
        print(f"✅ Response: {len(data['data']['tasks'])} tasks, total count: {data['data']['total_count']}")
        return True
    else:
        print(f"❌ FAILED: Still getting {tasks_resp.status_code}")
        print(f"Response: {tasks_resp.text}")
        return False

if __name__ == "__main__":
    success = quick_test()
    if success:
        print("\n🎉 MAIN ISSUE FIXED: Dashboard API calls should now work!")
    else:
        print("\n❌ Issue still exists")