const { getUserById } = require("../config/userStore");

function isAuthenticated(req, res, next) {
  const user = req.session?.userId ? getUserById(req.session.userId) : null;
  if (!user) {
    return res.status(401).json({ error: "Not authenticated. Please sign in." });
  }
  req.user = user;
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
