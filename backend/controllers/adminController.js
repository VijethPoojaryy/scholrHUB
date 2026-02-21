const pool = require("../config/db");
const bcrypt = require("bcryptjs");

/* =====================================================
   📊 Dashboard Statistics
   Note: Adjusted for MySQL 'pool'
===================================================== */
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    // 1. Fetch system offsets
    const [settings] = await pool.execute('SELECT setting_key, setting_value FROM system_settings');
    const config = settings.reduce((acc, s) => ({ ...acc, [s.setting_key]: s.setting_value }), {});

    const baseRes = parseInt(config.base_resource_count || 0);
    const baseReach = parseInt(config.base_student_reach || 0);
    const targetGoal = parseInt(config.target_contribution_goal || 12);

    // 2. Global Counts
    const [[{ totalUsers }]] = await pool.execute('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalResources }]] = await pool.execute('SELECT COUNT(*) as totalResources FROM resources WHERE status = "Approved"');
    const [[{ pendingReview }]] = await pool.execute('SELECT COUNT(*) as pendingReview FROM resources WHERE status = "Pending"');

    // 3. User Specific Stats
    const [[{ userUploads }]] = await pool.execute('SELECT COUNT(*) as userUploads FROM resources WHERE uploaded_by = ?', [userId]);
    const [[{ userApproved }]] = await pool.execute('SELECT COUNT(*) as userApproved FROM resources WHERE uploaded_by = ? AND status = "Approved"', [userId]);

    // Completion Calculation
    const completion = Math.min(Math.round((userUploads / targetGoal) * 100), 100);

    // Class Rank Calculation (based on approved uploads)
    const [rankings] = await pool.execute(`
      SELECT uploaded_by, COUNT(*) as count 
      FROM resources 
      WHERE status = "Approved" 
      GROUP BY uploaded_by 
      ORDER BY count DESC
    `);

    const userRankIdx = rankings.findIndex(r => r.uploaded_by === userId);
    const rankPos = userRankIdx === -1 ? rankings.length + 1 : userRankIdx + 1;
    const rankPercentile = Math.round(((rankings.length - rankPos + 1) / (rankings.length || 1)) * 100);
    const rankLabel = rankPos === 1 ? "Top 1%" : `Top ${Math.max(10, 100 - rankPercentile)}%`;

    res.json({
      totalUsers: totalUsers + baseReach,
      totalResources: totalResources + baseRes,
      pendingReview,
      userSubmissions: userUploads,
      userApproved,
      completion: `${completion}%`,
      classRank: rankLabel,
      approvalRate: totalResources === 0 ? 0 : Math.round((userApproved / (userUploads || 1)) * 100)
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};

/* =====================================================
   👥 Get All Users (Admin Only)
===================================================== */
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT id, name, usn, role, semester FROM users');
    res.json(users);
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

/* =====================================================
   ➕ Create Student / Professor
===================================================== */
exports.createUser = async (req, res) => {
  try {
    const { name, usn, password, role, semester } = req.body;

    if (!name || !usn || !password || !role) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    const [existing] = await pool.execute('SELECT id FROM users WHERE usn = ?', [usn]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      'INSERT INTO users (name, usn, password, role, semester) VALUES (?, ?, ?, ?, ?)',
      [name, usn, hashedPassword, role, semester || null]
    );

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

/* =====================================================
   ✏ Update User
===================================================== */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, semester } = req.body;

    await pool.execute(
      'UPDATE users SET name = ?, role = ?, semester = ? WHERE id = ?',
      [name, role, semester, id]
    );

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};

/* =====================================================
   ❌ Delete User
===================================================== */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id == id) {
      return res.status(400).json({ message: "Admin cannot delete themselves" });
    }

    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

/* =====================================================
   📂 Resources Management (Admin Only)
===================================================== */
exports.getPendingResources = async (req, res) => {
  try {
    const [resources] = await pool.execute(
      'SELECT r.*, u.name as uploader_name FROM resources r JOIN users u ON r.uploaded_by = u.id WHERE r.status = "Pending"'
    );
    res.json(resources);
  } catch (error) {
    console.error("Fetch pending error:", error);
    res.status(500).json({ message: "Server error fetching pending resources" });
  }
};

exports.approveResource = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('UPDATE resources SET status = "Approved" WHERE id = ?', [id]);
    res.json({ message: "Resource approved" });
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ message: "Server error approving resource" });
  }
};

exports.rejectResource = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT file_path FROM resources WHERE id = ?', [id]);
    if (rows.length > 0) {
      const fullPath = require('path').join(__dirname, '..', rows[0].file_path);
      const fs = require('fs');
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

/* =====================================================
   📈 Activity Stats (for BarChart)
===================================================== */
exports.getActivityStats = async (req, res) => {
  try {
    // Get upload counts for last 7 days
    const [rows] = await pool.execute(`
      SELECT DATE_FORMAT(upload_date, '%a') as day, COUNT(*) as count 
      FROM resources 
      WHERE upload_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(upload_date)
      ORDER BY DATE(upload_date)
    `);

    const labels = rows.map(r => r.day);
    const vals = rows.map(r => r.count);

    // Get unread notices count (notices in last 7 days)
    const [[{ unreadNotices }]] = await pool.execute('SELECT COUNT(*) as unreadNotices FROM notices WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');

    res.json({ labels, vals, unreadNotices });
  } catch (error) {
    console.error("Activity Stats Error:", error);
    res.status(500).json({ message: "Error fetching activity stats" });
  }
};

/* =====================================================
   📉 User Specific Activity (for LineChart)
===================================================== */
exports.getUserActivityStats = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get upload counts for last 14 days for this user
    const [rows] = await pool.execute(`
      SELECT DATE_FORMAT(upload_date, '%Y-%m-%d') as date, COUNT(*) as count 
      FROM resources 
      WHERE uploaded_by = ? AND upload_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
      GROUP BY DATE(upload_date)
      ORDER BY DATE(upload_date)
    `, [userId]);

    res.json(rows);
  } catch (error) {
    console.error("User Activity Stats Error:", error);
    res.status(500).json({ message: "Error fetching user activity stats" });
  }
};

exports.getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(`
      SELECT id, title, subject_code, semester, status, upload_date, file_type
      FROM resources
      WHERE uploaded_by = ?
      ORDER BY upload_date DESC
      LIMIT 10
    `, [userId]);
    res.json(rows);
  } catch (error) {
    console.error("User Submissions Error:", error);
    res.status(500).json({ message: "Error fetching user submissions" });
  }
};
