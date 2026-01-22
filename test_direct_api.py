#!/usr/bin/env python3
"""
Direct API test to verify authentication functionality
"""
import requests
import json
import uuid

BASE_URL = "http://localhost:8002"

def test_register_and_login():
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
    print(f"Register response: {register_resp.text}")

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
    print(f"Login response: {login_resp.text}")

    if login_resp.status_code != 200:
        print("Login failed!")
        return False

    response_data = login_resp.json()
    if "data" not in response_data or "token" not in response_data["data"]:
        print("No token in login response!")
        return False

    token = response_data["data"]["token"]
    print(f"Got token: {token[:20]}...")

    # Test accessing protected endpoint with token
    headers = {"Authorization": f"Bearer {token}"}
    print("Testing /api/v1/tasks endpoint with valid token...")
    tasks_resp = requests.get(f"{BASE_URL}/api/v1/tasks", headers=headers)
    print(f"Tasks endpoint status: {tasks_resp.status_code}")
    print(f"Tasks endpoint response: {tasks_resp.text}")

    # Test accessing protected endpoint without token
    print("Testing /api/v1/tasks endpoint without token...")
    no_auth_resp = requests.get(f"{BASE_URL}/api/v1/tasks")
    print(f"No auth status: {no_auth_resp.status_code}")
    print(f"No auth response: {no_auth_resp.text}")

    # Test accessing user info endpoint with token
    print("Testing /api/v1/auth/me endpoint with valid token...")
    me_resp = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers)
    print(f"Me endpoint status: {me_resp.status_code}")
    print(f"Me endpoint response: {me_resp.text}")

    return True

if __name__ == "__main__":
    test_register_and_login()