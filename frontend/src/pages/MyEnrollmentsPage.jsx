import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { coursesApi } from "../api";
import { GraduationCap, Clock, ArrowRight, BookOpen, AlertCircle } from "lucide-react";

export const MyEnrollmentsPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await coursesApi.getMyEnrollments();
      setEnrollments(data);
    } catch (err) {
      setError(err.message || "Could not fetch your enrolled courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex-align-center gap-2">
          <GraduationCap size={28} className="text-primary" />
          <h2>My Enrolled Courses</h2>
        </div>
        <p className="page-header-sub">
          Track and continue the courses you are currently learning at C-Verse.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your learning dashboard...</p>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} className="empty-icon" />
          <h3>No enrolled courses yet</h3>
          <p>Explore our curriculum and enroll in your first course to begin learning!</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="enrollments-grid">
          {enrollments.map(({ id, course, enrolled_at, status }) => (
            <div key={id} className="enrollment-card-item">
              <div className="enrollment-header">
                <span className="badge-category">{course.category}</span>
                <span className="status-badge-active">{status.toUpperCase()}</span>
              </div>

              <h3>{course.title}</h3>
              <p className="enrollment-desc">{course.description.slice(0, 100)}...</p>

              <div className="enrollment-meta">
                <div className="meta-item">
                  <Clock size={15} /> <span>{course.duration_hours} hrs</span>
                </div>
                <div className="meta-item">
                  <span>Enrolled: {new Date(enrolled_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="enrollment-actions">
                <Link to={`/courses/${course.id}`} className="btn btn-primary btn-block">
                  Go to Course <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
