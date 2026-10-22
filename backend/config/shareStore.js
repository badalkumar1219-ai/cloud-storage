// ============================================
// Share Store – JSON-based persistence
// ============================================
// Simple file-based data store for sharing records.
// Perfect for development; swap with a real database
// (MongoDB, PostgreSQL) for production.
// ============================================

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/shares.json");

/**
 * Read the entire store from disk.
 */
function readStore() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    // If file doesn't exist or is corrupt, return defaults
    return { shares: [], shareLinks: [] };
  }
}

/**
 * Write the entire store to disk.
 */
function writeStore(data) {
  const parentDir = path.dirname(DATA_FILE);

  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Get all shares.
 */
function getShares() {
  return readStore().shares;
}

/**
 * Get all share links.
 */
function getShareLinks() {
  return readStore().shareLinks;
}

/**
 * Add a new share record.
 */
function addShare(share) {
  const store = readStore();
  store.shares.push(share);
  writeStore(store);
  return share;
}

/**
 * Remove a share by ID.
 */
function removeShare(shareId) {
  const store = readStore();
  store.shares = store.shares.filter((s) => s.id !== shareId);
  writeStore(store);
}

/**
 * Add a new share link.
 */
function addShareLink(link) {
  const store = readStore();
  store.shareLinks.push(link);
  writeStore(store);
  return link;
}

/**
 * Remove a share link by ID.
 */
function removeShareLink(linkId) {
  const store = readStore();
  store.shareLinks = store.shareLinks.filter((l) => l.linkId !== linkId);
  writeStore(store);
}

module.exports = {
  getShares,
  getShareLinks,
  addShare,
  removeShare,
  addShareLink,
  removeShareLink,
};
