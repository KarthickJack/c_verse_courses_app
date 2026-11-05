import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { coursesApi } from "../api";
import { ArrowLeft, PlusCircle } from "lucide-react";

export const CreateCoursePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Full Stack",
    level: "Beginner",
    duration_hours: 30,
    price: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const newCourse = await coursesApi.create(formData);
      navigate(`/courses/${newCourse.id}`);
    } catch (err) {
      setError(err.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container page-container-narrow">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to Courses
      </Link>

      <div className="form-card">
        <div className="form-header">
          <div className="icon-circle">
            <PlusCircle size={24} color="#3b82f6" />
          </div>
          <h2>Create New Course</h2>
          <p>Add a new programming course to the C-Verse curriculum catalog.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="standard-form">
          <div className="form-group">
            <label>Course Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Master React & Redux Toolkit"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Python">Python</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="Full Stack">Full Stack</option>
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty Level *</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration (Hours) *</label>
              <input
                type="number"
                min="1"
                max="500"
                required
                value={formData.duration_hours}
                onChange={(e) =>
                  setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div className="form-group">
              <label>Price (₹ / 0 for Free) *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Course Description *</label>
            <textarea
              rows="5"
              required
              placeholder="Outline what students will learn, prerequisites, and key projects..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div className="form-actions">
            <Link to="/" className="btn btn-outline">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Publishing Course..." : "Publish Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
