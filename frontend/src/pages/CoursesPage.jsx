import React, { useState, useEffect } from "react";
import { coursesApi } from "../api";
import { CourseCard } from "../components/CourseCard";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Sparkles, BookOpen } from "lucide-react";

export const CoursesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [enrollingId, setEnrollingId] = useState(null);

  const categories = ["All", "Python", "Frontend", "Backend", "Database", "Full Stack"];
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coursesApi.getAll({ search, category, level });
      setCourses(data);
    } catch (err) {
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly or fetch on change
    const timer = setTimeout(() => {
      fetchCourses();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category, level]);

  const handleEnroll = async (courseId) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { message: "Please log in to enroll in courses" } });
      return;
    }

    try {
      setEnrollingId(courseId);
      await coursesApi.enroll(courseId);
      setSuccessMsg("Successfully enrolled in the course!");
      setTimeout(() => setSuccessMsg(null), 3500);

      // Refresh list to update badge and student count
      fetchCourses();
    } catch (err) {
      setError(err.message || "Could not enroll in course");
      setTimeout(() => setError(null), 4000);
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="page-container">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Welcome to C-Verse Coding Academy</span>
          </div>
          <h1 className="hero-title">
            Build Real-World Coding Skills with <span className="highlight">C-Verse</span>
          </h1>
          <p className="hero-subtitle">
            Hands-on courses in Python, React, FastAPI, PostgreSQL, and Full-Stack Engineering.
            Designed by industry experts to transform beginners into job-ready developers.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Search & Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search courses by title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        <div className="filters-group">
          <div className="filter-item">
            <label>Category:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select-filter"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Level:</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="select-filter"
            >
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading C-Verse courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} className="empty-icon" />
          <h3>No courses found</h3>
          <p>Try adjusting your search keywords or filter criteria.</p>
          {(search || category !== "All" || level !== "All") && (
            <button
              className="btn btn-outline"
              onClick={() => {
                setSearch("");
                setCategory("All");
                setLevel("All");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={handleEnroll}
              isEnrolling={enrollingId === course.id}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
