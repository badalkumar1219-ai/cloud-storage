const crypto = require("crypto");
const { promisify } = require("util");
const { v4: uuidv4 } = require("uuid");
const router = require("express").Router();
const { isS3Configured } = require("../config/s3");
const {
  addUser,
  getUserByEmail,
  getUserById,
  toPublicUser,
} = require("../config/userStore");
const { isAuthorizedUploader } = require("../middleware/auth");

const scrypt = promisify(crypto.scrypt);
const PASSWORD_BYTES = 64;

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function isValidEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function hashPassword(password, salt) {
  const hash = await scrypt(password, salt, PASSWORD_BYTES);
  return hash.toString("hex");
}

function establishSession(req, userId) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) return reject(error);
      req.session.userId = userId;
      req.session.save((saveError) => {
        if (saveError) return reject(saveError);
        resolve();
      });
    });
  });
}

function respondWithUser(req, res, user) {
  return establishSession(req, user.id).then(() => {
    res.json({
      user: toPublicUser(user),
      demoMode: !isS3Configured,
      canUpload: isAuthorizedUploader(user),
    });
  });
}

router.post("/register", async (req, res) => {
  const { name, password } = req.body || {};
  const email = normalizeEmail(req.body?.email);
  const displayName = typeof name === "string" ? name.trim() : "";

  if (!displayName || displayName.length > 80) {
    return res.status(400).json({ error: "Name must be between 1 and 80 characters" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Enter a valid email address" });
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: "Password must be between 8 and 128 characters" });
  }
  if (getUserByEmail(email)) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const user = {
    id: uuidv4(),
    name: displayName,
    email,
    avatar: "",
    passwordSalt: salt,
    passwordHash: await hashPassword(password, salt),
  };

  if (!addUser(user)) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  return respondWithUser(req, res, user);
});

router.post("/login", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;

  if (!isValidEmail(email) || typeof password !== "string" || password.length > 128) {
    return res.status(400).json({ error: "Enter a valid email and password" });
  }

  const user = getUserByEmail(email);
  const salt = user?.passwordSalt || "cloudbox-invalid-account";
  const passwordHash = await hashPassword(password, salt);

  if (!user || !crypto.timingSafeEqual(
    Buffer.from(passwordHash, "hex"),
    Buffer.from(user.passwordHash, "hex")
  )) {
    return res.status(401).json({ error: "Email or password is incorrect" });
  }

  return respondWithUser(req, res, user);
});

router.get("/me", (req, res) => {
  const user = req.session.userId ? getUserById(req.session.userId) : null;
  res.json({
    user,
    demoMode: !isS3Configured,
    canUpload: user ? isAuthorizedUploader(user) : false,
  });
});

router.post("/logout", (req, res, next) => {
  if (!req.session) {
    return res.json({ message: "Logged out successfully" });
  }
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;
