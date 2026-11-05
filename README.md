# 🎓 C-Verse Courses Portal (Full-Stack Web App)

A clean, modern, full-stack educational web application designed specifically for teaching students at **C-Verse (Coding Training Institute)**.

Built with **React / JavaScript**, **Python / FastAPI**, and **PostgreSQL** with full local **JWT Authentication**. No Docker or complex virtualization required—everything runs natively and transparently on your local machine.

---

## 🌟 Tech Stack Overview

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + JavaScript (Vite) | Single-page application, component hierarchy, Context API, React Router |
| **Backend** | Python 3.10+ & FastAPI | Async RESTful API, Pydantic validation, dependency injection |
| **Database** | PostgreSQL | Relational modeling, foreign keys, unique constraints, transactions |
| **ORM** | SQLAlchemy 2.0 | Object-relational mapping without raw SQL vulnerabilities |
| **Auth** | Passlib (Bcrypt) + Python-JOSE (JWT) | Secure password hashing and stateless token authentication |
| **Styling** | Modern CSS Variables | Clean, responsive UI with zero external CSS framework baggage |

---

## 📂 Project Architecture & Folder Structure

```
c_verse/courses/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py           # Environment variables loader
│   │   ├── database.py         # SQLAlchemy engine, SessionLocal, get_db dependency
│   │   ├── models.py           # SQLAlchemy database tables (User, Course, Enrollment)
│   │   ├── schemas.py          # Pydantic models for validation and responses
│   │   ├── auth.py             # Bcrypt password hashing, JWT encoding/decoding, get_current_user
│   │   ├── main.py             # FastAPI entrypoint, CORS setup, lifespan table init
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── auth_router.py  # /api/auth/register, /api/auth/login, /api/auth/me
│   │       └── courses_router.py # CRUD courses, filter/search, enrollments
│   ├── .env                    # Local environment variables
│   ├── .env.example
│   ├── requirements.txt        # Python package dependencies
│   ├── seed_data.py            # Populates initial instructor, student, and courses
│   └── run.sh                  # Backend launcher script
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── run.sh                  # Frontend launcher script
│   └── src/
│       ├── main.jsx            # React root DOM rendering
│       ├── App.jsx             # React Router and AuthProvider shell
│       ├── index.css           # Modern educational design system styling
│       ├── api.js              # Centralized fetch wrapper with Bearer token header
│       ├── context/
│       │   └── AuthContext.jsx # React Context for login, logout, and current user
│       ├── components/
│       │   ├── Navbar.jsx      # Navigation bar with role badge & session controls
│       │   ├── CourseCard.jsx  # Card displaying course details, tag, enrollment status
│       │   └── ProtectedRoute.jsx # Route guard for logged-in or instructor-only routes
│       └── pages/
│           ├── CoursesPage.jsx       # Course catalog with live search & filters
│           ├── CourseDetailPage.jsx  # Course details, enrollment button & edit controls
│           ├── MyEnrollmentsPage.jsx # Student's personal enrolled courses dashboard
│           ├── LoginPage.jsx         # Sign in form with quick demo filler
│           ├── RegisterPage.jsx      # Sign up form with role selector (Student/Instructor)
│           └── CreateCoursePage.jsx  # Instructor form to publish new courses
│
├── start.sh                    # One-click script to run both servers locally
└── README.md                   # This teaching guide
```

---

## 🚀 Quick Start (Running Locally)

### 1. Prerequisites Check
Make sure you have installed on your local Linux machine:
- **Python 3.10+** (`python3 --version`)
- **Node.js & npm** (`node -v && npm -v`)
- **PostgreSQL** (`psql --version` and `pg_isready`)

---

### 2. Database Setup (PostgreSQL)
Ensure PostgreSQL is running and create the `cverse_courses` database:

```bash
# Check postgres service status
sudo service postgresql status

# Connect as postgres user and create the database
PGPASSWORD=postgres psql -h localhost -U postgres -c "CREATE DATABASE cverse_courses;"
```

> **Note**: The default connection string in `backend/.env` is:
> `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cverse_courses`

---

### 3. Backend Setup & Seeding

```bash
cd /home/karthick/c_verse/courses/backend

# Create and activate Python virtual environment
python3 -m venv venv
source ./venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed initial data (Instructor, Student, and 5 Coding Courses)
python3 seed_data.py
```

---

### 4. Frontend Setup

```bash
cd /home/karthick/c_verse/courses/frontend

# Install node dependencies
npm install
```

---

### 5. Launch the Application

You can launch both frontend and backend with a single command from the project root:

```bash
cd /home/karthick/c_verse/courses
./start.sh
```

Or run each in separate terminals:
- **Backend Terminal**: `cd backend && ./run.sh`  (Runs on [http://localhost:8000](http://localhost:8000))
- **Frontend Terminal**: `cd frontend && ./run.sh` (Runs on [http://localhost:5175](http://localhost:5175))

---

## 🔑 Demonstration Accounts

Two pre-configured accounts are provided for classroom demonstrations:

| Role | Email | Password | What You Can Do |
| :--- | :--- | :--- | :--- |
| **Instructor** | `instructor@cverse.com` | `password123` | Publish new courses, edit courses, delete courses |
| **Student** | `student@cverse.com` | `password123` | Browse catalog, search & filter, enroll in courses, view "My Learning" |

*(You can also use the **"Fill Instructor Demo"** / **"Fill Student Demo"** buttons on the login page for instant sign-in).*

---

## 📚 Core Concepts to Teach Students

### 1. Database Modeling with SQLAlchemy (`app/models.py`)
- **Primary & Foreign Keys**: How `Course.instructor_id` references `User.id` and `Enrollment.user_id` references `User.id`.
- **Unique Constraints**: Preventing duplicate enrollments with `UniqueConstraint("user_id", "course_id")`.
- **Relationships & Cascading**: How deleting a course or user cleans up related enrollments cleanly using `cascade="all, delete-orphan"`.

### 2. Request Validation & Sanitization with Pydantic (`app/schemas.py`)
- Validating email formats with `EmailStr`.
- Enforcing password length constraints.
- Hiding sensitive fields: Responses use `UserResponse` which excludes `hashed_password`.

### 3. JWT Authentication & Password Hashing (`app/auth.py`)
- Storing passwords securely with `bcrypt` (one-way hashing + salt).
- Generating JSON Web Tokens (JWT) containing the user's ID, email, and role.
- Protecting endpoints using FastAPI dependency injection:
  ```python
  @router.post("/courses")
  def create_course(..., current_user: models.User = Depends(require_instructor)):
      # Only runs if token is valid AND user.role == "instructor"
  ```

### 4. React Architecture & State Management
- **Central API Client (`src/api.js`)**: Automatically attaches `Authorization: Bearer <token>` to requests when logged in.
- **Context API (`src/context/AuthContext.jsx`)**: Persists authentication state across all React components, storing the token in `localStorage`.
- **Protected Routing (`src/components/ProtectedRoute.jsx`)**: Guards private pages and redirects unauthenticated users to `/login`.

---

## 🔌 API Endpoints Reference

Once the backend is running, open **Swagger Interactive Docs** at:  
👉 [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new student or instructor |
| `POST` | `/api/auth/login` | Public | Authenticate user, return JWT |
| `GET` | `/api/auth/me` | Authenticated | Get current user's profile |
| `GET` | `/api/courses` | Public | List courses (supports `?search=`, `?category=`, `?level=`) |
| `GET` | `/api/courses/{id}` | Public | Get single course detail |
| `POST` | `/api/courses` | Instructor Only | Publish a new course |
| `PUT` | `/api/courses/{id}` | Instructor (Owner) | Edit existing course |
| `DELETE` | `/api/courses/{id}` | Instructor (Owner) | Delete a course |
| `POST` | `/api/courses/{id}/enroll` | Authenticated | Enroll in a course |
| `DELETE` | `/api/courses/{id}/enroll` | Authenticated | Unenroll from a course |
| `GET` | `/api/courses/my/enrollments` | Authenticated | Get student's enrolled courses |
| `GET` | `/api/health` | Public | Service healthcheck |

---

## 📝 Practice Exercises for Students

1. **Add Course Ratings & Reviews**:
   - Create a `Review` model with `rating` (1-5 stars) and `comment`.
   - Add a POST endpoint `/api/courses/{id}/reviews`.
   - Display student star ratings on the course card in React.

2. **Add Profile Editing**:
   - Create a PUT endpoint `/api/auth/me` to update full name or change password.
   - Build a `ProfilePage.jsx` component in React.

3. **Course Completion Feature**:
   - Add a button in "My Learning" to toggle enrollment status between `active` and `completed`.
   - Display a certificate badge when completed!
