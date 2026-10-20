// ============================================
// Format Utilities
// ============================================
// Helper functions for displaying file sizes,
// dates, and file type icons.
// ============================================

/**
 * Convert bytes to a human-readable size string.
 * Example: 1536000 → "1.5 MB"
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "—";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let size = bytes;

  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }

  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Format a date string to a short readable format.
 * Example: "2026-10-18T10:30:00Z" → "Oct 18, 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get a display-friendly file type from a MIME type or filename.
 */
export function getFileType(file) {
  if (file.isFolder) return "Folder";

  const ext = file.name?.split(".").pop()?.toLowerCase() || "";
  const typeMap = {
    pdf: "PDF",
    doc: "Document",
    docx: "Document",
    xls: "Spreadsheet",
    xlsx: "Spreadsheet",
    ppt: "Presentation",
    pptx: "Presentation",
    jpg: "Image",
    jpeg: "Image",
    png: "Image",
    gif: "Image",
    svg: "Image",
    webp: "Image",
    mp4: "Video",
    mov: "Video",
    avi: "Video",
    mp3: "Audio",
    wav: "Audio",
    zip: "Archive",
    rar: "Archive",
    "7z": "Archive",
    txt: "Text",
    md: "Markdown",
    js: "JavaScript",
    jsx: "JavaScript",
    ts: "TypeScript",
    tsx: "TypeScript",
    css: "Stylesheet",
    html: "HTML",
    json: "JSON",
    fig: "Design",
    sketch: "Design",
    psd: "Photoshop",
    ai: "Illustrator",
  };

  return typeMap[ext] || "File";
}

/**
 * Get an emoji icon for a file based on its type.
 */
export function getFileIcon(file) {
  if (file.isFolder) return "📁";

  const type = getFileType(file);
  const iconMap = {
    PDF: "📄",
    Document: "📝",
    Spreadsheet: "📊",
    Presentation: "📽️",
    Image: "🖼️",
    Video: "🎬",
    Audio: "🎵",
    Archive: "📦",
    Text: "📄",
    Markdown: "📄",
    JavaScript: "⚡",
    TypeScript: "⚡",
    Stylesheet: "🎨",
    HTML: "🌐",
    JSON: "📋",
    Design: "🎨",
    Photoshop: "🎨",
    Illustrator: "🎨",
  };

  return iconMap[type] || "📄";
}
