from sqlmodel import Session, select
from src.models.user import User, UserCreate
from src.models.session import Session as SessionModel, SessionCreate
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import uuid

# Password hashing context - temporarily using pbkdf2 instead of bcrypt to avoid length issues
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    if len(password) > 72:
        raise ValueError("Password must not exceed 72 characters")
    return pwd_context.hash(password)


def create_user(user_create: UserCreate, db_session: Session) -> User:
    """Create a new user with hashed password."""
    # Validate password length (bcrypt limitation: max 72 bytes)
    if len(user_create.password) > 72:
        raise ValueError("Password must not exceed 72 characters")

    # Check if user with email already exists
    existing_user = db_session.exec(select(User).where(User.email == user_create.email)).first()
    if existing_user:
        raise ValueError("Email already registered")

    # Hash the password
    hashed_password = get_password_hash(user_create.password)

    # Create user object
    user = User(
        email=user_create.email,
        first_name=user_create.first_name,
        last_name=user_create.last_name,
        hashed_password=hashed_password
    )

    # Add to database
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    return user


def authenticate_user(email: str, password: str, db_session: Session) -> Optional[User]:
    """Authenticate user with email and password."""
    user = db_session.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.hashed_password):
        return None

    return user


def create_session_for_user(user_id: uuid.UUID, token_hash: str, expires_at: datetime, db_session: Session) -> SessionModel:
    """Create a session for a user."""
    session = SessionModel(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at
    )

    db_session.add(session)
    db_session.commit()
    db_session.refresh(session)

    return session




def revoke_session(token_hash: str, db_session: Session) -> bool:
    """Revoke a user session."""
    session = db_session.exec(
        select(SessionModel).where(SessionModel.token_hash == token_hash)
    ).first()

    if not session:
        return False

    session.is_revoked = True
    db_session.add(session)
    db_session.commit()

    return True