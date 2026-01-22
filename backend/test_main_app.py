#!/usr/bin/env python3
"""
Test the main application to check if models load properly
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

# Import the main app which should handle all model loading
try:
    from src.main import app
    print("✅ Main application loaded successfully!")
    print("✅ All models loaded without circular dependency issues!")

    # Test that the app can start
    from src.database import engine
    from sqlmodel import SQLModel
    print("✅ Database engine created successfully!")

    # Try to create tables
    SQLModel.metadata.create_all(bind=engine)
    print("✅ Database tables created/accessed successfully!")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()