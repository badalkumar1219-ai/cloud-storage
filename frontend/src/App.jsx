// ============================================
// App.jsx – Main CloudBox Application (with Sharing)
// ============================================

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import FileTable from "./components/FileTable";
import UploadArea from "./components/UploadArea";
import NewFolderModal from "./components/NewFolderModal";
import ShareModal from "./components/ShareModal";
import { ToastContainer } from "./components/Toast";
import Login from "./pages/Login";
import {
  listFiles,
  uploadFiles,
  downloadFile,
  moveToTrash,
  deleteFile,
  restoreFromTrash,
  createFolder,
  getStorageUsage,
  getSharedWithMe,
  downloadSharedFile,
} from "./services/api";
import "./App.css";

function App() {
  const { user, loading: authLoading, demoMode } = useAuth();

  // ─── State ──────────────────────────────────────────
  const [activeNav, setActiveNav] = useState("my-files");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState("");

  // Share state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [fileToShare, setFileToShare] = useState(null);

  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit, setStorageLimit] = useState(16106127360); // 15 GB

  const [toasts, setToasts] = useState([]);

  // ─── Helpers ────────────────────────────────────────
  function addToast(message, type = "info") {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
  }

  // ─── Load files when nav or folder changes ─────────
  const loadFiles = useCallback(async () => {
    setFilesLoading(true);
    try {
      if (activeNav === "shared") {
        // Load files shared with the current user
        const data = await getSharedWithMe();
        setFiles(data.files || []);
      } else {
        const section = activeNav === "trash" ? "trash" : "files";
        const data = await listFiles(section, currentFolder);
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error("Failed to load files:", err);
      addToast("Failed to load files: " + err.message, "error");
    } finally {
      setFilesLoading(false);
    }
  }, [activeNav, currentFolder]);

  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user, loadFiles]);

  // ─── Load storage usage ────────────────────────────
  useEffect(() => {
    if (!user) return;
    async function loadStorage() {
      try {
        const data = await getStorageUsage();
        setStorageUsed(data.used);
        setStorageLimit(data.limit);
      } catch (err) {
        console.error("Failed to load storage:", err);
      }
    }
    loadStorage();
  }, [user]);

  // ─── Page titles ───────────────────────────────────
  const pageTitles = {
    "my-files": "My Files",
    shared: "Shared with Me",
    recent: "Recent",
    trash: "Trash",
  };

  const pageSubtitles = {
    "my-files": "All your files and folders",
    shared: "Files shared with you by others",
    recent: "Recently accessed files",
    trash: "Deleted files — move to trash or restore",
  };

  // ─── File actions ──────────────────────────────────

  async function handleUpload(selectedFiles) {
    if (demoMode) {
      addToast("Configure AWS S3 credentials to enable uploads", "warning");
      return;
    }
    setUploading(true);
    try {
      const result = await uploadFiles(selectedFiles, currentFolder);
      addToast(result.message, "success");
      loadFiles();
    } catch (err) {
      addToast("Upload failed: " + err.message, "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(file) {
    // For shared files, use the share download endpoint
    if (activeNav === "shared" && file.shareId) {
      if (demoMode) {
        addToast("Configure AWS S3 credentials to enable downloads", "warning");
        return;
      }
      try {
        const data = await downloadSharedFile(file.shareId);
        window.open(data.url, "_blank");
      } catch (err) {
        addToast("Download failed: " + err.message, "error");
      }
      return;
    }

    if (demoMode) {
      addToast("Configure AWS S3 credentials to enable downloads", "warning");
      return;
    }
    try {
      const data = await downloadFile(file.key);
      window.open(data.url, "_blank");
    } catch (err) {
      addToast("Download failed: " + err.message, "error");
    }
  }

  async function handleMoveToTrash(file) {
    if (demoMode) {
      addToast("Configure AWS S3 credentials to enable trash", "warning");
      return;
    }
    try {
      await moveToTrash(file.key);
      addToast(`"${file.name}" moved to trash`, "success");
      loadFiles();
    } catch (err) {
      addToast("Failed to move to trash: " + err.message, "error");
    }
  }

  async function handleDelete(file) {
    if (demoMode) {
      addToast("Configure AWS S3 credentials to enable deletion", "warning");
      return;
    }
    if (!window.confirm(`Permanently delete "${file.name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteFile(file.key);
      addToast(`"${file.name}" deleted permanently`, "success");
      loadFiles();
    } catch (err) {
      addToast("Delete failed: " + err.message, "error");
    }
  }

  async function handleRestore(file) {
    if (demoMode) {
      addToast("Configure AWS S3 credentials to enable restore", "warning");
      return;
    }
    try {
      await restoreFromTrash(file.key);
      addToast(`"${file.name}" restored`, "success");
      loadFiles();
    } catch (err) {
      addToast("Restore failed: " + err.message, "error");
    }
  }

  async function handleCreateFolder(name) {
    if (demoMode) {
      addToast("Configure AWS S3 credentials to create folders", "warning");
      return;
    }
    try {
      await createFolder(name, currentFolder);
      addToast(`Folder "${name}" created`, "success");
      loadFiles();
    } catch (err) {
      addToast("Failed to create folder: " + err.message, "error");
      throw err;
    }
  }

  function handleFolderOpen(file) {
    const folderPath = file.key
      ? file.key.replace(`${user.id}/files/`, "")
      : file.name + "/";
    setCurrentFolder(folderPath);
  }

  function handleNavChange(nav) {
    setActiveNav(nav);
    setCurrentFolder("");
    setSidebarOpen(false);
  }

  // ─── Share actions ─────────────────────────────────

  function handleShare(file) {
    setFileToShare(file);
    setShareModalOpen(true);
  }

  // ─── Search filtering ─────────────────────────────
  const filteredFiles = searchQuery
    ? files.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : files;

  // Sort: folders first, then by name
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    return a.name.localeCompare(b.name);
  });

  // ─── Auth loading state ────────────────────────────
  if (authLoading) {
    return (
      <div className="app-loading">
        <span className="app-loading-icon">☁️</span>
        <p>Loading CloudBox…</p>
      </div>
    );
  }

  // ─── Not authenticated → show login ────────────────
  if (!user) {
    return <Login />;
  }

  // ─── Breadcrumb ────────────────────────────────────
  const breadcrumbs = currentFolder
    ? currentFolder.split("/").filter(Boolean)
    : [];

  // ─── Render dashboard ──────────────────────────────
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
      <Sidebar
        activeNav={activeNav}
        onNavChange={handleNavChange}
        onUploadClick={() => document.querySelector(".upload-area")?.click()}
        onNewFolderClick={() => setFolderModalOpen(true)}
        storageUsed={storageUsed}
        storageLimit={storageLimit}
      />

      {/* Main content */}
      <main className="main-content">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="content-area">
          {/* Page title */}
          <div className="page-header">
            <h1 className="page-title">{pageTitles[activeNav]}</h1>
            <p className="page-subtitle">{pageSubtitles[activeNav]}</p>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <div className="breadcrumbs">
                <button
                  className="breadcrumb-btn"
                  onClick={() => setCurrentFolder("")}
                >
                  📁 Root
                </button>
                {breadcrumbs.map((crumb, index) => (
                  <span key={index}>
                    <span className="breadcrumb-sep"> / </span>
                    <button
                      className="breadcrumb-btn"
                      onClick={() =>
                        setCurrentFolder(
                          breadcrumbs.slice(0, index + 1).join("/") + "/"
                        )
                      }
                    >
                      {crumb}
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Upload area (only on My Files) */}
          {activeNav === "my-files" && (
            <UploadArea onFilesSelected={handleUpload} uploading={uploading} />
          )}

          {/* Recent files notice */}
          {activeNav === "recent" && (
            <div className="feature-notice">
              <span>🕐</span>
              <div>
                <strong>Recent Files</strong>
                <p>
                  Shows your most recently modified files, sorted by date.
                </p>
              </div>
            </div>
          )}

          {/* File table */}
          <FileTable
            files={sortedFiles}
            loading={filesLoading}
            onFolderOpen={handleFolderOpen}
            onDownload={handleDownload}
            onMoveToTrash={handleMoveToTrash}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onShare={handleShare}
            activeNav={activeNav}
          />
        </div>
      </main>

      {/* New Folder Modal */}
      <NewFolderModal
        isOpen={folderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        onSubmit={handleCreateFolder}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        file={fileToShare}
        onClose={() => {
          setShareModalOpen(false);
          setFileToShare(null);
        }}
        onToast={addToast}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} setToasts={setToasts} />
    </div>
  );
}

export default App;
