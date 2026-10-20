// ============================================
// Sidebar – Navigation panel (Complete)
// ============================================

import { useAuth } from "../context/AuthContext";
import { formatFileSize } from "../utils/format";
import "./Sidebar.css";

function Sidebar({
  activeNav,
  onNavChange,
  onUploadClick,
  onNewFolderClick,
  storageUsed,
  storageLimit,
}) {
  const { demoMode } = useAuth();

  const navItems = [
    { id: "my-files", label: "My Files", icon: "📁" },
    { id: "shared", label: "Shared with Me", icon: "👥" },
    { id: "recent", label: "Recent", icon: "🕐" },
    { id: "trash", label: "Trash", icon: "🗑️" },
  ];

  const usedPercent =
    storageLimit > 0 ? Math.round((storageUsed / storageLimit) * 100) : 0;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="logo-icon">☁️</span>
        <span className="logo-text">CloudBox</span>
      </div>

      {/* Action Buttons */}
      <div className="sidebar-actions">
        <button className="btn btn-upload" onClick={onUploadClick}>
          <span className="btn-icon">⬆️</span> Upload Files
        </button>
        <button className="btn btn-folder" onClick={onNewFolderClick}>
          <span className="btn-icon">➕</span> New Folder
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeNav === item.id ? "active" : ""}`}
            onClick={() => onNavChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Storage Indicator */}
      <div className="storage-indicator">
        <div className="storage-header">
          <span>Storage</span>
          <span>
            {formatFileSize(storageUsed)} of {formatFileSize(storageLimit)}
          </span>
        </div>
        <div className="storage-bar">
          <div
            className="storage-fill"
            style={{ width: `${Math.min(usedPercent, 100)}%` }}
          ></div>
        </div>
        {demoMode && (
          <p className="storage-note">Demo data — no real storage used</p>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
