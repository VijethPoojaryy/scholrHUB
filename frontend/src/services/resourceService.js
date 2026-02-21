/**
 * services/resourceService.js
 * ─────────────────────────────────────────────────────────────
 * Handles all resource (file upload/management) API calls:
 *   getAll, getOne, upload, approve, reject, delete,
 *   search, getRatings, submitRating, trackDownload
 *
 * Usage:
 *   import resourceService from "../services/resourceService";
 *   const resources = await resourceService.getAll({ status: "approved" });
 */

const BASE_URL = process.env.REACT_APP_API_URL || "";

// ─── Helper: get token ───
function getToken() {
  return localStorage.getItem("ev_token") || sessionStorage.getItem("ev_token");
}

// ─── Helper: auth headers ───
function authHeaders(isFormData = false) {
  const h = {};
  const token = getToken();
  if (token) h["Authorization"] = `Bearer ${token}`;
  if (!isFormData) h["Content-Type"] = "application/json";
  return h;
}

// ─── Helper: unified request ───
async function request(method, path, body = null, isFormData = false) {
  const options = {
    method,
    headers: authHeaders(isFormData),
  };

  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}/api${path}`, options);

  if (res.status === 204) return { success: true };

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }

  return data;
}

// ─── Helper: build query string ───
function buildQuery(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  const q = new URLSearchParams(clean).toString();
  return q ? `?${q}` : "";
}

// ─── Resource Service ───
const resourceService = {

  // ───────────────────────────────────────────
  // READ
  // ───────────────────────────────────────────

  /**
   * Get all resources with optional filters
   * @param {Object} params - { status, category, fileType, sort, page, limit, search, dateFrom, dateTo }
   * Returns: { resources: [], total, page, totalPages }
   */
  getAll: async (params = {}) => {
    const defaults = { status: "approved", page: 1, limit: 12, sort: "newest" };
    return await request("GET", `/resources${buildQuery({ ...defaults, ...params })}`);
  },

  /**
   * Get a single resource by ID
   * Returns: full resource object with uploader details
   */
  getOne: async (id) => {
    return await request("GET", `/resources/${id}`);
  },

  /**
   * Get pending resources (Admin only)
   * Returns: array of pending resources
   */
  getPending: async () => {
    return await request("GET", "/resources/pending");
  },

  /**
   * Get resources uploaded by the current user
   */
  getMyUploads: async ({ page = 1, limit = 10 } = {}) => {
    return await request("GET", `/resources/my-uploads${buildQuery({ page, limit })}`);
  },

  /**
   * Search resources by keyword
   * @param {string} query - search term
   * @param {Object} filters - additional filters
   */
  search: async (query, filters = {}) => {
    return await request("GET", `/resources/search${buildQuery({ q: query, ...filters })}`);
  },

  /**
   * Get resources by category
   */
  getByCategory: async (category, params = {}) => {
    return await request("GET", `/resources${buildQuery({ category, ...params })}`);
  },

  // ───────────────────────────────────────────
  // CREATE
  // ───────────────────────────────────────────

  /**
   * Upload a new resource (Faculty / Admin only)
   * @param {FormData} formData - must include: file, title, category
   *   formData.append("file", fileObject);
   *   formData.append("title", "My Resource");
   *   formData.append("category", "Lecture Notes");
   *   formData.append("description", "Optional description");
   * Returns: newly created resource object
   */
  upload: async (formData) => {
    return await request("POST", "/resources", formData, true);
  },

  /**
   * Upload via URL (link, not file)
   */
  uploadByUrl: async ({ title, url, category, description }) => {
    return await request("POST", "/resources/url", { title, url, category, description });
  },

  // ───────────────────────────────────────────
  // UPDATE
  // ───────────────────────────────────────────

  /**
   * Update resource metadata (owner or admin)
   */
  update: async (id, updates) => {
    return await request("PUT", `/resources/${id}`, updates);
  },

  /**
   * Approve a pending resource (Admin only)
   * Returns: updated resource
   */
  approve: async (id) => {
    return await request("PATCH", `/resources/${id}/approve`);
  },

  /**
   * Reject a pending resource (Admin only)
   * @param {string} id
   * @param {string} reason - optional rejection reason
   */
  reject: async (id, reason = "") => {
    return await request("PATCH", `/resources/${id}/reject`, { reason });
  },

  /**
   * Bulk approve multiple resources (Admin only)
   * @param {string[]} ids - array of resource IDs
   */
  bulkApprove: async (ids) => {
    return await request("PATCH", "/resources/bulk-approve", { ids });
  },

  /**
   * Bulk reject multiple resources (Admin only)
   */
  bulkReject: async (ids, reason = "") => {
    return await request("PATCH", "/resources/bulk-reject", { ids, reason });
  },

  // ───────────────────────────────────────────
  // DELETE
  // ───────────────────────────────────────────

  /**
   * Delete a resource (owner or admin)
   */
  delete: async (id) => {
    return await request("DELETE", `/resources/${id}`);
  },

  /**
   * Bulk delete (Admin only)
   */
  bulkDelete: async (ids) => {
    return await request("DELETE", "/resources/bulk", { ids });
  },

  // ───────────────────────────────────────────
  // RATINGS
  // ───────────────────────────────────────────

  /**
   * Get ratings for a resource
   * Returns: { ratings: [], average, count }
   */
  getRatings: async (resourceId) => {
    return await request("GET", `/resources/${resourceId}/ratings`);
  },

  /**
   * Submit a rating and review
   * @param {string} resourceId
   * @param {Object} payload - { value: 1-5, review: "optional text" }
   */
  submitRating: async (resourceId, { value, review = "" }) => {
    return await request("POST", `/resources/${resourceId}/ratings`, { value, review });
  },

  /**
   * Update existing rating
   */
  updateRating: async (resourceId, ratingId, { value, review }) => {
    return await request("PUT", `/resources/${resourceId}/ratings/${ratingId}`, { value, review });
  },

  /**
   * Delete a rating
   */
  deleteRating: async (resourceId, ratingId) => {
    return await request("DELETE", `/resources/${resourceId}/ratings/${ratingId}`);
  },

  // ───────────────────────────────────────────
  // ANALYTICS
  // ───────────────────────────────────────────

  /**
   * Track a download event
   */
  trackDownload: async (id) => {
    try {
      await request("POST", `/resources/${id}/download`);
    } catch {
      // Non-critical — fail silently
    }
  },

  /**
   * Get resource analytics (Admin only)
   * Returns: { totalResources, totalDownloads, topCategories, recentUploads }
   */
  getAnalytics: async () => {
    return await request("GET", "/resources/analytics");
  },

  /**
   * Get top downloaded resources
   */
  getTopResources: async (limit = 5) => {
    return await request("GET", `/resources/top${buildQuery({ limit })}`);
  },

  // ───────────────────────────────────────────
  // CATEGORIES
  // ───────────────────────────────────────────

  /**
   * Get all unique categories in use
   * Returns: string[]
   */
  getCategories: async () => {
    return await request("GET", "/resources/categories");
  },
};

export default resourceService;