#!/usr/bin/env python3
"""
Quick test to verify login endpoint returns valid JWT token
"""
import requests
import uuid
import os

BASE_URL = os.getenv("API_URL", "http://localhost:8000")

def test_login_returns_valid_token():
    """Test that login endpoint returns valid JWT token"""
    print("Testing login endpoint returns valid JWT token...")

    # Register a test user
    register_data = {
        "email": f"test_{uuid.uuid4()}@example.com",
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "User"
    }

    try:
        # Register user
        register_resp = requests.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)

        if register_resp.status_code != 200:
            print(f"Failed to register user: {register_resp.text}")
            return False

        # Login to get JWT token
        login_data = {
            "email": register_data["email"],
            "password": register_data["password"]
        }

        login_resp = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)

        if login_resp.status_code != 200:
            print(f"Failed to login user: {login_resp.text}")
            return False

        response_data = login_resp.json()

        # Check if token is present in response
        token = response_data.get("data", {}).get("token")
        user_data = response_data.get("data", {}).get("user")

        if not token:
            print("No token received from login")
            return False

        if not user_data:
            print("No user data received from login")
            return False

        # Check that token looks like a JWT (has 3 parts separated by dots)
        if len(token.split('.')) != 3:
            print("Token doesn't look like a valid JWT")
            return False

        print("✓ Login endpoint returns valid JWT token")
        return True

    except Exception as e:
        print(f"Error during login test: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_login_returns_valid_token()
    print(f"Login test: {'PASS' if success else 'FAIL'}")