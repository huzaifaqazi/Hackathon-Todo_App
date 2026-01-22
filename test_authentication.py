#!/usr/bin/env python3
"""
Test script to verify JWT authentication implementation
"""
import requests
import json
from datetime import datetime, timedelta
import uuid
import os

# Base URL for the API
BASE_URL = os.getenv("API_URL", "http://localhost:8000")

def test_protected_endpoints_with_valid_jwt():
    """Test that protected endpoints work with valid JWT tokens"""
    print("Testing protected endpoints with valid JWT tokens...")

    # First, register a test user
    register_data = {
        "email": f"test_{uuid.uuid4()}@example.com",
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "User"
    }

    try:
        # Register user
        register_resp = requests.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
        print(f"Register response: {register_resp.status_code}")

        if register_resp.status_code != 200:
            print(f"Failed to register user: {register_resp.text}")
            return False

        # Login to get JWT token
        login_data = {
            "email": register_data["email"],
            "password": register_data["password"]
        }

        login_resp = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
        print(f"Login response: {login_resp.status_code}")

        if login_resp.status_code != 200:
            print(f"Failed to login user: {login_resp.text}")
            return False

        response_data = login_resp.json()
        token = response_data.get("data", {}).get("token")

        if not token:
            print("No token received from login")
            return False

        print("Successfully obtained JWT token")

        # Test protected endpoint with valid JWT
        headers = {"Authorization": f"Bearer {token}"}
        me_resp = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers)
        print(f"Me endpoint response: {me_resp.status_code}")

        if me_resp.status_code != 200:
            print(f"Failed to access protected endpoint with valid token: {me_resp.text}")
            return False

        print("✓ Protected endpoint works with valid JWT token")
        return True

    except Exception as e:
        print(f"Error during valid JWT test: {str(e)}")
        return False


def test_protected_endpoints_without_jwt():
    """Test that protected endpoints return 401 for requests without JWT tokens"""
    print("\nTesting protected endpoints without JWT tokens...")

    try:
        # Try to access protected endpoint without token
        resp = requests.get(f"{BASE_URL}/api/v1/auth/me")
        print(f"Me endpoint without token response: {resp.status_code}")

        if resp.status_code == 401:
            print("✓ Protected endpoint correctly returns 401 without JWT token")
            return True
        else:
            print(f"✗ Expected 401, got {resp.status_code}: {resp.text}")
            return False

    except Exception as e:
        print(f"Error during no-token test: {str(e)}")
        return False


def test_protected_endpoints_with_invalid_jwt():
    """Test that protected endpoints return 401 for invalid/expired JWT tokens"""
    print("\nTesting protected endpoints with invalid JWT tokens...")

    try:
        # Try to access protected endpoint with invalid token
        headers = {"Authorization": "Bearer invalid_token_format"}
        resp = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers)
        print(f"Me endpoint with invalid token response: {resp.status_code}")

        if resp.status_code == 401:
            print("✓ Protected endpoint correctly returns 401 with invalid JWT token")
            return True
        else:
            print(f"✗ Expected 401, got {resp.status_code}: {resp.text}")
            return False

    except Exception as e:
        print(f"Error during invalid token test: {str(e)}")
        return False


def run_tests():
    """Run all authentication tests"""
    print("=" * 60)
    print("Starting JWT Authentication Tests")
    print("=" * 60)

    results = []

    # Test 1: Valid JWT
    results.append(test_protected_endpoints_with_valid_jwt())

    # Test 2: No JWT
    results.append(test_protected_endpoints_without_jwt())

    # Test 3: Invalid JWT
    results.append(test_protected_endpoints_with_invalid_jwt())

    print("\n" + "=" * 60)
    print("Test Results:")
    print(f"Valid JWT test: {'PASS' if results[0] else 'FAIL'}")
    print(f"No JWT test: {'PASS' if results[1] else 'FAIL'}")
    print(f"Invalid JWT test: {'PASS' if results[2] else 'FAIL'}")

    all_passed = all(results)
    print(f"\nOverall: {'ALL TESTS PASSED' if all_passed else 'SOME TESTS FAILED'}")
    print("=" * 60)

    return all_passed


if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)