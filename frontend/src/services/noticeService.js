/**
 * services/noticeService.js
 * ─────────────────────────────────────────────────────────────
 * Handles all notice board API calls:
 *   getAll, getOne, create, update, delete, pin, markNew
 *
 * Usage:
 *   import noticeService from "../services/noticeService";
 *   const notices = await noticeService.getAll();
 */

const BASE_URL = process.env.REACT_APP_API_URL || "";

// ─── Helper: get token ───
function getToken() {
  return localStorage.getItem("ev_token") || sessionStorage.getItem("ev_token");
}

// ─── Helper: auth headers ───
function authHeaders() {
  const h = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

// ─── Helper: unified request ───
async function request(method, path, body = null) {
  const options = {
    method,
    headers: authHeaders(),
  };

  if (body) options.body = JSON.stringify(body);

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

// ─── Notice Service ───
const noticeService = {

  // ───────────────────────────────────────────
  // READ
  // ───────────────────────────────────────────

  /**
   * Get all notices (sorted newest first by default)
   * @param {Object} params - { priority, pinned, page, limit, search }
   * Returns: notice[] or { notices: [], total, page }
   */
  getAll: async (params = {}) => {
    const defaults = { page: 1, limit: 20, sort: "newest" };
    return await request("GET", `/notices${buildQuery({ ...defaults, ...params })}`);
  },

  /**
   * Get a single notice by ID
   * Returns: full notice object
   */
  getOne: async (id) => {
    return await request("GET", `/notices/${id}`);
  },

  /**
   * Get only pinned notices
   * Returns: notice[]
   */
  getPinned: async () => {
    return await request("GET", "/notices/pinned");
  },

  /**
   * Get notices created in the last N hours (for NEW badge logic)
   * @param {number} hours - default 24
   * Returns: notice[]
   */
  getRecent: async (hours = 24) => {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    return await request("GET", `/notices${buildQuery({ since, sort: "newest" })}`);
  },

  /**
   * Search notices by keyword
   * @param {string} query
   */
  search: async (query) => {
    return await request("GET", `/notices/search${buildQuery({ q: query })}`);
  },

  /**
   * Get notices filtered by priority
   * @param {"normal"|"important"|"urgent"} priority
   */
  getByPriority: async (priority) => {
    return await request("GET", `/notices${buildQuery({ priority })}`);
  },

  // ───────────────────────────────────────────
  // CREATE
  // ───────────────────────────────────────────

  /**
   * Create a new notice (Admin / Faculty only)
   * @param {Object} payload
   *   - title: string (required)
   *   - content: string (required)
   *   - priority: "normal" | "important" | "urgent"
   *   - pinned: boolean
   *   - expiresAt: ISO date string (optional auto-expire)
   *   - attachmentUrl: string (optional)
   * Returns: created notice object
   */
  create: async ({ title, content, priority = "normal", pinned = false, expiresAt = null, attachmentUrl = null }) => {
    const payload = { title, content, priority, pinned };
    if (expiresAt)     payload.expiresAt     = expiresAt;
    if (attachmentUrl) payload.attachmentUrl = attachmentUrl;

    return await request("POST", "/notices", payload);
  },

  // ───────────────────────────────────────────
  // UPDATE
  // ───────────────────────────────────────────

  /**
   * Update an existing notice (Admin / original Faculty author)
   * @param {string} id
   * @param {Object} updates - any fields to update
   */
  update: async (id, updates) => {
    return await request("PUT", `/notices/${id}`, updates);
  },

  /**
   * Pin or unpin a notice (Admin only)
   * @param {string} id
   * @param {boolean} pinned
   */
  setPin: async (id, pinned) => {
    return await request("PATCH", `/notices/${id}/pin`, { pinned });
  },

  /**
   * Update notice priority (Admin only)
   * @param {string} id
   * @param {"normal"|"important"|"urgent"} priority
   */
  setPriority: async (id, priority) => {
    return await request("PATCH", `/notices/${id}/priority`, { priority });
  },

  /**
   * Mark a notice as read by current user
   * (Tracks per-user read state for unread badges)
   */
  markRead: async (id) => {
    try {
      return await request("PATCH", `/notices/${id}/read`);
    } catch {
      // Non-critical, fail silently
    }
  },

  // ───────────────────────────────────────────
  // DELETE
  // ───────────────────────────────────────────

  /**
   * Delete a notice (Admin only or author)
   * @param {string} id
   */
  delete: async (id) => {
    return await request("DELETE", `/notices/${id}`);
  },

  /**
   * Bulk delete notices (Admin only)
   * @param {string[]} ids
   */
  bulkDelete: async (ids) => {
    return await request("DELETE", "/notices/bulk", { ids });
  },

  /**
   * Delete all expired notices (Admin only)
   */
  deleteExpired: async () => {
    return await request("DELETE", "/notices/expired");
  },

  // ───────────────────────────────────────────
  // CLIENT-SIDE UTILS
  // ───────────────────────────────────────────

  /**
   * Check if a notice is "new" (within last 24 hours) — client-side
   * @param {string} createdAt - ISO date string
   * @returns {boolean}
   */
  isNew: (createdAt) => {
    if (!createdAt) return false;
    const age = Date.now() - new Date(createdAt).getTime();
    return age < 24 * 60 * 60 * 1000; // 24 hours in ms
  },

  /**
   * Sort notices: pinned first, then by date
   * @param {Array} notices
   * @returns {Array} sorted notices
   */
  sortNotices: (notices = []) => {
    return [...notices].sort((a, b) => {
      // Pinned first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // Then by urgency
      const PRIORITY_ORDER = { urgent: 0, important: 1, normal: 2 };
      const pa = PRIORITY_ORDER[a.priority] ?? 2;
      const pb = PRIORITY_ORDER[b.priority] ?? 2;
      if (pa !== pb) return pa - pb;
      // Then by newest
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  },

  /**
   * Filter notices by search term — client-side
   * @param {Array} notices
   * @param {string} query
   * @returns {Array}
   */
  filterBySearch: (notices = [], query = "") => {
    if (!query.trim()) return notices;
    const q = query.toLowerCase();
    return notices.filter(n =>
      n.title?.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q) ||
      n.author?.name?.toLowerCase().includes(q)
    );
  },

  /**
   * Get unread count — compares notice IDs to localStorage read list
   * @param {Array} notices
   * @returns {number}
   */
  getUnreadCount: (notices = []) => {
    try {
      const read = JSON.parse(localStorage.getItem("ev_read_notices") || "[]");
      return notices.filter(n => !read.includes(n._id) && noticeService.isNew(n.createdAt)).length;
    } catch {
      return 0;
    }
  },

  /**
   * Mark notice as read in localStorage (offline tracking)
   * @param {string} id
   */
  markReadLocal: (id) => {
    try {
      const read = JSON.parse(localStorage.getItem("ev_read_notices") || "[]");
      if (!read.includes(id)) {
        read.push(id);
        localStorage.setItem("ev_read_notices", JSON.stringify(read));
      }
    } catch {}
  },
};

export default noticeService;