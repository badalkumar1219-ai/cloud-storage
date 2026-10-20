// ============================================
// CloudBox – Express Backend Server
// ============================================
// Phase 1: Basic health-check endpoint.
// AWS S3 & Google OAuth will be added in Phase 2.
// ============================================

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// --------------- Middleware ---------------

// Allow requests from the React frontend
app.use(cors());

// Parse incoming JSON bodies
app.use(express.json());

// --------------- Routes ---------------

/**
 * GET /api/health
 * Returns a simple JSON response to confirm the server is running.
 */
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "CloudBox API is running",
    timestamp: new Date().toISOString(),
  });
});

// --------------- Start server ---------------

app.listen(PORT, () => {
  console.log(`☁️  CloudBox API listening on http://localhost:${PORT}`);
});
