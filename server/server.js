import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";

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

// ✅ Fix CORS Configuration
const corsOptions = {
  origin: ["http://localhost:5173", "https://ontariohealthmaps.com"],
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(cors(corsOptions));

app.get("/api/phu-data", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM public_health_units");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Database Error:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.get("/api/cancer-data", async (req, res) => {
  try {
    const { year, age, gender } = req.query;

    let query = "SELECT * FROM cancer WHERE 1=1";
    let params = [];

    // Apply Year Filter
    if (year) {
      query += ` AND Year = $${params.length + 1}`;
      params.push(year);
    }

    // Apply Age Filter
    if (age) {
      // Map selected age group to appropriate measures
      const ageMapping = {
        "50-64": "Age-specific rate (50 to 64)",
        "65-79": "Age-specific rate (65 to 79)",
        "80+": "Age-specific rate (80+)",
      };

      if (ageMapping[age]) {
        query += ` AND measure = $${params.length + 1}`;
        params.push(ageMapping[age]);
      }
    }

    // Execute Query
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching cancer data:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

// 🔹 Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
