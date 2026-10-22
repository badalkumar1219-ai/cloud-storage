// ============================================
// CloudBox – Express Backend Server (Complete)
// ============================================
// Features:
//   • Email and password authentication
//   • AWS S3 file storage
//   • Demo mode when credentials are not set
//   • File sharing (by email and link)
//   • Health check endpoint
// ============================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { isS3Configured } = require("./config/s3");

// Import routes
const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/files");
const shareRoutes = require("./routes/share");

const app = express();
const PORT = process.env.PORT || 5000;
const sessionSecret = process.env.SESSION_SECRET;

if (process.env.NODE_ENV === "production" && !sessionSecret) {
  throw new Error("SESSION_SECRET must be configured in production");
}

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.get("/", (_req, res) => {
  res.send("Backend is running successfully!");
});

// --------------- Middleware ---------------

// CORS – allow the React frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management (stores login state)
// NOTE: MemoryStore is fine for development.
//       Use Redis or a database store in production.
app.use(
  session({
    secret: sessionSecret || "cloudbox-dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);

// --------------- Routes ---------------

// Health check (always available)
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "CloudBox API is running",
    timestamp: new Date().toISOString(),
    demoMode: !isS3Configured,
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// File management routes
app.use("/api/files", fileRoutes);

// Sharing routes
app.use("/api/share", shareRoutes);

// --------------- Error handling ---------------

app.use((err, _req, res, _next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// --------------- Start server ---------------

app.listen(PORT, () => {
  console.log(`\n☁️  CloudBox API listening on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
