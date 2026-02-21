const router = require("express").Router();

const {
   getDashboardStats,
   getAllUsers,
   getPendingResources,
   approveResource,
   rejectResource,
   createUser,
   deleteUser,
   updateUser,
   getActivityStats,
   getUserActivityStats,
   getUserSubmissions
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

/* ======================
   DASHBOARD
====================== */

// Stats
router.get("/stats", authMiddleware, adminOnly, getDashboardStats);
router.get("/activity-stats", authMiddleware, getActivityStats); // Open to all roles for dashboard
router.get("/user-activity", authMiddleware, getUserActivityStats); // For 'My Progress' graph
router.get("/user-submissions", authMiddleware, getUserSubmissions); // For 'My Progress' table


/* ======================
   USER MANAGEMENT
====================== */

// Get all users
router.get("/users", authMiddleware, adminOnly, getAllUsers);

// 🔥 Create student / professor
router.post("/create-user", authMiddleware, adminOnly, createUser);

// (Optional) Delete user
router.delete("/users/:id", authMiddleware, adminOnly, deleteUser);

// (Optional) Update user
router.put("/users/:id", authMiddleware, adminOnly, updateUser);


/* ======================
   RESOURCE MANAGEMENT
====================== */

// Pending resources
router.get("/resources/pending", authMiddleware, adminOnly, getPendingResources);

// Approve
router.patch("/resources/:id/approve", authMiddleware, adminOnly, approveResource);

// Reject
router.patch("/resources/:id/reject", authMiddleware, adminOnly, rejectResource);

module.exports = router;