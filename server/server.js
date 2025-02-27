import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// 🔹 User Signup (Now Includes Name)
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password, is_profile_completed) VALUES ($1, $2, $3, FALSE) RETURNING id, is_profile_completed",
      [name, email, hashedPassword]
    );
    res.json({
      token: generateToken(result.rows[0].id),
      isProfileCompleted: result.rows[0].is_profile_completed,
    });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(400).json({ message: "User already exists or invalid input" });
  }
});

// 🔹 User Login (Check if First-time Login Needs Profile Completion)
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      token: generateToken(user.rows[0].id),
      isProfileCompleted: user.rows[0].is_profile_completed,
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Profile Completion Route
app.post("/api/complete-profile", async (req, res) => {
  const { token, usageIntent, preferredRole } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Insert user details
    await pool.query(
      "INSERT INTO user_details (user_id, usage_intent, preferred_role) VALUES ($1, $2, $3)",
      [userId, usageIntent, preferredRole]
    );

    // Update profile completion status
    await pool.query(
      "UPDATE users SET is_profile_completed = TRUE WHERE id = $1",
      [userId]
    );

    res.json({ message: "Profile completed successfully!" });
  } catch (error) {
    console.error("❌ Profile Completion Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Protected Route to Check Profile Completion
app.get("/api/protected", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Fetch user's profile completion status
    const user = await pool.query(
      "SELECT is_profile_completed FROM users WHERE id = $1",
      [userId]
    );

    if (user.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.json({ isProfileCompleted: user.rows[0].is_profile_completed });
  } catch (error) {
    console.error("❌ Authentication Error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
});

app.get("/api/phu-data", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM public_health_units");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Database Error:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

// 🔹 Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
