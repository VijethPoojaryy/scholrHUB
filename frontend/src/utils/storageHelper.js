/**
 * utils/storageHelper.js
 * ─────────────────────────────────────────────────────────────
 * Unified, safe wrapper around localStorage and sessionStorage.
 * Handles JSON parse/stringify, expiry, and storage-full errors.
 * No React dependencies — pure utility.
 *
 * Usage:
 *   import storage from "../utils/storageHelper";
 *   storage.set("key", { data: 123 });
 *   const val = storage.get("key");
 *   storage.remove("key");
 */

// ─── Key Prefixes (avoids collisions) ───
const PREFIX = "ev_"; // EduVault prefix for all keys

// ─── Helpers ───
function prefixedKey(key) {
  return key.startsWith(PREFIX) ? key : `${PREFIX}${key}`;
}

function parseValue(raw) {
  if (raw === null || raw === undefined) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw; // Return raw string if not JSON
  }
}

function stringify(value) {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

// ─── Core localStorage wrapper ───
const local = {
  /**
   * Set a value in localStorage
   * @param {string} key
   * @param {*} value - any JSON-serializable value
   * @param {number} [ttlMs] - optional time-to-live in milliseconds
   */
  set: (key, value, ttlMs = null) => {
    try {
      const k = prefixedKey(key);
      const payload = ttlMs
        ? { __value: value, __expires: Date.now() + ttlMs }
        : value;
      localStorage.setItem(k, stringify(payload));
      return true;
    } catch (e) {
      // Storage quota exceeded or unavailable
      console.warn(`[storageHelper] Failed to set "${key}":`, e.message);
      return false;
    }
  },

  /**
   * Get a value from localStorage
   * @param {string} key
   * @param {*} [defaultValue] - fallback if not found or expired
   * @returns {*} stored value or defaultValue
   */
  get: (key, defaultValue = null) => {
    try {
      const k   = prefixedKey(key);
      const raw = localStorage.getItem(k);
      if (raw === null) return defaultValue;

      const parsed = parseValue(raw);

      // Handle TTL expiry
      if (parsed && typeof parsed === "object" && "__expires" in parsed) {
        if (Date.now() > parsed.__expires) {
          localStorage.removeItem(k);
          return defaultValue;
        }
        return parsed.__value;
      }

      return parsed ?? defaultValue;
    } catch {
      return defaultValue;
    }
  },

  /**
   * Remove a key from localStorage
   * @param {string} key
   */
  remove: (key) => {
    try {
      localStorage.removeItem(prefixedKey(key));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if a key exists and is not expired
   * @param {string} key
   * @returns {boolean}
   */
  has: (key) => local.get(key) !== null,

  /**
   * Update a stored object partially (merge)
   * @param {string} key
   * @param {Object} updates
   */
  merge: (key, updates) => {
    const existing = local.get(key, {});
    if (typeof existing !== "object" || Array.isArray(existing)) {
      return local.set(key, updates);
    }
    return local.set(key, { ...existing, ...updates });
  },

  /**
   * Get all keys with the EduVault prefix
   * @returns {string[]}
   */
  keys: () => {
    try {
      return Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .map(k => k.slice(PREFIX.length));
    } catch {
      return [];
    }
  },

  /**
   * Clear all EduVault keys from localStorage
   */
  clearAll: () => {
    try {
      const evKeys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
      evKeys.forEach(k => localStorage.removeItem(k));
      return true;
    } catch {
      return false;
    }
  },
};

// ─── Session storage wrapper (same API) ───
const session = {
  set: (key, value) => {
    try {
      sessionStorage.setItem(prefixedKey(key), stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const raw = sessionStorage.getItem(prefixedKey(key));
      return raw !== null ? (parseValue(raw) ?? defaultValue) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      sessionStorage.removeItem(prefixedKey(key));
      return true;
    } catch {
      return false;
    }
  },

  has: (key) => session.get(key) !== null,

  clearAll: () => {
    try {
      const evKeys = Object.keys(sessionStorage).filter(k => k.startsWith(PREFIX));
      evKeys.forEach(k => sessionStorage.removeItem(k));
      return true;
    } catch {
      return false;
    }
  },
};

// ─── Specific App Storage Keys ───
// Centralize all key names to avoid typos across the app

const KEYS = {
  TOKEN:        "token",
  USER:         "user",
  THEME:        "theme",
  READ_NOTICES: "read_notices",
  FILTERS:      "resource_filters",
  SIDEBAR:      "sidebar_collapsed",
  LAST_PAGE:    "last_page",
  SEARCH_HIST:  "search_history",
};

// ─── App-specific storage utilities ───
const appStorage = {
  // Auth
  getToken:     ()       => local.get(KEYS.TOKEN),
  setToken:     (token)  => local.set(KEYS.TOKEN, token),
  removeToken:  ()       => local.remove(KEYS.TOKEN),

  getUser:      ()       => local.get(KEYS.USER),
  setUser:      (user)   => local.set(KEYS.USER, user),
  removeUser:   ()       => local.remove(KEYS.USER),

  // Theme
  getTheme:     ()             => local.get(KEYS.THEME, "light"),
  setTheme:     (theme)        => local.set(KEYS.THEME, theme),

  // Notice read tracking
  getReadNotices: ()          => local.get(KEYS.READ_NOTICES, []),
  markNoticeRead: (id)        => {
    const read = local.get(KEYS.READ_NOTICES, []);
    if (!read.includes(id)) {
      local.set(KEYS.READ_NOTICES, [...read, id]);
    }
  },
  isNoticeRead:   (id)        => local.get(KEYS.READ_NOTICES, []).includes(id),
  clearReadNotices: ()        => local.remove(KEYS.READ_NOTICES),

  // Saved filters
  getFilters:   ()             => local.get(KEYS.FILTERS, {}),
  setFilters:   (filters)      => local.set(KEYS.FILTERS, filters),
  clearFilters: ()             => local.remove(KEYS.FILTERS),

  // Sidebar state
  getSidebarCollapsed: ()     => local.get(KEYS.SIDEBAR, false),
  setSidebarCollapsed: (val)  => local.set(KEYS.SIDEBAR, val),

  // Last visited page
  getLastPage:  ()             => local.get(KEYS.LAST_PAGE, "dashboard"),
  setLastPage:  (page)         => local.set(KEYS.LAST_PAGE, page),

  // Search history (last 10 searches)
  getSearchHistory: ()        => local.get(KEYS.SEARCH_HIST, []),
  addSearchTerm:    (term)    => {
    if (!term?.trim()) return;
    const history = local.get(KEYS.SEARCH_HIST, []);
    const updated = [term, ...history.filter(t => t !== term)].slice(0, 10);
    local.set(KEYS.SEARCH_HIST, updated);
  },
  clearSearchHistory: ()      => local.remove(KEYS.SEARCH_HIST),

  // Full logout cleanup
  clearAuthData: () => {
    local.remove(KEYS.TOKEN);
    local.remove(KEYS.USER);
    session.clearAll();
  },

  // Check if storage is available
  isAvailable: () => {
    try {
      const test = "__ev_test__";
      localStorage.setItem(test, "1");
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },
};

// ─── Default export ───
const storage = {
  local,
  session,
  app: appStorage,
  KEYS,
  PREFIX,
};

export default storage;

// Named exports for convenience
export { local, session, appStorage as app, KEYS };