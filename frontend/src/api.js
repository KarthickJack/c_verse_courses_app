/**
 * Central API Client for C-Verse Courses Portal
 * Handles requests to the FastAPI backend and manages JWT Authorization header.
 */

const API_BASE_URL = "http://localhost:8000/api";

export const getToken = () => localStorage.getItem("cverse_token");
export const setToken = (token) => localStorage.setItem("cverse_token", token);
export const removeToken = () => localStorage.removeItem("cverse_token");

/**
 * Generic fetch wrapper that attaches Authorization header if token exists.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || (typeof data === "string" ? data : "An error occurred");
    throw new Error(errorMsg);
  }

  return data;
}

// ================= AUTH API =================
export const authApi = {
  login: async (email, password) => {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (full_name, email, password, role = "student") => {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name, email, password, role }),
    });
  },

  getMe: async () => {
    return request("/auth/me", {
      method: "GET",
    });
  },
};

// ================= COURSES API =================
export const coursesApi = {
  getAll: async ({ search = "", category = "", level = "" } = {}) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category && category !== "All") params.append("category", category);
    if (level && level !== "All") params.append("level", level);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return request(`/courses${queryString}`);
  },

  getById: async (id) => {
    return request(`/courses/${id}`);
  },

  create: async (courseData) => {
    return request("/courses", {
      method: "POST",
      body: JSON.stringify(courseData),
    });
  },

  update: async (id, courseData) => {
    return request(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(courseData),
    });
  },

  delete: async (id) => {
    return request(`/courses/${id}`, {
      method: "DELETE",
    });
  },

  enroll: async (courseId) => {
    return request(`/courses/${courseId}/enroll`, {
      method: "POST",
    });
  },

  unenroll: async (courseId) => {
    return request(`/courses/${courseId}/enroll`, {
      method: "DELETE",
    });
  },

  getMyEnrollments: async () => {
    return request("/courses/my/enrollments");
  },
};
