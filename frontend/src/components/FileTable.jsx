// ============================================
// FileTable – Displays files & folders (with Sharing)
// ============================================

import { formatFileSize, formatDate, getFileType, getFileIcon } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import "./FileTable.css";

function FileTable({
  files,
  loading,
  onFolderOpen,
  onDownload,
  onMoveToTrash,
  onDelete,
  onRestore,
  onShare,
  activeNav,
}) {
  const { demoMode } = useAuth();

  if (loading) {
    return (
      <div className="file-table-wrapper">
        <div className="file-loading">
          <div className="spinner"></div>
          <p>Loading files…</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="file-table-wrapper">
        <div className="file-empty">
          <span className="empty-icon">📂</span>
          <h3>No files here</h3>
          <p>
            {activeNav === "trash"
              ? "Your trash is empty"
              : activeNav === "shared"
              ? "No files have been shared with you yet"
              : "Upload files or create a folder to get started"}
          </p>
        </div>
      </div>
    );
  }

  // "Shared with Me" view has extra columns
  const isSharedView = activeNav === "shared";

  return (
    <div className="file-table-wrapper">
      {/* Demo data banner */}
      {demoMode && activeNav !== "shared" && (
        <div className="demo-banner">
          ℹ️ These files are <strong>demo data</strong> for preview purposes.
          Configure AWS S3 in your <code>.env</code> file to enable real file
          storage.
        </div>
      )}

      <table className="file-table">
        <thead>
          <tr>
            <th className="col-name">Name</th>
            {isSharedView && <th className="col-shared-by">Shared By</th>}
            <th className="col-type">Type</th>
            <th className="col-size">Size</th>
            <th className="col-modified">
              {isSharedView ? "Shared On" : "Last Modified"}
            </th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr
              key={file.id}
              className="file-row"
              onDoubleClick={() => file.isFolder && onFolderOpen?.(file)}
            >
              <td className="col-name">
                <span className="file-icon">{getFileIcon(file)}</span>
                <span
                  className={`file-name ${file.isFolder ? "folder-name" : ""}`}
                  onClick={() => file.isFolder && onFolderOpen?.(file)}
                >
                  {file.name}
                </span>
              </td>
              {isSharedView && (
                <td className="col-shared-by">
                  <div className="shared-by-info">
                    {file.sharedByAvatar ? (
                      <img
                        src={file.sharedByAvatar}
                        alt=""
                        className="shared-by-avatar"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="shared-by-icon">👤</span>
                    )}
                    <span>{file.sharedBy}</span>
                  </div>
                </td>
              )}
              <td className="col-type">{getFileType(file)}</td>
              <td className="col-size">{formatFileSize(file.size)}</td>
              <td className="col-modified">{formatDate(file.lastModified)}</td>
              <td className="col-actions">
                <div className="action-buttons">
                  {activeNav === "trash" ? (
                    <>
                      <button
                        className="action-btn restore-btn"
                        title="Restore"
                        onClick={() => onRestore?.(file)}
                      >
                        ♻️
                      </button>
                      <button
                        className="action-btn delete-btn"
                        title="Delete permanently"
                        onClick={() => onDelete?.(file)}
                      >
                        🗑️
                      </button>
                    </>
                  ) : isSharedView ? (
                    <>
                      {file.permission === "download" && (
                        <button
                          className="action-btn download-btn"
                          title="Download"
                          onClick={() => onDownload?.(file)}
                        >
                          ⬇️
                        </button>
                      )}
                      <span className="permission-badge">
                        {file.permission === "download" ? "📥" : "👁️"}
                      </span>
                    </>
                  ) : (
                    <>
                      {!file.isFolder && (
                        <button
                          className="action-btn share-btn"
                          title="Share"
                          onClick={() => onShare?.(file)}
                        >
                          🔗
                        </button>
                      )}
                      {!file.isFolder && (
                        <button
                          className="action-btn download-btn"
                          title="Download"
                          onClick={() => onDownload?.(file)}
                        >
                          ⬇️
                        </button>
                      )}
                      <button
                        className="action-btn trash-btn"
                        title="Move to trash"
                        onClick={() => onMoveToTrash?.(file)}
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FileTable;
