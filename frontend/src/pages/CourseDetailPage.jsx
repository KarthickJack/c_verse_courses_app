import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { coursesApi } from "../api";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  Clock,
  User,
  Users,
  CheckCircle,
  Tag,
  BarChart,
  Trash2,
  Edit,
  AlertTriangle,
} from "lucide-react";

export const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isInstructor } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Edit modal / form state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    duration_hours: 20,
    price: 0,
  });

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coursesApi.getById(id);
      setCourse(data);
      setEditForm({
        title: data.title,
        description: data.description,
        category: data.category,
        level: data.level,
        duration_hours: data.duration_hours,
        price: data.price,
      });
    } catch (err) {
      setError(err.message || "Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { message: "Please log in to enroll" } });
      return;
    }
    try {
      setActionLoading(true);
      await coursesApi.enroll(course.id);
      setSuccessMsg("Congratulations! You are now enrolled in this course.");
      fetchCourse();
    } catch (err) {
      setError(err.message || "Failed to enroll");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!window.confirm("Are you sure you want to unenroll from this course?")) return;
    try {
      setActionLoading(true);
      await coursesApi.unenroll(course.id);
      setSuccessMsg("You have unenrolled from the course.");
      fetchCourse();
    } catch (err) {
      setError(err.message || "Failed to unenroll");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this course permanently?")) return;
    try {
      setActionLoading(true);
      await coursesApi.delete(course.id);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to delete course");
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await coursesApi.update(course.id, editForm);
      setSuccessMsg("Course updated successfully!");
      setIsEditing(false);
      fetchCourse();
    } catch (err) {
      setError(err.message || "Failed to update course");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "50vh" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!course && !loading) {
    return (
      <div className="page-container text-center">
        <h2>Course not found</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          Return to Courses
        </Link>
      </div>
    );
  }

  const isOwner = isInstructor && user?.id === course.instructor_id;

  return (
    <div className="page-container">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to Courses
      </Link>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="course-detail-layout">
        {/* Main Content Area */}
        <div className="course-main-content">
          <div className="detail-tags">
            <span className="badge-category">{course.category}</span>
            <span className="badge-level">{course.level}</span>
          </div>

          <h1 className="course-detail-title">{course.title}</h1>

          <div className="course-detail-meta-row">
            <div className="meta-badge">
              <User size={16} />
              <span>Instructor: <strong>{course.instructor?.full_name || "Lead Instructor"}</strong></span>
            </div>
            <div className="meta-badge">
              <Clock size={16} />
              <span>{course.duration_hours} hours total</span>
            </div>
            <div className="meta-badge">
              <Users size={16} />
              <span>{course.enrolled_count} students enrolled</span>
            </div>
          </div>

          <div className="course-section">
            <h3>About This Course</h3>
            <p className="course-full-description">{course.description}</p>
          </div>

          <div className="course-section syllabus-box">
            <h3>Curriculum Highlights</h3>
            <ul className="syllabus-list">
              <li>Comprehensive environment setup and fundamentals</li>
              <li>Hands-on coding labs and live problem solving</li>
              <li>Architecture patterns, state management, and API design</li>
              <li>Capstone project: Building and deploying production code</li>
            </ul>
          </div>

          {/* Instructor Controls */}
          {isOwner && (
            <div className="instructor-actions-box">
              <h4>Instructor Controls</h4>
              <p>You created this course. You can modify its details or remove it.</p>
              <div className="flex-gap">
                <button
                  className="btn btn-outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit size={16} /> {isEditing ? "Cancel Editing" : "Edit Course"}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={actionLoading}
                >
                  <Trash2 size={16} /> Delete Course
                </button>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleUpdate} className="edit-course-form">
              <h3>Edit Course Details</h3>
              <div className="form-group">
                <label>Course Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    <option value="Python">Python</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="Full Stack">Full Stack</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Level</label>
                  <select
                    value={editForm.level}
                    onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={editForm.duration_hours}
                    onChange={(e) =>
                      setEditForm({ ...editForm, duration_hours: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="4"
                  required
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}
        </div>

        {/* Sidebar Enrollment Card */}
        <div className="course-sidebar">
          <div className="enrollment-card">
            <div className="enrollment-price">
              {course.price === 0 ? "FREE" : `₹${course.price}`}
            </div>
            <p className="enrollment-notice">Full lifetime access & verified certificate</p>

            {course.is_enrolled ? (
              <div>
                <div className="enrolled-status-banner">
                  <CheckCircle size={20} color="#10b981" />
                  <span>You are enrolled in this course</span>
                </div>
                <button
                  className="btn btn-outline btn-block"
                  style={{ marginTop: "1rem" }}
                  onClick={handleUnenroll}
                  disabled={actionLoading}
                >
                  Unenroll Course
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-block btn-lg"
                onClick={handleEnroll}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Enroll Now"}
              </button>
            )}

            <div className="card-features-list">
              <div className="feature-item">
                <Clock size={16} /> <span>{course.duration_hours} Hours on-demand video</span>
              </div>
              <div className="feature-item">
                <BarChart size={16} /> <span>Skill Level: {course.level}</span>
              </div>
              <div className="feature-item">
                <Tag size={16} /> <span>Domain: {course.category}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
