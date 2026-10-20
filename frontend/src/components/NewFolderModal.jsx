// ============================================
// NewFolderModal – Create a new folder
// ============================================

import { useState } from "react";
import "./NewFolderModal.css";

function NewFolderModal({ isOpen, onClose, onSubmit }) {
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    const name = folderName.trim();
    if (!name) return;

    setLoading(true);
    try {
      await onSubmit(name);
      setFolderName("");
      onClose();
    } catch (err) {
      // Error is handled by parent
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">📁 New Folder</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="modal-input"
            placeholder="Enter folder name…"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            autoFocus
            disabled={loading}
          />
          <div className="modal-actions">
            <button
              type="button"
              className="modal-btn modal-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-btn modal-btn-create"
              disabled={!folderName.trim() || loading}
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewFolderModal;
