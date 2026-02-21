/**
 * services/authService.js
 * ─────────────────────────────────────────────────────────────
 * Handles all authentication-related API calls:
 *   login, register, logout, getMe, updateProfile, changePassword
 *
 * Usage:
 *   import authService from "../services/authService";
 *   const data = await authService.login({ email, password });
 */

const BASE_URL = process.env.REACT_APP_API_URL || "";

// ─── Helper: get stored token ───
function getToken() {
  return localStorage.getItem("ev_token") || sessionStorage.getItem("ev_token");
}

// ─── Helper: build headers ───
function headers(isFormData = false) {
  const h = {};
  const token = getToken();
  if (token) h["Authorization"] = `Bearer ${token}`;
  if (!isFormData) h["Content-Type"] = "application/json";
  return h;
}

// ─── Helper: unified fetch wrapper ───
async function request(method, path, body = null, isFormData = false) {
  const options = {
    method,
    headers: headers(isFormData),
  };

  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}/api${path}`, options);

  // Handle empty responses (204 No Content)
  if (res.status === 204) return { success: true };

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

// ─── Auth Service Object ───
const authService = {
  /**
   * Login with email & password
   * Returns: { token, user: { _id, name, email, role } }
   */
  login: async ({ email, password }) => {
    const data = await request("POST", "/auth/login", { email, password });

    // Store token
    if (data.token) {
      localStorage.setItem("ev_token", data.token);
      localStorage.setItem("ev_user", JSON.stringify(data.user));
    }

    return data;
  },

  /**
   * Register new user
   * Returns: { token, user }
   */
  register: async ({ name, email, password, role = "student" }) => {
    const data = await request("POST", "/auth/register", { name, email, password, role });

    if (data.token) {
      localStorage.setItem("ev_token", data.token);
      localStorage.setItem("ev_user", JSON.stringify(data.user));
    }

    return data;
  },

  /**
   * Get current authenticated user profile
   * Returns: { _id, name, email, role, createdAt }
   */
  getMe: async () => {
    return await request("GET", "/auth/me");
  },

  /**
   * Update profile (name, email, avatar)
   */
  updateProfile: async (updates) => {
    const data = await request("PUT", "/auth/profile", updates);

    // Update cached user in localStorage
    if (data.user) {
      localStorage.setItem("ev_user", JSON.stringify(data.user));
    }

    return data;
  },

  /**
   * Change password
   */
  changePassword: async ({ currentPassword, newPassword }) => {
    return await request("PUT", "/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Forgot password — sends reset email
   */
  forgotPassword: async (email) => {
    return await request("POST", "/auth/forgot-password", { email });
  },

  /**
   * Reset password with token from email
   */
  resetPassword: async ({ token, newPassword }) => {
    return await request("POST", "/auth/reset-password", { token, newPassword });
  },

  /**
   * Logout — clears all stored auth data
   */
  logout: () => {
    localStorage.removeItem("ev_token");
    localStorage.removeItem("ev_user");
    sessionStorage.removeItem("ev_token");
    sessionStorage.removeItem("ev_user");
  },

  /**
   * Check if user is currently logged in
   * Returns: boolean
   */
  isLoggedIn: () => {
    const token = getToken();
    if (!token) return false;

    // Basic JWT expiry check (decode payload)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        authService.logout(); // Auto-logout on expiry
        return false;
      }
      return true;
    } catch {
      return !!token; // If decode fails, assume valid
    }
  },

  /**
   * Get stored user from localStorage (no API call)
   * Returns: user object or null
   */
  getStoredUser: () => {
    try {
      const stored = localStorage.getItem("ev_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get stored token
   */
  getToken,

  /**
   * Get auth headers (useful for manual fetch calls)
   */
  getHeaders: () => headers(),

  /**
   * Verify token is still valid with backend
   * Returns: { valid: boolean, user }
   */
  verifyToken: async () => {
    try {
      const data = await request("GET", "/auth/verify");
      return { valid: true, user: data.user };
    } catch {
      authService.logout();
      return { valid: false, user: null };
    }
  },

  /**A
   * Get all users (Admin only)
   */
  getAllUsers: async ({ role, page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (role) params.append("role", role);
    return await request("GET", `/auth/users?${params}`);
  },

  /**
   * Update user role (Admin only)
   */
  updateUserRole: async (userId, role) => {
    return await request("PATCH", `/auth/users/${userId}/role`, { role });
  },

  /**
   * Delete a user (Admin only)
   */
  deleteUser: async (userId) => {
    return await request("DELETE", `/auth/users/${userId}`);
  },
};

export default authService;