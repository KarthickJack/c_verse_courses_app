import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { CoursesPage } from "./pages/CoursesPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MyEnrollmentsPage } from "./pages/MyEnrollmentsPage";
import { CreateCoursePage } from "./pages/CreateCoursePage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Student Routes */}
              <Route
                path="/my-learning"
                element={
                  <ProtectedRoute>
                    <MyEnrollmentsPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Instructor Routes */}
              <Route
                path="/create-course"
                element={
                  <ProtectedRoute requireInstructor={true}>
                    <CreateCoursePage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="footer">
            <div className="footer-content">
              <p>© {new Date().getFullYear()} C-Verse Coding Institute. Built with FastAPI, PostgreSQL & React.</p>
              <div className="footer-links">
                <a href="http://localhost:8000/api/docs" target="_blank" rel="noreferrer">
                  FastAPI Swagger Docs
                </a>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
