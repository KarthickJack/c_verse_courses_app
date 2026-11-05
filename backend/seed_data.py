"""
Seed script to populate initial demonstration data:
- Instructor account: instructor@cverse.com / password123
- Student account: student@cverse.com / password123
- Sample coding courses tailored for C-Verse
"""

from app.database import SessionLocal, Base, engine
from app import models
from app.auth import hash_password

def seed_database():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_instructor = db.query(models.User).filter(models.User.email == "instructor@cverse.com").first()
        if existing_instructor:
            print("Database already contains seed data. Skipping seeding.")
            return

        print("Seeding initial users and courses for C-Verse...")

        # 1. Create Instructor
        instructor = models.User(
            full_name="Karthick (Lead Instructor)",
            email="instructor@cverse.com",
            hashed_password=hash_password("password123"),
            role="instructor",
        )
        db.add(instructor)

        # 2. Create Demo Student
        student = models.User(
            full_name="Alex Student",
            email="student@cverse.com",
            hashed_password=hash_password("password123"),
            role="student",
        )
        db.add(student)
        db.commit()
        db.refresh(instructor)
        db.refresh(student)

        # 3. Create Sample Courses
        courses_data = [
            {
                "title": "Python Core & Object-Oriented Programming",
                "description": "Master Python syntax, data structures, OOP paradigms, file handling, and functional programming concepts with hands-on projects.",
                "category": "Python",
                "level": "Beginner",
                "duration_hours": 30,
                "price": 0,
            },
            {
                "title": "Modern React & JavaScript ES6+",
                "description": "Learn React from components to custom hooks, state management, context API, Vite tooling, and building modern dynamic web interfaces.",
                "category": "Frontend",
                "level": "Intermediate",
                "duration_hours": 40,
                "price": 0,
            },
            {
                "title": "High-Performance Backend with FastAPI",
                "description": "Build production-grade REST APIs using Python, FastAPI, Pydantic, asynchronous endpoints, JWT security, and dependency injection.",
                "category": "Backend",
                "level": "Intermediate",
                "duration_hours": 35,
                "price": 0,
            },
            {
                "title": "Relational Databases & PostgreSQL Mastery",
                "description": "Deep dive into relational modeling, SQL queries, joins, indexes, transactions, migrations, and SQLAlchemy ORM integration.",
                "category": "Database",
                "level": "Beginner",
                "duration_hours": 25,
                "price": 0,
            },
            {
                "title": "Full-Stack Web Development Bootcamp",
                "description": "Comprehensive project-based training connecting React frontends with FastAPI backends and PostgreSQL persistence.",
                "category": "Full Stack",
                "level": "Advanced",
                "duration_hours": 60,
                "price": 0,
            },
        ]

        created_courses = []
        for c in courses_data:
            course = models.Course(
                title=c["title"],
                description=c["description"],
                category=c["category"],
                level=c["level"],
                duration_hours=c["duration_hours"],
                price=c["price"],
                instructor_id=instructor.id,
            )
            db.add(course)
            created_courses.append(course)

        db.commit()

        # Enroll demo student into the first two courses
        for course in created_courses[:2]:
            db.refresh(course)
            enrollment = models.Enrollment(
                user_id=student.id,
                course_id=course.id,
                status="active"
            )
            db.add(enrollment)

        db.commit()
        print("Initial data seeded successfully!")
        print("  - Instructor login: instructor@cverse.com / password123")
        print("  - Student login:    student@cverse.com / password123")
        print("  - 5 Courses created, 2 enrollments seeded.")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
