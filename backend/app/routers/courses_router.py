"""
Courses Router:
CRUD operations for courses, searching, filtering, and student enrollment.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, get_current_user_optional, require_instructor

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("", response_model=List[schemas.CourseResponse])
def get_courses(
    search: Optional[str] = Query(None, description="Search courses by title or description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    level: Optional[str] = Query(None, description="Filter by level (Beginner, Intermediate, Advanced)"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
):
    """
    Fetch all courses with optional search and filters.
    Includes enrollment counts and whether the current user is enrolled.
    """
    query = db.query(models.Course)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                models.Course.title.ilike(search_pattern),
                models.Course.description.ilike(search_pattern),
            )
        )

    if category and category != "All":
        query = query.filter(models.Course.category == category)

    if level and level != "All":
        query = query.filter(models.Course.level == level)

    courses = query.order_by(models.Course.created_at.desc()).all()

    # Pre-fetch user enrollments if logged in
    user_enrolled_ids = set()
    if current_user:
        enrollments = db.query(models.Enrollment.course_id).filter(
            models.Enrollment.user_id == current_user.id
        ).all()
        user_enrolled_ids = {e[0] for e in enrollments}

    # Pre-fetch enrollment counts
    count_query = db.query(
        models.Enrollment.course_id, 
        func.count(models.Enrollment.id)
    ).group_by(models.Enrollment.course_id).all()
    count_dict = {course_id: cnt for course_id, cnt in count_query}

    results = []
    for c in courses:
        results.append(
            schemas.CourseResponse(
                id=c.id,
                title=c.title,
                description=c.description,
                category=c.category,
                level=c.level,
                duration_hours=c.duration_hours,
                price=c.price,
                instructor_id=c.instructor_id,
                instructor=schemas.UserResponse.from_orm(c.instructor) if c.instructor else None,
                enrolled_count=count_dict.get(c.id, 0),
                is_enrolled=(c.id in user_enrolled_ids),
                created_at=c.created_at,
            )
        )

    return results


@router.get("/my/enrollments", response_model=List[schemas.EnrollmentResponse])
def get_my_enrollments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Returns all courses enrolled by the currently authenticated user.
    """
    enrollments = (
        db.query(models.Enrollment)
        .filter(models.Enrollment.user_id == current_user.id)
        .order_by(models.Enrollment.enrolled_at.desc())
        .all()
    )

    results = []
    for enrollment in enrollments:
        c = enrollment.course
        course_resp = schemas.CourseResponse(
            id=c.id,
            title=c.title,
            description=c.description,
            category=c.category,
            level=c.level,
            duration_hours=c.duration_hours,
            price=c.price,
            instructor_id=c.instructor_id,
            instructor=schemas.UserResponse.from_orm(c.instructor) if c.instructor else None,
            enrolled_count=0,
            is_enrolled=True,
            created_at=c.created_at,
        )
        results.append(
            schemas.EnrollmentResponse(
                id=enrollment.id,
                user_id=enrollment.user_id,
                course_id=enrollment.course_id,
                enrolled_at=enrollment.enrolled_at,
                status=enrollment.status,
                course=course_resp,
            )
        )

    return results


@router.get("/{course_id}", response_model=schemas.CourseResponse)
def get_course_detail(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
):
    """
    Retrieve full details for a single course.
    """
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID {course_id} not found",
        )

    enrolled_count = db.query(models.Enrollment).filter(models.Enrollment.course_id == course.id).count()
    is_enrolled = False
    if current_user:
        is_enrolled = db.query(models.Enrollment).filter(
            models.Enrollment.course_id == course.id,
            models.Enrollment.user_id == current_user.id
        ).first() is not None

    return schemas.CourseResponse(
        id=course.id,
        title=course.title,
        description=course.description,
        category=course.category,
        level=course.level,
        duration_hours=course.duration_hours,
        price=course.price,
        instructor_id=course.instructor_id,
        instructor=schemas.UserResponse.from_orm(course.instructor) if course.instructor else None,
        enrolled_count=enrolled_count,
        is_enrolled=is_enrolled,
        created_at=course.created_at,
    )


@router.post("", response_model=schemas.CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    course_in: schemas.CourseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_instructor),
):
    """
    Creates a new course. Restricted to users with the 'instructor' role.
    """
    new_course = models.Course(
        title=course_in.title.strip(),
        description=course_in.description.strip(),
        category=course_in.category.strip(),
        level=course_in.level.strip(),
        duration_hours=course_in.duration_hours,
        price=course_in.price,
        instructor_id=current_user.id,
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return schemas.CourseResponse(
        id=new_course.id,
        title=new_course.title,
        description=new_course.description,
        category=new_course.category,
        level=new_course.level,
        duration_hours=new_course.duration_hours,
        price=new_course.price,
        instructor_id=new_course.instructor_id,
        instructor=schemas.UserResponse.from_orm(current_user),
        enrolled_count=0,
        is_enrolled=False,
        created_at=new_course.created_at,
    )


@router.put("/{course_id}", response_model=schemas.CourseResponse)
def update_course(
    course_id: int,
    course_in: schemas.CourseUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_instructor),
):
    """
    Update course details. Only the instructor who created the course can edit it.
    """
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Course not found"
        )

    if course.instructor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit courses that you created",
        )

    # Update only provided fields
    update_data = course_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)

    db.commit()
    db.refresh(course)

    enrolled_count = db.query(models.Enrollment).filter(models.Enrollment.course_id == course.id).count()

    return schemas.CourseResponse(
        id=course.id,
        title=course.title,
        description=course.description,
        category=course.category,
        level=course.level,
        duration_hours=course.duration_hours,
        price=course.price,
        instructor_id=course.instructor_id,
        instructor=schemas.UserResponse.from_orm(course.instructor),
        enrolled_count=enrolled_count,
        is_enrolled=False,
        created_at=course.created_at,
    )


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_instructor),
):
    """
    Delete a course. Only the instructor who created it can delete it.
    """
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Course not found"
        )

    if course.instructor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete courses that you created",
        )

    db.delete(course)
    db.commit()
    return None


@router.post("/{course_id}/enroll", status_code=status.HTTP_201_CREATED)
def enroll_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Enroll the currently authenticated student into a course.
    """
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Course not found"
        )

    # Check if already enrolled
    existing_enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id,
        models.Enrollment.course_id == course_id
    ).first()

    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already enrolled in this course.",
        )

    enrollment = models.Enrollment(
        user_id=current_user.id,
        course_id=course_id,
        status="active"
    )
    db.add(enrollment)
    db.commit()

    return {"message": "Successfully enrolled in course!", "course_id": course_id}


@router.delete("/{course_id}/enroll", status_code=status.HTTP_200_OK)
def unenroll_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Unenroll the currently authenticated student from a course.
    """
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id,
        models.Enrollment.course_id == course_id
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not enrolled in this course.",
        )

    db.delete(enrollment)
    db.commit()

    return {"message": "Successfully unenrolled from course.", "course_id": course_id}
