// ============================================
// App.jsx – Main CloudBox Application
// ============================================

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import FileTable from "./components/FileTable";
import UploadArea from "./components/UploadArea";
import demoFiles from "./data/demoFiles";
import "./App.css";

function App() {
  const [activeNav, setActiveNav] = useState("my-files");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Map nav IDs to page titles
  const pageTitles = {
    "my-files": "My Files",
    shared: "Shared with Me",
    recent: "Recent",
    trash: "Trash",
    storage: "Storage",
  };

  return (
    <div className={`app-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      {/* Main content */}
      <main className="main-content">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="content-area">
          {/* Page title */}
          <div className="page-header">
            <h1 className="page-title">{pageTitles[activeNav]}</h1>
            <p className="page-subtitle">
              {activeNav === "my-files" && "All your files and folders"}
              {activeNav === "shared" && "Files shared with you by others"}
              {activeNav === "recent" && "Recently accessed files"}
              {activeNav === "trash" && "Deleted files (auto-removed after 30 days)"}
              {activeNav === "storage" && "Manage your storage usage"}
            </p>
          </div>

          {/* Upload area */}
          <UploadArea />

          {/* File table */}
          <FileTable files={demoFiles} />
        </div>
      </main>
    </div>
  );
}

export default App;
