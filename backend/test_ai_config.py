#!/usr/bin/env python3
"""
Test script to verify AI service configuration.
"""

import os
import sys
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add src to path so we can import our modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from services.ai_service import AIService

async def test_ai_service():
    """Test that the AI service can be initialized and configured properly."""
    print("Testing AI Service Configuration...")

    # Check if required environment variables are set
    api_key = os.getenv("OPENROUTER_API_KEY")
    model = os.getenv("OPENROUTER_MODEL", "google/gemini/gemini-1.5-flash")

    print(f"OPENROUTER_API_KEY is {'SET' if api_key else 'NOT SET'}")
    print(f"OPENROUTER_MODEL is: {model}")

    if not api_key:
        print("ERROR: OPENROUTER_API_KEY environment variable is not set!")
        return False

    try:
        # Try to initialize the AI service
        ai_service = AIService()
        print("✓ AI Service initialized successfully")

        # Test a simple model info request (without making a full API call)
        print(f"✓ Model configured: {model}")

        # Test with a simple health check by checking if the client is properly configured
        if hasattr(ai_service, 'client') and ai_service.client:
            print("✓ OpenAI client configured with OpenRouter")
            print("✓ Configuration appears to be correct!")
            return True
        else:
            print("✗ AI service client not properly initialized")
            return False

    except Exception as e:
        print(f"✗ Error initializing AI service: {str(e)}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_ai_service())
    if success:
        print("\n✓ All configuration checks passed!")
        sys.exit(0)
    else:
        print("\n✗ Configuration issues detected!")
        sys.exit(1)