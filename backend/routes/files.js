// ============================================
// File Routes – S3 File Operations
// ============================================
// GET    /api/files              → List files
// POST   /api/files/upload       → Upload file(s)
// GET    /api/files/download     → Download a file
// DELETE /api/files              → Delete a file
// POST   /api/files/folder       → Create a folder
// POST   /api/files/trash        → Move file to trash
// POST   /api/files/restore      → Restore from trash
// GET    /api/files/storage      → Get storage usage
// ============================================

const router = require("express").Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { s3Client, BUCKET_NAME, isS3Configured } = require("../config/s3");
const { isAuthenticated } = require("../middleware/auth");

// Multer stores uploaded files in memory before sending to S3
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
});

// ─── Demo data (used when S3 is not configured) ──────
const demoFiles = [
  {
    id: "demo-1",
    name: "Project Proposal.pdf",
    key: "demo-user/files/Project Proposal.pdf",
    type: "application/pdf",
    size: 2516582,
    lastModified: "2026-10-18T10:30:00Z",
    isFolder: false,
  },
  {
    id: "demo-2",
    name: "Design Assets",
    key: "demo-user/files/Design Assets/",
    type: "folder",
    size: 0,
    lastModified: "2026-10-17T09:15:00Z",
    isFolder: true,
  },
  {
    id: "demo-3",
    name: "Meeting Notes.docx",
    key: "demo-user/files/Meeting Notes.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 159744,
    lastModified: "2026-10-16T14:20:00Z",
    isFolder: false,
  },
  {
    id: "demo-4",
    name: "Budget Spreadsheet.xlsx",
    key: "demo-user/files/Budget Spreadsheet.xlsx",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 1153434,
    lastModified: "2026-10-15T11:45:00Z",
    isFolder: false,
  },
  {
    id: "demo-5",
    name: "Photos",
    key: "demo-user/files/Photos/",
    type: "folder",
    size: 0,
    lastModified: "2026-10-14T08:00:00Z",
    isFolder: true,
  },
  {
    id: "demo-6",
    name: "Presentation.pptx",
    key: "demo-user/files/Presentation.pptx",
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    size: 6082355,
    lastModified: "2026-10-13T16:30:00Z",
    isFolder: false,
  },
  {
    id: "demo-7",
    name: "App Wireframes.fig",
    key: "demo-user/files/App Wireframes.fig",
    type: "application/octet-stream",
    size: 3355443,
    lastModified: "2026-10-12T13:00:00Z",
    isFolder: false,
  },
  {
    id: "demo-8",
    name: "Backup Archives",
    key: "demo-user/files/Backup Archives/",
    type: "folder",
    size: 0,
    lastModified: "2026-10-10T07:30:00Z",
    isFolder: true,
  },
  {
    id: "demo-9",
    name: "Team Photo.png",
    key: "demo-user/files/Team Photo.png",
    type: "image/png",
    size: 4928307,
    lastModified: "2026-10-09T12:15:00Z",
    isFolder: false,
  },
  {
    id: "demo-10",
    name: "README.md",
    key: "demo-user/files/README.md",
    type: "text/markdown",
    size: 8192,
    lastModified: "2026-10-08T10:00:00Z",
    isFolder: false,
  },
];

// ─── Helper: Build the S3 prefix for a user ──────────
function getUserPrefix(userId, section = "files") {
  return `${userId}/${section}/`;
}

// ─── Helper: Extract filename from S3 key ────────────
function getFileName(key, prefix) {
  return key.replace(prefix, "").replace(/\/$/, "");
}

// ─── LIST FILES ──────────────────────────────────────
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const section = req.query.section || "files"; // "files" or "trash"
    const folder = req.query.folder || "";        // subfolder path

    // Demo mode
    if (!isS3Configured) {
      let files = [...demoFiles];
      if (section === "trash") {
        files = []; // No trash items in demo
      }
      return res.json({ files, demoMode: true });
    }

    // Real S3 mode
    const prefix = getUserPrefix(req.user.id, section) + folder;

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      Delimiter: "/",
    });

    const response = await s3Client.send(command);

    const files = [];

    // Add folders (CommonPrefixes)
    if (response.CommonPrefixes) {
      for (const cp of response.CommonPrefixes) {
        const name = getFileName(cp.Prefix, prefix);
        if (name) {
          files.push({
            id: cp.Prefix,
            name,
            key: cp.Prefix,
            type: "folder",
            size: 0,
            lastModified: null,
            isFolder: true,
          });
        }
      }
    }

    // Add files (Contents)
    if (response.Contents) {
      for (const obj of response.Contents) {
        const name = getFileName(obj.Key, prefix);
        if (name && !name.includes("/")) {
          files.push({
            id: obj.Key,
            name,
            key: obj.Key,
            type: obj.Key.split(".").pop() || "file",
            size: obj.Size,
            lastModified: obj.LastModified,
            isFolder: false,
          });
        }
      }
    }

    res.json({ files, demoMode: false });
  } catch (error) {
    console.error("List files error:", error);
    res.status(500).json({ error: "Failed to list files" });
  }
});

// ─── UPLOAD FILE ─────────────────────────────────────
router.post(
  "/upload",
  isAuthenticated,
  upload.array("files", 10),
  async (req, res) => {
    try {
      if (!isS3Configured) {
        return res.status(503).json({
          error: "AWS S3 is not configured.",
          hint: "Add AWS credentials to your .env file to enable uploads.",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files provided" });
      }

      const folder = req.body.folder || "";
      const prefix = getUserPrefix(req.user.id) + folder;
      const uploaded = [];

      for (const file of req.files) {
        const key = prefix + file.originalname;

        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        });

        await s3Client.send(command);

        uploaded.push({
          name: file.originalname,
          key,
          size: file.size,
          type: file.mimetype,
        });
      }

      res.json({
        message: `${uploaded.length} file(s) uploaded successfully`,
        files: uploaded,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload file(s)" });
    }
  }
);

// ─── DOWNLOAD FILE (presigned URL) ───────────────────
router.get("/download", isAuthenticated, async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ error: "File key is required" });
    }

    if (!isS3Configured) {
      return res.status(503).json({
        error: "AWS S3 is not configured.",
        hint: "Add AWS credentials to your .env file to enable downloads.",
      });
    }

    // Generate a presigned URL valid for 15 minutes
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    res.json({ url });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Failed to generate download link" });
  }
});

// ─── DELETE FILE ─────────────────────────────────────
router.delete("/", isAuthenticated, async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ error: "File key is required" });
    }

    if (!isS3Configured) {
      return res.status(503).json({
        error: "AWS S3 is not configured.",
        hint: "Add AWS credentials to your .env file to enable deletions.",
      });
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    res.json({ message: "File deleted permanently" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

// ─── CREATE FOLDER ───────────────────────────────────
router.post("/folder", isAuthenticated, async (req, res) => {
  try {
    const { name, parentFolder = "" } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Folder name is required" });
    }

    if (!isS3Configured) {
      return res.status(503).json({
        error: "AWS S3 is not configured.",
        hint: "Add AWS credentials to your .env file to create folders.",
      });
    }

    const prefix = getUserPrefix(req.user.id) + parentFolder;
    const folderKey = prefix + name + "/";

    // Create an empty object with trailing slash (S3 folder convention)
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: folderKey,
      Body: "",
    });

    await s3Client.send(command);

    res.json({
      message: `Folder "${name}" created successfully`,
      key: folderKey,
    });
  } catch (error) {
    console.error("Create folder error:", error);
    res.status(500).json({ error: "Failed to create folder" });
  }
});

// ─── MOVE TO TRASH ───────────────────────────────────
router.post("/trash", isAuthenticated, async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: "File key is required" });
    }

    if (!isS3Configured) {
      return res.status(503).json({
        error: "AWS S3 is not configured.",
        hint: "Add AWS credentials to your .env file.",
      });
    }

    // Build the trash key by replacing /files/ with /trash/
    const trashKey = key.replace(
      `${req.user.id}/files/`,
      `${req.user.id}/trash/`
    );

    // Copy to trash
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/${key}`,
        Key: trashKey,
      })
    );

    // Delete original
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );

    res.json({ message: "File moved to trash" });
  } catch (error) {
    console.error("Trash error:", error);
    res.status(500).json({ error: "Failed to move file to trash" });
  }
});

// ─── RESTORE FROM TRASH ──────────────────────────────
router.post("/restore", isAuthenticated, async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: "File key is required" });
    }

    if (!isS3Configured) {
      return res.status(503).json({
        error: "AWS S3 is not configured.",
        hint: "Add AWS credentials to your .env file.",
      });
    }

    // Build the restored key by replacing /trash/ with /files/
    const restoredKey = key.replace(
      `${req.user.id}/trash/`,
      `${req.user.id}/files/`
    );

    // Copy back to files
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/${key}`,
        Key: restoredKey,
      })
    );

    // Delete from trash
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );

    res.json({ message: "File restored from trash" });
  } catch (error) {
    console.error("Restore error:", error);
    res.status(500).json({ error: "Failed to restore file" });
  }
});

// ─── STORAGE USAGE ───────────────────────────────────
router.get("/storage", isAuthenticated, async (req, res) => {
  try {
    if (!isS3Configured) {
      return res.json({
        used: 2415919104,  // ~2.3 GB demo
        limit: 16106127360, // 15 GB demo
        demoMode: true,
      });
    }

    const prefix = `${req.user.id}/`;
    let totalSize = 0;
    let continuationToken = undefined;

    // Paginate through all objects to sum sizes
    do {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const response = await s3Client.send(command);

      if (response.Contents) {
        for (const obj of response.Contents) {
          totalSize += obj.Size || 0;
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    res.json({
      used: totalSize,
      limit: 16106127360, // 15 GB
      demoMode: false,
    });
  } catch (error) {
    console.error("Storage usage error:", error);
    res.status(500).json({ error: "Failed to calculate storage" });
  }
});

module.exports = router;
