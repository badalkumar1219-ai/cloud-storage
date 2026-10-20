// ============================================
// Auth Middleware
// ============================================
// Protects routes that require authentication.
// In demo mode (no Google credentials), allows
// all requests with a demo user.
// ============================================

/**
 * Middleware: Require the user to be authenticated.
 * Falls back to a demo user when Google OAuth is not configured.
 */
function isAuthenticated(req, res, next) {
  // If Google OAuth is configured, enforce real authentication
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ error: "Not authenticated. Please sign in with Google." });
  }

  // Demo mode – attach a demo user and allow the request
  req.user = {
    id: "demo-user",
    name: "Demo User",
    email: "demo@cloudbox.local",
    avatar: "",
  };
  return next();
}

function isAuthorizedUploader(user) {
  const authorizedEmail = process.env.UPLOAD_AUTHORIZED_EMAIL?.trim().toLowerCase();
  const userEmail = user?.email?.trim().toLowerCase();

  return Boolean(authorizedEmail && userEmail && userEmail === authorizedEmail);
}

function requireAuthorizedUploader(req, res, next) {
  if (!isAuthorizedUploader(req.user)) {
    return res.status(403).json({
      error: "File uploads are restricted to the authorized account.",
    });
  }

  return next();
}

module.exports = {
  isAuthenticated,
  isAuthorizedUploader,
  requireAuthorizedUploader,
};
