// ============================================
// Sidebar – Navigation panel
// ============================================

import "./Sidebar.css";

function Sidebar({ activeNav, onNavChange }) {
  const navItems = [
    { id: "my-files", label: "My Files", icon: "📁" },
    { id: "shared", label: "Shared with Me", icon: "👥" },
    { id: "recent", label: "Recent", icon: "🕐" },
    { id: "trash", label: "Trash", icon: "🗑️" },
    { id: "storage", label: "Storage", icon: "💾" },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="logo-icon">☁️</span>
        <span className="logo-text">CloudBox</span>
      </div>

      {/* Action Buttons */}
      <div className="sidebar-actions">
        <button className="btn btn-upload">
          <span className="btn-icon">⬆️</span> Upload Files
        </button>
        <button className="btn btn-folder">
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
          <span>2.3 GB of 15 GB</span>
        </div>
        <div className="storage-bar">
          <div
            className="storage-fill"
            style={{ width: "15%" }}
          ></div>
        </div>
        <p className="storage-note">Demo data — no real storage used</p>
      </div>
    </aside>
  );
}

export default Sidebar;
