// ============================================
// FileTable – Displays files & folders (Complete)
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
              : "Upload files or create a folder to get started"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-table-wrapper">
      {/* Demo data banner */}
      {demoMode && (
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
            <th className="col-type">Type</th>
            <th className="col-size">Size</th>
            <th className="col-modified">Last Modified</th>
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
                  ) : (
                    <>
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
