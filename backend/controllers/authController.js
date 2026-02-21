const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT
const signToken = (id, role) =>
  jwt.sign(
    { id, role },
    process.env.JWT_SECRET || "supersecretkey",
    { expiresIn: "7d" }
  );

exports.register = async (req, res) => {
  try {
    console.log("INCOMING REGISTRATION REQUEST BODY:", req.body);
    const { usn, name, semester, password, role } = req.body;

    if (!usn || !name || !password || !role) {
      const missing = [];
      if (!usn) missing.push("USN");
      if (!name) missing.push("Name");
      if (!password) missing.push("Password");
      if (!role) missing.push("Role");
      return res.status(400).json({ message: `REG_ERR_V1: Missing fields: ${missing.join(", ")}` });
    }

    const [existingUsers] = await pool.execute('SELECT * FROM users WHERE usn = ?', [usn]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User with this USN already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (usn, name, semester, password, role) VALUES (?, ?, ?, ?, ?)',
      [usn, name, semester || null, hashedPassword, role]
    );

    const userId = result.insertId;
    const token = signToken(userId, role);

    res.status(201).json({
      token,
      user: { id: userId, usn, name, semester, role },
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

exports.login = async (req, res) => {
  try {
    const { usn, password } = req.body;
    console.log(`Login attempt for USN: [${usn}]`);

    if (!usn || !password) {
      return res.status(400).json({ message: "LOGIN_ERR_V1: All fields are required" });
    }

    const [users] = await pool.execute('SELECT * FROM users WHERE usn = ?', [usn]);
    if (users.length === 0) {
      console.log(`User not found: [${usn}]`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password match for [${usn}]: ${isMatch}`);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = signToken(user.id, user.role);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        usn: user.usn,
        name: user.name,
        role: user.role,
        semester: user.semester
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};