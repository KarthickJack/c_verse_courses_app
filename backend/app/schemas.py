"""
Pydantic Schemas for Request Validation and Response Serialization.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# ----------------- User Schemas -----------------

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, example="John Doe")
    email: EmailStr = Field(..., example="john@cverse.com")
    password: str = Field(..., min_length=6, example="secret123")
    role: Optional[str] = Field("student", example="student")  # "student" or "instructor"


class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="john@cverse.com")
    password: str = Field(..., example="secret123")


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None


# ----------------- Course Schemas -----------------

class CourseBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=150, example="Full Stack Web Development")
    description: str = Field(..., min_length=10, example="Learn React, FastAPI and PostgreSQL from scratch.")
    category: str = Field(default="Full Stack", example="Full Stack")
    level: str = Field(default="Beginner", example="Beginner")
    duration_hours: int = Field(default=30, ge=1, le=500, example=30)
    price: int = Field(default=0, ge=0, example=0)


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    duration_hours: Optional[int] = None
    price: Optional[int] = None


class CourseResponse(CourseBase):
    id: int
    instructor_id: int
    instructor: Optional[UserResponse] = None
    enrolled_count: Optional[int] = 0
    is_enrolled: Optional[bool] = False
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------- Enrollment Schemas -----------------

class EnrollmentResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    enrolled_at: datetime
    status: str
    course: Optional[CourseResponse] = None

    class Config:
        from_attributes = True
