// ============================================
// Demo Data – Sample files and folders
// ============================================
// This is DEMO DATA for UI development only.
// No real files are stored anywhere.
// Real file storage (AWS S3) will be added in Phase 2.
// ============================================

const demoFiles = [
  {
    id: 1,
    name: "Project Proposal.pdf",
    type: "PDF",
    size: "2.4 MB",
    modified: "Oct 18, 2026",
    icon: "📄",
    isFolder: false,
  },
  {
    id: 2,
    name: "Design Assets",
    type: "Folder",
    size: "—",
    modified: "Oct 17, 2026",
    icon: "📁",
    isFolder: true,
  },
  {
    id: 3,
    name: "Meeting Notes.docx",
    type: "Document",
    size: "156 KB",
    modified: "Oct 16, 2026",
    icon: "📝",
    isFolder: false,
  },
  {
    id: 4,
    name: "Budget Spreadsheet.xlsx",
    type: "Spreadsheet",
    size: "1.1 MB",
    modified: "Oct 15, 2026",
    icon: "📊",
    isFolder: false,
  },
  {
    id: 5,
    name: "Photos",
    type: "Folder",
    size: "—",
    modified: "Oct 14, 2026",
    icon: "📁",
    isFolder: true,
  },
  {
    id: 6,
    name: "Presentation.pptx",
    type: "Presentation",
    size: "5.8 MB",
    modified: "Oct 13, 2026",
    icon: "📽️",
    isFolder: false,
  },
  {
    id: 7,
    name: "App Wireframes.fig",
    type: "Design",
    size: "3.2 MB",
    modified: "Oct 12, 2026",
    icon: "🎨",
    isFolder: false,
  },
  {
    id: 8,
    name: "Backup Archives",
    type: "Folder",
    size: "—",
    modified: "Oct 10, 2026",
    icon: "📁",
    isFolder: true,
  },
  {
    id: 9,
    name: "Team Photo.png",
    type: "Image",
    size: "4.7 MB",
    modified: "Oct 9, 2026",
    icon: "🖼️",
    isFolder: false,
  },
  {
    id: 10,
    name: "README.md",
    type: "Markdown",
    size: "8 KB",
    modified: "Oct 8, 2026",
    icon: "📄",
    isFolder: false,
  },
];

export default demoFiles;
