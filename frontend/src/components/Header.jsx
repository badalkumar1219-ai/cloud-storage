// ============================================
// Header – Top bar with search (Complete)
// ============================================

import { useAuth } from "../context/AuthContext";
import "./Header.css";

function Header({ onMenuToggle, searchQuery, onSearchChange }) {
  const { user, demoMode, logout } = useAuth();

  return (
    <header className="header">
      {/* Hamburger for mobile */}
      <button className="menu-toggle" onClick={onMenuToggle}>
        ☰
      </button>

      {/* Search Bar */}
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search files and folders…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            className="search-clear"
            onClick={() => onSearchChange("")}
          >
            ✕
          </button>
        )}
      </div>

      {/* Right actions */}
      <div className="header-actions">
        {demoMode && <span className="demo-badge">DEMO</span>}

        {/* User avatar / profile */}
        {user && (
          <div className="user-menu">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="avatar-img"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="avatar" title={user.name}>
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            <div className="user-dropdown">
              <p className="user-name">{user.name}</p>
              <p className="user-email">{user.email}</p>
              <hr className="user-divider" />
              <button className="logout-btn" onClick={logout}>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
