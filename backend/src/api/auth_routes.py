from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Dict, Any
from datetime import timedelta
from src.database import get_session
from src.models.user import User, UserCreate, UserRead
from src.models.session import Session as SessionModel
from src.services.auth_service import create_user, authenticate_user, revoke_session, create_session_for_user
from src.utils.auth import create_access_token, create_token_for_user, verify_token, get_current_user
from src.utils.auth import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

@router.post("/register", response_model=Dict[str, Any])
def register_user(user_create: UserCreate, db: Session = Depends(get_session)):
    """Register a new user."""
    try:
        # Create the user
        user = create_user(user_create, db)

        # Create response data
        user_response = UserRead(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at
        )

        return {
            "success": True,
            "message": "User registered successfully",
            "data": {
                "user": user_response
            }
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration"
        )


@router.post("/login", response_model=Dict[str, Any])
def login_user(user_data: Dict[str, str], db: Session = Depends(get_session)):
    """Authenticate user and return JWT token."""
    email = user_data.get("email")
    password = user_data.get("password")

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )

    user = authenticate_user(email, password, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)

    # Prepare user response
    user_response = UserRead(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at
    )

    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "user": user_response,
            "token": token
        }
    }


@router.post("/logout", response_model=Dict[str, Any])
def logout_user():
    """Invalidate current user session (client-side token removal)."""
    # For stateless JWT, server-side logout typically requires a token blacklist
    # For now, we acknowledge the logout request and let client handle token removal

    return {
        "success": True,
        "message": "Logout successful"
    }


@router.get("/me", response_model=Dict[str, Any])
def get_current_user_endpoint(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user details."""
    user_response = UserRead(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

    return {
        "success": True,
        "data": {
            "user": user_response
        }
    }