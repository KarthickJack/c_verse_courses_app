import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen, LogOut, PlusCircle, User, GraduationCap, Code } from "lucide-react";

export const Navbar = () => {
  const { user, isAuthenticated, isInstructor, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <div className="logo-badge">
            <Code size={22} color="#ffffff" />
          </div>
          <span className="logo-text">C-Verse <span className="logo-sub">Courses</span></span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            <BookOpen size={17} />
            <span>Courses</span>
          </Link>

          {isAuthenticated && (
            <Link
              to="/my-learning"
              className={`nav-link ${isActive("/my-learning") ? "active" : ""}`}
            >
              <GraduationCap size={18} />
              <span>My Learning</span>
            </Link>
          )}

          {isInstructor && (
            <Link
              to="/create-course"
              className={`nav-link btn-nav-create ${isActive("/create-course") ? "active" : ""}`}
            >
              <PlusCircle size={17} />
              <span>Add Course</span>
            </Link>
          )}
        </div>

        <div className="nav-auth">
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <div className="user-info">
                <span className="user-name">{user.full_name}</span>
                <span className={`role-pill ${user.role}`}>
                  {user.role === "instructor" ? "Instructor" : "Student"}
                </span>
              </div>
              <button onClick={handleLogout} className="btn-logout" title="Sign Out">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="guest-actions">
              <Link to="/login" className="btn btn-outline">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
