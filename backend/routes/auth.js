// ============================================
// Auth Routes – Google OAuth 2.0
// ============================================
// GET  /api/auth/google          → Start Google login
// GET  /api/auth/google/callback → Google callback
// GET  /api/auth/me              → Get current user
// POST /api/auth/logout          → Log out
// ============================================

const router = require("express").Router();
const passport = require("passport");
const { isAuthorizedUploader } = require("../middleware/auth");

const isOAuthConfigured =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

// ─── Start Google OAuth flow ──────────────────────────
router.get("/google", (req, res, next) => {
  if (!isOAuthConfigured) {
    return res.status(503).json({
      error: "Google OAuth is not configured.",
      hint: "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.",
    });
  }
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

// ─── Google OAuth callback ────────────────────────────
router.get(
  "/google/callback",
  (req, res, next) => {
    if (!isOAuthConfigured) {
      return res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
    }
    passport.authenticate("google", {
      failureRedirect:
        (process.env.CLIENT_URL || "http://localhost:5173") + "/login",
    })(req, res, next);
  },
  (_req, res) => {
    // Successful login – redirect to the dashboard
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
  }
);

// ─── Get current user ─────────────────────────────────
router.get("/me", (req, res) => {
  if (isOAuthConfigured) {
    // Real auth mode
    if (req.isAuthenticated && req.isAuthenticated()) {
      return res.json({
        user: req.user,
        demoMode: false,
        canUpload: isAuthorizedUploader(req.user),
      });
    }
    return res.json({ user: null, demoMode: false, canUpload: false });
  }

  // Demo mode – return a demo user
  res.json({
    user: {
      id: "demo-user",
      name: "Demo User",
      email: "demo@cloudbox.local",
      avatar: "",
    },
    demoMode: true,
    canUpload: false,
  });
});

// ─── Logout ───────────────────────────────────────────
router.post("/logout", (req, res) => {
  if (req.logout) {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      req.session?.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
    });
  } else {
    res.json({ message: "Logged out successfully" });
  }
});

module.exports = router;
