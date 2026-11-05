import React from "react";
import { Link } from "react-router-dom";
import { Clock, User, Users, CheckCircle, ArrowRight } from "lucide-react";

export const CourseCard = ({ course, onEnroll, isEnrolling, currentUserId }) => {
  const isOwner = currentUserId && course.instructor_id === currentUserId;

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "badge-green";
      case "intermediate":
        return "badge-blue";
      case "advanced":
        return "badge-purple";
      default:
        return "badge-gray";
    }
  };

  return (
    <div className="course-card">
      <div className="card-header">
        <span className="badge-category">{course.category}</span>
        <span className={`badge-level ${getLevelColor(course.level)}`}>
          {course.level}
        </span>
      </div>

      <h3 className="card-title">
        <Link to={`/courses/${course.id}`}>{course.title}</Link>
      </h3>

      <p className="card-description">
        {course.description.length > 120
          ? `${course.description.slice(0, 120)}...`
          : course.description}
      </p>

      <div className="card-meta">
        <div className="meta-item">
          <Clock size={15} />
          <span>{course.duration_hours} hrs</span>
        </div>
        <div className="meta-item">
          <Users size={15} />
          <span>{course.enrolled_count || 0} students</span>
        </div>
        <div className="meta-item">
          <User size={15} />
          <span>{course.instructor?.full_name || "Instructor"}</span>
        </div>
      </div>

      <div className="card-footer">
        <div className="price-tag">
          {course.price === 0 ? "FREE" : `₹${course.price}`}
        </div>

        <div className="card-actions">
          {course.is_enrolled ? (
            <span className="badge-enrolled">
              <CheckCircle size={15} /> Enrolled
            </span>
          ) : (
            onEnroll && (
              <button
                className="btn btn-sm btn-primary"
                onClick={() => onEnroll(course.id)}
                disabled={isEnrolling}
              >
                Enroll Now
              </button>
            )
          )}

          <Link to={`/courses/${course.id}`} className="btn btn-sm btn-outline">
            Details <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};
