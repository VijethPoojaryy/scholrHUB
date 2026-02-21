const pool = require("../config/db");

exports.createNotice = async (req, res) => {
  try {
    const { title, content } = req.body;
    const createdBy = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    await pool.execute(
      'INSERT INTO notices (title, content, created_by) VALUES (?, ?, ?)',
      [title, content, createdBy]
    );

    res.status(201).json({ message: "Notice posted successfully" });
  } catch (err) {
    console.error("Create notice error:", err);
    res.status(500).json({ message: "Server error creating notice" });
  }
};

exports.getNotices = async (req, res) => {
  try {
    const [notices] = await pool.execute(
      'SELECT n.*, u.name as author_name FROM notices n JOIN users u ON n.created_by = u.id ORDER BY n.created_at DESC'
    );
    res.json(notices);
  } catch (err) {
    console.error("Fetch notices error:", err);
    res.status(500).json({ message: "Server error fetching notices" });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM notices WHERE id = ?', [id]);
    res.json({ message: "Notice deleted" });
  } catch (err) {
    console.error("Delete notice error:", err);
    res.status(500).json({ message: "Server error deleting notice" });
  }
};