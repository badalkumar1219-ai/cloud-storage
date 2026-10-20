// ============================================
// ShareModal – Share a file by email or link
// ============================================

import { useState, useEffect } from "react";
import {
  shareFile,
  createShareLink,
  getFileShares,
  removeShare,
  deleteShareLink,
} from "../services/api";
import "./ShareModal.css";

function ShareModal({ isOpen, file, onClose, onToast }) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("download");
  const [loading, setLoading] = useState(false);

  // Existing shares & links for this file
  const [shares, setShares] = useState([]);
  const [links, setLinks] = useState([]);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Load existing shares when modal opens
  useEffect(() => {
    if (isOpen && file) {
      loadFileShares();
      setEmail("");
      setShareLink("");
      setCopied(false);
    }
  }, [isOpen, file]);

  async function loadFileShares() {
    try {
      const data = await getFileShares(file.key);
      setShares(data.shares || []);
      setLinks(data.links || []);
    } catch (err) {
      // Not critical – just means we can't show existing shares
      console.error("Failed to load shares:", err);
    }
  }

  // ─── Share by email ─────────────────────────
  async function handleShareByEmail(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      await shareFile({
        fileKey: file.key,
        fileName: file.name,
        fileSize: file.size,
        recipientEmail: trimmed,
        permission,
      });
      onToast(`Shared "${file.name}" with ${trimmed}`, "success");
      setEmail("");
      loadFileShares(); // Refresh the list
    } catch (err) {
      onToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // ─── Create share link ──────────────────────
  async function handleCreateLink() {
    setLoading(true);
    try {
      const data = await createShareLink({
        fileKey: file.key,
        fileName: file.name,
        fileSize: file.size,
        permission,
      });
      setShareLink(data.url);
      loadFileShares();
      onToast("Share link created!", "success");
    } catch (err) {
      onToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // ─── Copy link to clipboard ────────────────
  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onToast("Link copied to clipboard!", "success");
    } catch {
      onToast("Failed to copy link", "error");
    }
  }

  // ─── Remove a share ────────────────────────
  async function handleRemoveShare(shareId, recipientEmail) {
    try {
      await removeShare(shareId);
      onToast(`Removed access for ${recipientEmail}`, "success");
      loadFileShares();
    } catch (err) {
      onToast(err.message, "error");
    }
  }

  // ─── Delete a link ─────────────────────────
  async function handleDeleteLink(linkId) {
    try {
      await deleteShareLink(linkId);
      onToast("Share link deleted", "success");
      setShareLink("");
      loadFileShares();
    } catch (err) {
      onToast(err.message, "error");
    }
  }

  if (!isOpen || !file) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="share-header">
          <h2>🔗 Share "{file.name}"</h2>
          <button className="share-close" onClick={onClose}>✕</button>
        </div>

        {/* Share by email */}
        <div className="share-section">
          <h3>Share with people</h3>
          <form className="share-email-form" onSubmit={handleShareByEmail}>
            <input
              type="email"
              className="share-email-input"
              placeholder="Enter email address…"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <select
              className="share-permission"
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
            >
              <option value="download">Can download</option>
              <option value="view">View only</option>
            </select>
            <button
              type="submit"
              className="share-send-btn"
              disabled={!email.trim() || loading}
            >
              {loading ? "…" : "Share"}
            </button>
          </form>
        </div>

        {/* People with access */}
        {shares.length > 0 && (
          <div className="share-section">
            <h3>People with access</h3>
            <ul className="share-people-list">
              {shares.map((s) => (
                <li key={s.id} className="share-person">
                  <div className="share-person-info">
                    <span className="share-person-icon">👤</span>
                    <div>
                      <p className="share-person-email">{s.sharedWithEmail}</p>
                      <p className="share-person-perm">
                        {s.permission === "download" ? "Can download" : "View only"}
                      </p>
                    </div>
                  </div>
                  <button
                    className="share-remove-btn"
                    onClick={() => handleRemoveShare(s.id, s.sharedWithEmail)}
                    title="Remove access"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Divider */}
        <hr className="share-divider" />

        {/* Share link */}
        <div className="share-section">
          <h3>Get a shareable link</h3>

          {links.length > 0 ? (
            <div className="share-existing-links">
              {links.map((l) => (
                <div key={l.linkId} className="share-link-row">
                  <input
                    type="text"
                    className="share-link-display"
                    value={`${window.location.origin}/api/share/link/${l.linkId}`}
                    readOnly
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    className="share-copy-btn"
                    onClick={() => {
                      const url = `${window.location.origin}/api/share/link/${l.linkId}`;
                      navigator.clipboard.writeText(url);
                      onToast("Link copied!", "success");
                    }}
                  >
                    📋
                  </button>
                  <button
                    className="share-delete-link-btn"
                    onClick={() => handleDeleteLink(l.linkId)}
                    title="Delete link"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : shareLink ? (
            <div className="share-link-row">
              <input
                type="text"
                className="share-link-display"
                value={shareLink}
                readOnly
                onClick={(e) => e.target.select()}
              />
              <button
                className="share-copy-btn"
                onClick={handleCopyLink}
              >
                {copied ? "✅" : "📋"}
              </button>
            </div>
          ) : (
            <button
              className="share-create-link-btn"
              onClick={handleCreateLink}
              disabled={loading}
            >
              🔗 Create link
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
