// ============================================
// UploadArea – Drag-and-drop upload zone
// ============================================

import "./UploadArea.css";

function UploadArea() {
  return (
    <div className="upload-area">
      <div className="upload-icon">☁️</div>
      <h3 className="upload-title">Drop files here to upload</h3>
      <p className="upload-subtitle">
        or click <strong>Upload Files</strong> in the sidebar
      </p>
      <p className="upload-note">
        ⚠️ Upload functionality coming in Phase 2 (AWS S3 integration)
      </p>
    </div>
  );
}

export default UploadArea;
