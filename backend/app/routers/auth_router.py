"""
Authentication Router:
Endpoints for user registration, login, and profile fetching.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    """
    Registers a new student or instructor, hashes password, 
    stores record in Postgres, and returns a JWT token.
    """
    # 1. Check if email already exists
    existing_user = db.query(models.User).filter(models.User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    # 2. Hash the user's password
    hashed_pwd = hash_password(user_in.password)

    # 3. Create the user database record
    role = user_in.role if user_in.role in ["student", "instructor"] else "student"
    new_user = models.User(
        full_name=user_in.full_name.strip(),
        email=user_in.email.lower(),
        hashed_password=hashed_pwd,
        role=role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. Generate JWT access token
    access_token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email, "role": new_user.role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user,
    }


@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates user with email and password, returning a JWT token upon success.
    """
    user = db.query(models.User).filter(models.User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate JWT access token
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """
    Returns the currently logged-in user profile.
    Requires Bearer token in the Authorization header.
    """
    return current_user
