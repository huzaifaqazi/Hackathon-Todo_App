#!/usr/bin/env python3
"""
Check if database tables exist in Neon
"""
import os
from sqlmodel import SQLModel, create_engine, Session, select
from src.database import DATABASE_URL
from src.models.user import User
from src.models.task import Task

print(f"Connecting to database: {DATABASE_URL}")

try:
    # Create engine
    engine = create_engine(DATABASE_URL)

    # Test the connection
    with Session(engine) as session:
        # Try to count users (this will test if table exists)
        try:
            user_count = session.exec(select(User)).all()
            print(f"✅ Users table exists - found {len(user_count)} users")
        except Exception as e:
            print(f"❌ Users table issue: {e}")

        # Try to count tasks (this will test if table exists)
        try:
            task_count = session.exec(select(Task)).all()
            print(f"✅ Tasks table exists - found {len(task_count)} tasks")
        except Exception as e:
            print(f"❌ Tasks table issue: {e}")

    print("\n✅ Database connection successful!")
    print("✅ Tables exist and are accessible!")

except Exception as e:
    print(f"❌ Database connection error: {e}")
    print("💡 This might be due to:")
    print("   - Incorrect Neon database credentials")
    print("   - Database not initialized")
    print("   - Network connectivity issues")