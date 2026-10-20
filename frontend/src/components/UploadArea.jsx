// ============================================
// UploadArea – Drag-and-drop upload (Complete)
// ============================================

import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import "./UploadArea.css";

function UploadArea({ onFilesSelected, uploading }) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { demoMode } = useAuth();

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }

  function handleClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    // Reset so the same file can be selected again
    e.target.value = "";
  }

  return (
    <div
      className={`upload-area ${dragOver ? "drag-over" : ""} ${
        uploading ? "uploading" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="upload-hidden-input"
        onChange={handleFileChange}
      />

      {uploading ? (
        <>
          <div className="upload-spinner"></div>
          <h3 className="upload-title">Uploading…</h3>
          <p className="upload-subtitle">Please wait while your files are being uploaded</p>
        </>
      ) : (
        <>
          <div className="upload-icon">☁️</div>
          <h3 className="upload-title">Drop files here to upload</h3>
          <p className="upload-subtitle">or click to browse your computer</p>
          {demoMode && (
            <p className="upload-note">
              ⚠️ Configure AWS S3 credentials to enable real uploads
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default UploadArea;
