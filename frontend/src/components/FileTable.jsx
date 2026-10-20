// ============================================
// FileTable – Displays files & folders
// ============================================

import "./FileTable.css";

function FileTable({ files }) {
  return (
    <div className="file-table-wrapper">
      {/* Demo data banner */}
      <div className="demo-banner">
        ℹ️ These files are <strong>demo data</strong> for preview purposes only.
        Real file storage will be available after AWS S3 integration in Phase 2.
      </div>

      <table className="file-table">
        <thead>
          <tr>
            <th className="col-name">Name</th>
            <th className="col-type">Type</th>
            <th className="col-size">Size</th>
            <th className="col-modified">Last Modified</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} className="file-row">
              <td className="col-name">
                <span className="file-icon">{file.icon}</span>
                <span className="file-name">{file.name}</span>
              </td>
              <td className="col-type">{file.type}</td>
              <td className="col-size">{file.size}</td>
              <td className="col-modified">{file.modified}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FileTable;
