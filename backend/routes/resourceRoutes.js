const router = require("express").Router();
const {
    uploadResource,
    getResources,
    getPendingResources,
    approveResource,
    rejectResource
} = require("../controllers/resourceController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/upload", authMiddleware, upload.single("file"), uploadResource);
router.get("/", authMiddleware, getResources);
router.get("/pending", authMiddleware, getPendingResources);
router.patch("/approve/:id", authMiddleware, approveResource); // In real app, check if user is Faculty/Admin
router.delete("/reject/:id", authMiddleware, rejectResource);

module.exports = router;