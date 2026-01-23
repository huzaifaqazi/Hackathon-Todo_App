#!/usr/bin/env python3
"""
Test script to verify Neon database connectivity and basic operations
"""
import os
from sqlmodel import SQLModel, create_engine, Session, select
from src.database import DATABASE_URL
from src.models.user import User
from src.models.task import Task

print(f"Testing Neon Database Connection...")
print(f"DATABASE_URL: {DATABASE_URL}")

try:
    # Create engine
    engine = create_engine(DATABASE_URL)
    print("✅ Database engine created successfully")

    # Test connection by creating tables
    SQLModel.metadata.create_all(bind=engine)
    print("✅ Tables created successfully (or already existed)")

    # Test with a simple session
    with Session(engine) as session:
        # Count existing users
        user_count = session.exec(select(User)).all()
        print(f"✅ Connected to database - found {len(user_count)} users")

        # Count existing tasks
        task_count = session.exec(select(Task)).all()
        print(f"✅ Connected to database - found {len(task_count)} tasks")

    print("\n🎉 Neon database connection is working correctly!")
    print("✅ Data will now be persisted in Neon PostgreSQL database")
    print("✅ All user data, tasks, etc. will be stored in the cloud")

except Exception as e:
    print(f"❌ Database connection error: {e}")
    print("⚠️  You may need to check your Neon database credentials")