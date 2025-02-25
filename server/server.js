import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Connect to PostgreSQL
const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

// API Route to Fetch PHU Data
app.get("/api/phu-data", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM public_health_units"); // Change 'merged_data' to your table name
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Database Error:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Start the Server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
