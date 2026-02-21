const router = require("express").Router();
const {
  createNotice,
  getNotices,
  deleteNotice
} = require("../controllers/noticeController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createNotice);
router.get("/", authMiddleware, getNotices);
router.delete("/:id", authMiddleware, deleteNotice);

module.exports = router;