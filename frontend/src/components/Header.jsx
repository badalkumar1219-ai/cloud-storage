// ============================================
// Header – Top bar with search
// ============================================

import "./Header.css";

function Header({ onMenuToggle }) {
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
        />
      </div>

      {/* Right actions */}
      <div className="header-actions">
        <button className="icon-btn" title="Grid view">⊞</button>
        <button className="icon-btn" title="Info">ℹ️</button>
        <div className="avatar" title="Account (Phase 2)">U</div>
      </div>
    </header>
  );
}

export default Header;
