const pool = require("../config/db");
const path = require("path");
const fs = require("fs");

exports.uploadResource = async (req, res) => {
  try {
    const { title, semester, subject_code, unit, professor_name } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadedBy = req.user.id;
    const role = req.user.role;
    // Faculty/Admin uploads go live immediately; Students need approval
    const status = (role === 'Admin' || role === 'Faculty') ? 'Approved' : 'Pending';
    const filePath = `uploads/${file.filename}`;
    const fileType = path.extname(file.originalname).substring(1).toLowerCase();

    await pool.execute(
      'INSERT INTO resources (title, file_path, file_type, semester, subject_code, unit, professor_name, uploaded_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, filePath, fileType, semester, subject_code, unit, professor_name, uploadedBy, status]
    );

    res.status(201).json({ message: "Resource uploaded successfully", status });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error during upload" });
  }
};

exports.getResources = async (req, res) => {
  try {
    const { semester, subject_code, professor_name } = req.query;
    let query = 'SELECT r.*, u.name as uploader_name FROM resources r JOIN users u ON r.uploaded_by = u.id WHERE r.status = "Approved"';
    const params = [];

    if (semester) {
      query += ' AND r.semester = ?';
      params.push(semester);
    }
    if (subject_code) {
      query += ' AND r.subject_code = ?';
      params.push(subject_code);
    }
    if (professor_name) {
      query += ' AND r.professor_name LIKE ?';
      params.push(`%${professor_name}%`);
    }

    query += ' ORDER BY r.upload_date DESC';

    const [resources] = await pool.execute(query, params);
    res.json(resources);
  } catch (err) {
    console.error("Fetch resources error:", err);
    res.status(500).json({ message: "Server error fetching resources" });
  }
};

exports.getPendingResources = async (req, res) => {
  try {
    const [resources] = await pool.execute(
      'SELECT r.*, u.name as uploader_name FROM resources r JOIN users u ON r.uploaded_by = u.id WHERE r.status = "Pending"'
    );
    res.json(resources);
  } catch (err) {
    console.error("Fetch pending error:", err);
    res.status(500).json({ message: "Server error fetching pending resources" });
  }
};

exports.approveResource = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('UPDATE resources SET status = "Approved" WHERE id = ?', [id]);
    res.json({ message: "Resource approved" });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ message: "Server error approving resource" });
  }
};

exports.rejectResource = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT file_path FROM resources WHERE id = ?', [id]);
    if (rows.length > 0) {
      const fullPath = path.join(__dirname, '..', rows[0].file_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    await pool.execute('DELETE FROM resources WHERE id = ?', [id]);
    res.json({ message: "Resource rejected and deleted" });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ message: "Server error rejecting resource" });
  }
};