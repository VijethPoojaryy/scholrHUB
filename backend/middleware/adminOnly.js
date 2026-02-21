module.exports = (req, res, next) => {
  // authMiddleware must run before this
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role !== "Admin" && req.user.role !== "Faculty") {
    return res.status(403).json({ message: "Access denied. Admins or Faculty only." });
  }

  next();
};