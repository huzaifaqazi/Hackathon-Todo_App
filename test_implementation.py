#!/usr/bin/env python3
"""
Test script to verify the Todo Full-Stack Web Application implementation.
This script checks that all required components have been created according to the specification.
"""

import os
import sys
from pathlib import Path

def test_backend_structure():
    """Test that all required backend files and directories exist."""
    print("Testing backend structure...")

    backend_path = Path("backend")

    # Check main directories
    required_dirs = [
        "src/models",
        "src/services",
        "src/api",
        "src/utils",
        "src/middleware",
        "alembic",
        "tests/unit",
        "tests/integration",
        "tests/contract"
    ]

    for dir_path in required_dirs:
        full_path = backend_path / dir_path
        if not full_path.exists():
            print(f"❌ Missing directory: {full_path}")
            return False
        print(f"✅ Found directory: {full_path}")

    # Check required files
    required_files = [
        "requirements.txt",
        "src/main.py",
        "src/database.py",
        "src/models/user.py",
        "src/models/task.py",
        "src/models/session.py",
        "src/services/auth_service.py",
        "src/services/task_service.py",
        "src/utils/auth.py",
        "src/middleware/task_auth.py",
        "src/api/auth_routes.py",
        "src/api/task_routes.py",
        "alembic.ini"
    ]

    for file_path in required_files:
        full_path = backend_path / file_path
        if not full_path.exists():
            print(f"❌ Missing file: {full_path}")
            return False
        print(f"✅ Found file: {full_path}")

    return True

def test_frontend_structure():
    """Test that all required frontend files and directories exist."""
    print("\nTesting frontend structure...")

    frontend_path = Path("frontend")

    # Check main directories
    required_dirs = [
        "src/components",
        "src/components/auth",
        "src/components/task",
        "src/components/layout",
        "src/pages",
        "src/services",
        "src/context",
        "src/types",
        "tests/unit",
        "tests/integration"
    ]

    for dir_path in required_dirs:
        full_path = frontend_path / dir_path
        if not full_path.exists():
            print(f"❌ Missing directory: {full_path}")
            return False
        print(f"✅ Found directory: {full_path}")

    # Check required files
    required_files = [
        "package.json",
        "src/pages/login.tsx",
        "src/pages/register.tsx",
        "src/pages/dashboard.tsx",
        "src/components/auth/LoginForm.tsx",
        "src/components/auth/RegisterForm.tsx",
        "src/components/task/TaskCard.tsx",
        "src/components/task/TaskForm.tsx",
        "src/components/layout/Header.tsx",
        "src/components/layout/DashboardLayout.tsx",
        "src/components/layout/ProtectedRoute.tsx",
        "src/services/auth.ts",
        "src/services/api.ts",
        "src/context/AuthContext.tsx",
        "src/context/TaskContext.tsx",
        "src/types/user.ts",
        "src/types/task.ts"
    ]

    for file_path in required_files:
        full_path = frontend_path / file_path
        if not full_path.exists():
            print(f"❌ Missing file: {full_path}")
            return False
        print(f"✅ Found file: {full_path}")

    return True

def test_root_files():
    """Test that root-level configuration files exist."""
    print("\nTesting root-level files...")

    required_files = [
        "docker-compose.yml",
        "README.md"
    ]

    for file_path in required_files:
        if not Path(file_path).exists():
            print(f"❌ Missing file: {file_path}")
            return False
        print(f"✅ Found file: {file_path}")

    # Check for .env.example files in subdirectories
    backend_env = Path("backend/.env.example")
    frontend_env = Path("frontend/.env.example")

    if not backend_env.exists():
        print("❌ Missing file: backend/.env.example")
        return False
    print("✅ Found file: backend/.env.example")

    if not frontend_env.exists():
        print("❌ Missing file: frontend/.env.example")
        return False
    print("✅ Found file: frontend/.env.example")

    return True

def test_backend_requirements():
    """Test that backend requirements.txt contains required dependencies."""
    print("\nTesting backend requirements...")

    req_file = Path("backend/requirements.txt")
    if not req_file.exists():
        print("❌ Missing backend/requirements.txt")
        return False

    content = req_file.read_text()
    required_deps = [
        "fastapi",
        "sqlmodel",
        "uvicorn",
        "psycopg2-binary",
        "alembic",
        "python-jose",
        "passlib",
        "python-multipart",
        "python-dotenv"
    ]

    missing_deps = []
    for dep in required_deps:
        if dep.lower() not in content.lower():
            missing_deps.append(dep)

    if missing_deps:
        print(f"❌ Missing dependencies in requirements.txt: {missing_deps}")
        return False

    print("✅ All required dependencies found in requirements.txt")
    return True

def test_frontend_package():
    """Test that frontend package.json contains required dependencies."""
    print("\nTesting frontend package.json...")

    pkg_file = Path("frontend/package.json")
    if not pkg_file.exists():
        print("❌ Missing frontend/package.json")
        return False

    content = pkg_file.read_text()
    required_deps = [
        "react",
        "next",
        "axios"
    ]

    missing_deps = []
    for dep in required_deps:
        if dep.lower() not in content.lower():
            missing_deps.append(dep)

    if missing_deps:
        print(f"❌ Missing dependencies in package.json: {missing_deps}")
        return False

    print("✅ All required dependencies found in package.json")
    return True

def main():
    """Run all tests."""
    print("🧪 Testing Todo Full-Stack Web Application Implementation\n")

    all_passed = True

    all_passed &= test_backend_structure()
    all_passed &= test_frontend_structure()
    all_passed &= test_root_files()
    all_passed &= test_backend_requirements()
    all_passed &= test_frontend_package()

    print(f"\n{'🎉 All tests passed!' if all_passed else '❌ Some tests failed!'}")

    if all_passed:
        print("\n✅ The Todo Full-Stack Web Application implementation is complete!")
        print("All required components have been created according to the specification.")
        return 0
    else:
        print("\n❌ The implementation is incomplete. Please check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())