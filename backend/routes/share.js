// ============================================
// Share Routes – File Sharing
// ============================================
// POST   /api/share              → Share a file with someone by email
// GET    /api/share/shared-with-me → Files shared with me
// GET    /api/share/my-shares    → Files I've shared with others
// GET    /api/share/file-shares  → Get all shares for a specific file
// DELETE /api/share/:id          → Remove a share
// POST   /api/share/link         → Create a shareable link
// GET    /api/share/link/:linkId → Access a shared link
// DELETE /api/share/link/:linkId → Delete a share link
// ============================================

const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { s3Client, BUCKET_NAME, isS3Configured } = require("../config/s3");
const { isAuthenticated } = require("../middleware/auth");
const {
  getShares,
  getShareLinks,
  addShare,
  removeShare,
  addShareLink,
  removeShareLink,
} = require("../config/shareStore");

// ─── SHARE A FILE BY EMAIL ──────────────────────────
router.post("/", isAuthenticated, (req, res) => {
  try {
    const { fileKey, fileName, fileSize, recipientEmail, permission } = req.body;

    if (!fileKey || !fileName || !recipientEmail) {
      return res.status(400).json({
        error: "fileKey, fileName, and recipientEmail are required",
      });
    }

    // Don't allow sharing with yourself
    if (recipientEmail.toLowerCase() === req.user.email.toLowerCase()) {
      return res.status(400).json({ error: "You cannot share a file with yourself" });
    }

    // Check if already shared with this person
    const existing = getShares().find(
      (s) =>
        s.fileKey === fileKey &&
        s.sharedWithEmail.toLowerCase() === recipientEmail.toLowerCase()
    );

    if (existing) {
      return res.status(400).json({
        error: `This file is already shared with ${recipientEmail}`,
      });
    }

    const share = {
      id: uuidv4(),
      fileKey,
      fileName,
      fileSize: fileSize || 0,
      ownerId: req.user.id,
      ownerName: req.user.name,
      ownerEmail: req.user.email,
      ownerAvatar: req.user.avatar || "",
      sharedWithEmail: recipientEmail.toLowerCase(),
      permission: permission || "view", // "view" or "download"
      sharedAt: new Date().toISOString(),
    };

    addShare(share);

    res.json({
      message: `File shared with ${recipientEmail}`,
      share,
    });
  } catch (error) {
    console.error("Share error:", error);
    res.status(500).json({ error: "Failed to share file" });
  }
});

// ─── FILES SHARED WITH ME ───────────────────────────
router.get("/shared-with-me", isAuthenticated, (req, res) => {
  try {
    const myEmail = req.user.email.toLowerCase();
    const shares = getShares().filter(
      (s) => s.sharedWithEmail === myEmail
    );

    // Map shares to a file-like format for the frontend
    const files = shares.map((s) => ({
      id: s.id,
      name: s.fileName,
      key: s.fileKey,
      type: s.fileName.split(".").pop() || "file",
      size: s.fileSize,
      lastModified: s.sharedAt,
      isFolder: false,
      sharedBy: s.ownerName,
      sharedByEmail: s.ownerEmail,
      sharedByAvatar: s.ownerAvatar,
      permission: s.permission,
      shareId: s.id,
    }));

    res.json({ files });
  } catch (error) {
    console.error("Shared with me error:", error);
    res.status(500).json({ error: "Failed to get shared files" });
  }
});

// ─── FILES I'VE SHARED ─────────────────────────────
router.get("/my-shares", isAuthenticated, (req, res) => {
  try {
    const shares = getShares().filter((s) => s.ownerId === req.user.id);
    res.json({ shares });
  } catch (error) {
    console.error("My shares error:", error);
    res.status(500).json({ error: "Failed to get your shares" });
  }
});

// ─── GET SHARES FOR A SPECIFIC FILE ─────────────────
router.get("/file-shares", isAuthenticated, (req, res) => {
  try {
    const { fileKey } = req.query;

    if (!fileKey) {
      return res.status(400).json({ error: "fileKey is required" });
    }

    // Only the owner can see who a file is shared with
    const shares = getShares().filter(
      (s) => s.fileKey === fileKey && s.ownerId === req.user.id
    );

    const links = getShareLinks().filter(
      (l) => l.fileKey === fileKey && l.ownerId === req.user.id
    );

    res.json({ shares, links });
  } catch (error) {
    console.error("File shares error:", error);
    res.status(500).json({ error: "Failed to get file shares" });
  }
});

// ─── REMOVE A SHARE ─────────────────────────────────
router.delete("/:id", isAuthenticated, (req, res) => {
  try {
    const { id } = req.params;
    const share = getShares().find((s) => s.id === id);

    if (!share) {
      return res.status(404).json({ error: "Share not found" });
    }

    // Only the owner can remove sharing
    if (share.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Only the file owner can remove sharing" });
    }

    removeShare(id);
    res.json({ message: "Share removed" });
  } catch (error) {
    console.error("Remove share error:", error);
    res.status(500).json({ error: "Failed to remove share" });
  }
});

// ─── CREATE A SHAREABLE LINK ────────────────────────
router.post("/link", isAuthenticated, (req, res) => {
  try {
    const { fileKey, fileName, fileSize, permission } = req.body;

    if (!fileKey || !fileName) {
      return res.status(400).json({
        error: "fileKey and fileName are required",
      });
    }

    // Check if a link already exists for this file by this user
    const existing = getShareLinks().find(
      (l) => l.fileKey === fileKey && l.ownerId === req.user.id
    );

    if (existing) {
      const linkUrl = `${req.protocol}://${req.get("host")}/api/share/link/${existing.linkId}`;
      return res.json({
        message: "Share link already exists",
        link: existing,
        url: linkUrl,
      });
    }

    const linkId = uuidv4().replace(/-/g, "").substring(0, 12); // short link ID

    const link = {
      linkId,
      fileKey,
      fileName,
      fileSize: fileSize || 0,
      ownerId: req.user.id,
      ownerName: req.user.name,
      permission: permission || "download",
      createdAt: new Date().toISOString(),
    };

    addShareLink(link);

    const linkUrl = `${req.protocol}://${req.get("host")}/api/share/link/${linkId}`;

    res.json({
      message: "Share link created",
      link,
      url: linkUrl,
    });
  } catch (error) {
    console.error("Create link error:", error);
    res.status(500).json({ error: "Failed to create share link" });
  }
});

// ─── ACCESS A SHARED LINK ──────────────────────────
router.get("/link/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const link = getShareLinks().find((l) => l.linkId === linkId);

    if (!link) {
      return res.status(404).json({ error: "Share link not found or expired" });
    }

    // If action=info, return link metadata (for the frontend)
    if (req.query.action === "info") {
      return res.json({
        fileName: link.fileName,
        fileSize: link.fileSize,
        sharedBy: link.ownerName,
        permission: link.permission,
        createdAt: link.createdAt,
      });
    }

    // Otherwise, generate download URL
    if (!isS3Configured) {
      return res.status(503).json({
        error: "AWS S3 is not configured. Cannot download shared files.",
      });
    }

    if (link.permission === "view") {
      return res.json({
        fileName: link.fileName,
        message: "This link is view-only. Download is not permitted.",
      });
    }

    // Generate presigned download URL
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: link.fileKey,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    res.redirect(url);
  } catch (error) {
    console.error("Shared link access error:", error);
    res.status(500).json({ error: "Failed to access shared file" });
  }
});

// ─── DELETE A SHARE LINK ────────────────────────────
router.delete("/link/:linkId", isAuthenticated, (req, res) => {
  try {
    const { linkId } = req.params;
    const link = getShareLinks().find((l) => l.linkId === linkId);

    if (!link) {
      return res.status(404).json({ error: "Share link not found" });
    }

    if (link.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Only the owner can delete this link" });
    }

    removeShareLink(linkId);
    res.json({ message: "Share link deleted" });
  } catch (error) {
    console.error("Delete link error:", error);
    res.status(500).json({ error: "Failed to delete share link" });
  }
});

// ─── DOWNLOAD A SHARED FILE (by share ID) ───────────
router.get("/download/:shareId", isAuthenticated, async (req, res) => {
  try {
    const { shareId } = req.params;
    const share = getShares().find((s) => s.id === shareId);

    if (!share) {
      return res.status(404).json({ error: "Share not found" });
    }

    // Only the recipient can download
    if (share.sharedWithEmail !== req.user.email.toLowerCase()) {
      return res.status(403).json({ error: "You don't have access to this file" });
    }

    if (share.permission === "view") {
      return res.status(403).json({
        error: "You only have view permission for this file",
      });
    }

    if (!isS3Configured) {
      return res.status(503).json({
        error: "AWS S3 is not configured. Cannot download shared files.",
      });
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: share.fileKey,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    res.json({ url });
  } catch (error) {
    console.error("Download shared file error:", error);
    res.status(500).json({ error: "Failed to download shared file" });
  }
});

module.exports = router;
