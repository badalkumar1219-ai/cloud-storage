// ============================================
// API Service – Centralized HTTP calls
// ============================================
// All backend requests go through this module.
// Uses relative URLs (Vite proxy handles routing).
// ============================================

const API_BASE = "/api";

/**
 * Generic fetch wrapper with JSON handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    credentials: "include", // send cookies for session auth
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Remove Content-Type for FormData (browser sets it automatically)
  if (options.body instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || error.message || "Request failed");
  }

  return response.json();
}

// ─── Auth ─────────────────────────────────────────────

export function getMe() {
  return request("/auth/me");
}

export function logout() {
  return request("/auth/logout", { method: "POST" });
}

export function getGoogleAuthUrl() {
  return "/api/auth/google";
}

// ─── Files ────────────────────────────────────────────

export function listFiles(section = "files", folder = "") {
  const params = new URLSearchParams({ section, folder });
  return request(`/files?${params}`);
}

export function uploadFiles(files, folder = "") {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  formData.append("folder", folder);

  return request("/files/upload", {
    method: "POST",
    body: formData,
  });
}

export function downloadFile(key) {
  return request(`/files/download?key=${encodeURIComponent(key)}`);
}

export function deleteFile(key) {
  return request(`/files?key=${encodeURIComponent(key)}`, {
    method: "DELETE",
  });
}

export function createFolder(name, parentFolder = "") {
  return request("/files/folder", {
    method: "POST",
    body: JSON.stringify({ name, parentFolder }),
  });
}

export function moveToTrash(key) {
  return request("/files/trash", {
    method: "POST",
    body: JSON.stringify({ key }),
  });
}

export function restoreFromTrash(key) {
  return request("/files/restore", {
    method: "POST",
    body: JSON.stringify({ key }),
  });
}

export function getStorageUsage() {
  return request("/files/storage");
}

// ─── Health ───────────────────────────────────────────

export function healthCheck() {
  return request("/health");
}
