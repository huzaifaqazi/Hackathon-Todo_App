from sqlmodel import create_engine, Session
from typing import Generator
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
# Check for Railway DATABASE_URL first, then Neon, then fallback
DATABASE_URL = os.getenv("DATABASE_URL", os.getenv("NEON_DATABASE_URL", "postgresql://username:password@ep-your-endpoint.region.aws.neon.tech/neondb?sslmode=require"))

# Create the engine
engine = create_engine(DATABASE_URL, echo=True)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session