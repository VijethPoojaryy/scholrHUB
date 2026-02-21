/**
 * utils/roleHelper.js
 * ─────────────────────────────────────────────────────────────
 * Pure utility functions for role-based access control (RBAC).
 * No React dependencies — can be used anywhere in the app.
 *
 * Roles: "admin" | "faculty" | "student"
 *
 * Usage:
 *   import { hasRole, canUpload, getRoleInfo } from "../utils/roleHelper";
 *   if (canUpload(user)) { ... }
 */

// ─── Role Hierarchy ───
// Higher number = more permissions
export const ROLE_LEVELS = {
  student: 1,
  faculty: 2,
  admin:   3,
};

// ─── Role Metadata ───
export const ROLE_INFO = {
  admin: {
    label:       "Administrator",
    shortLabel:  "Admin",
    icon:        "🛡️",
    color:       "#c0392b",
    bgColor:     "#fde8e6",
    badgeClass:  "badge-red",
    description: "Full system access — manage users, approve resources, post notices",
    permissions: [
      "upload", "approve", "reject", "delete_any", "post_notice",
      "view_analytics", "manage_users", "bulk_actions", "view_pending",
    ],
  },
  faculty: {
    label:       "Faculty",
    shortLabel:  "Faculty",
    icon:        "🎓",
    color:       "#d4832a",
    bgColor:     "#fdf0dc",
    badgeClass:  "badge-amber",
    description: "Upload resources and post notices for students",
    permissions: [
      "upload", "post_notice", "delete_own",
    ],
  },
  student: {
    label:       "Student",
    shortLabel:  "Student",
    icon:        "📚",
    color:       "#1e6fa3",
    bgColor:     "#e0f0fb",
    badgeClass:  "badge-blue",
    description: "Browse, download, and rate resources",
    permissions: [
      "download", "rate", "view_notices",
    ],
  },
};

// ─── Core Role Checks ───

/**
 * Get role info object for a given role
 * @param {string} role
 * @returns {Object} ROLE_INFO entry
 */
export function getRoleInfo(role) {
  return ROLE_INFO[role] || ROLE_INFO.student;
}

/**
 * Check if a user has an exact role
 * @param {Object} user - user object with .role property
 * @param {string} role - role to check
 * @returns {boolean}
 */
export function hasRole(user, role) {
  if (!user) return false;
  return user.role === role;
}

/**
 * Check if user has at least a minimum role level
 * admin >= faculty >= student
 * @param {Object} user
 * @param {string} minRole - minimum required role
 * @returns {boolean}
 */
export function hasMinRole(user, minRole) {
  if (!user) return false;
  const userLevel = ROLE_LEVELS[user.role] || 0;
  const minLevel  = ROLE_LEVELS[minRole]   || 0;
  return userLevel >= minLevel;
}

/**
 * Check if user has one of the specified roles
 * @param {Object} user
 * @param {string[]} roles - array of allowed roles
 * @returns {boolean}
 */
export function hasAnyRole(user, roles = []) {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Check if user has a specific permission
 * @param {Object} user
 * @param {string} permission - permission key (see ROLE_INFO)
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user) return false;
  const info = ROLE_INFO[user.role];
  if (!info) return false;
  return info.permissions.includes(permission);
}

// ─── Convenience Shorthand Checks ───

/** Is the user an admin? */
export const isAdmin   = (user) => hasRole(user, "admin");

/** Is the user faculty or admin? */
export const isFaculty = (user) => hasAnyRole(user, ["faculty", "admin"]);

/** Is the user a student? */
export const isStudent = (user) => hasRole(user, "student");

/** Is the user logged in? */
export const isLoggedIn = (user) => !!user;

// ─── Permission Checks ───

/** Can this user upload resources? */
export const canUpload      = (user) => hasPermission(user, "upload");

/** Can this user approve/reject resources? */
export const canApprove     = (user) => hasPermission(user, "approve");

/** Can this user post notices? */
export const canPostNotice  = (user) => hasPermission(user, "post_notice");

/** Can this user view analytics? */
export const canViewAnalytics = (user) => hasPermission(user, "view_analytics");

/** Can this user manage users? */
export const canManageUsers = (user) => hasPermission(user, "manage_users");

/** Can this user delete any resource (not just their own)? */
export const canDeleteAny   = (user) => hasPermission(user, "delete_any");

/** Can this user delete a specific resource? */
export const canDelete = (user, resource) => {
  if (!user || !resource) return false;
  if (hasPermission(user, "delete_any")) return true;
  // Owner can delete their own
  const ownerId = resource.uploader?._id || resource.uploadedBy || resource.userId;
  return ownerId?.toString() === user._id?.toString();
};

/** Can this user rate a resource? */
export const canRate = (user) => hasPermission(user, "rate") || isFaculty(user);

/** Can this user download a resource? */
export const canDownload = (user) => !!user; // Any logged-in user

/** Can this user see pending resources? */
export const canViewPending = (user) => hasPermission(user, "view_pending");

/** Can this user perform bulk actions? */
export const canBulkAction = (user) => hasPermission(user, "bulk_actions");

// ─── UI Helper ───

/**
 * Get CSS class for a role badge
 * @param {string} role
 * @returns {string} badge class name
 */
export function getRoleBadgeClass(role) {
  return ROLE_INFO[role]?.badgeClass || "badge-blue";
}

/**
 * Get display label for a role
 * @param {string} role
 * @returns {string}
 */
export function getRoleLabel(role) {
  return ROLE_INFO[role]?.label || "Student";
}

/**
 * Get role icon emoji
 * @param {string} role
 * @returns {string}
 */
export function getRoleIcon(role) {
  return ROLE_INFO[role]?.icon || "👤";
}

/**
 * Get all role options for a select dropdown
 * @param {boolean} includeAdmin - include admin option?
 * @returns {{ value, label, icon }[]}
 */
export function getRoleOptions(includeAdmin = false) {
  const options = [
    { value: "student", label: "Student",  icon: "📚" },
    { value: "faculty", label: "Faculty",  icon: "🎓" },
  ];
  if (includeAdmin) options.push({ value: "admin", label: "Admin", icon: "🛡️" });
  return options;
}

/**
 * Get sidebar menu visibility per role
 * @param {string} role
 * @returns {string[]} array of visible page keys
 */
export function getVisiblePages(role) {
  const common    = ["dashboard", "resources", "notices", "leaderboard"];
  const adminOnly = ["admin", "analytics"];
  const canUpload = ["upload"];

  switch (role) {
    case "admin":
      return [...common, ...canUpload, ...adminOnly];
    case "faculty":
      return [...common, ...canUpload];
    case "student":
    default:
      return common;
  }
}

/**
 * Redirect path after login based on role
 * @param {string} role
 * @returns {string} page key
 */
export function getDefaultPage(role) {
  switch (role) {
    case "admin":   return "admin";
    case "faculty": return "dashboard";
    case "student": return "dashboard";
    default:        return "dashboard";
  }
}

// ─── Default export for convenience ───
const roleHelper = {
  ROLE_INFO, ROLE_LEVELS,
  getRoleInfo, hasRole, hasMinRole, hasAnyRole, hasPermission,
  isAdmin, isFaculty, isStudent, isLoggedIn,
  canUpload, canApprove, canPostNotice, canViewAnalytics,
  canManageUsers, canDeleteAny, canDelete, canRate, canDownload,
  canViewPending, canBulkAction,
  getRoleBadgeClass, getRoleLabel, getRoleIcon,
  getRoleOptions, getVisiblePages, getDefaultPage,
};

export default roleHelper;