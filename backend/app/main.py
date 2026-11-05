"""
Main entry point for C-Verse Courses Portal FastAPI application.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import auth_router, courses_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager: runs on app startup and shutdown.
    Creates tables in PostgreSQL automatically on startup.
    """
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
    yield
    print("Shutting down application...")


# FastAPI application instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack educational course portal built with FastAPI, PostgreSQL, and React.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# CORS configuration - Allows React frontend running on local ports
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers under /api
app.include_router(auth_router.router, prefix="/api")
app.include_router(courses_router.router, prefix="/api")


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend service is running."""
    return {"status": "ok", "service": "C-Verse Courses API", "version": "1.0.0"}


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to C-Verse Courses API!",
        "documentation": "/api/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
