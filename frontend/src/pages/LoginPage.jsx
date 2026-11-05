import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, Sparkles } from "lucide-react";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.message || null);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to sign in. Check email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role) => {
    if (role === "instructor") {
      setEmail("instructor@cverse.com");
      setPassword("password123");
    } else {
      setEmail("student@cverse.com");
      setPassword("password123");
    }
  };

  return (
    <div className="page-container page-container-auth">
      <div className="auth-card">
        <div className="auth-header">
          <div className="icon-circle auth-icon">
            <LogIn size={26} color="#3b82f6" />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to your C-Verse Learning account</p>
        </div>

        {/* Classroom Quick Demo Buttons */}
        <div className="demo-credentials-banner">
          <div className="demo-title">
            <Sparkles size={14} /> Quick Classroom Demo Fill:
          </div>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn btn-xs btn-outline"
              onClick={() => handleDemoFill("instructor")}
            >
              Fill Instructor Demo
            </button>
            <button
              type="button"
              className="btn btn-xs btn-outline"
              onClick={() => handleDemoFill("student")}
            >
              Fill Student Demo
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. student@cverse.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one here</Link>
        </div>
      </div>
    </div>
  );
};
