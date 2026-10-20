import { formatDate, formatFileSize, getFileIcon } from "../utils/format";
import "./DashboardOverview.css";

function DashboardOverview({
  files,
  storageUsed,
  storageLimit,
  onViewRecent,
}) {
  const usedPercent =
    storageLimit > 0
      ? Math.min((storageUsed / storageLimit) * 100, 100)
      : 0;
  const recentFiles = [...files]
    .filter((file) => !file.isFolder)
    .sort(
      (a, b) =>
        new Date(b.lastModified || 0).getTime() -
        new Date(a.lastModified || 0).getTime()
    )
    .slice(0, 4);

  return (
    <section className="dashboard-overview" aria-label="Storage and recent activity">
      <article className="overview-card storage-summary">
        <div className="overview-card-heading">
          <span className="overview-icon" aria-hidden="true">☁️</span>
          <div>
            <h2>Storage overview</h2>
            <p>Your CloudBox space</p>
          </div>
        </div>
        <div className="storage-summary-total">
          <strong>{formatFileSize(storageUsed)}</strong>
          <span>of {formatFileSize(storageLimit)} used</span>
        </div>
        <div
          className="overview-progress"
          role="progressbar"
          aria-label="Storage used"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(usedPercent)}
        >
          <span style={{ width: `${usedPercent}%` }} />
        </div>
        <p className="storage-summary-note">
          {Math.max(storageLimit - storageUsed, 0) > 0
            ? `${formatFileSize(Math.max(storageLimit - storageUsed, 0))} available`
            : "Storage limit reached"}
        </p>
      </article>

      <article className="overview-card recent-activity">
        <div className="recent-activity-heading">
          <div>
            <h2>Recent activity</h2>
            <p>Your latest updated files</p>
          </div>
          <button type="button" onClick={onViewRecent}>
            View all
          </button>
        </div>
        {recentFiles.length > 0 ? (
          <ul className="recent-activity-list">
            {recentFiles.map((file) => (
              <li key={file.id}>
                <span className="recent-file-icon" aria-hidden="true">
                  {getFileIcon(file)}
                </span>
                <div className="recent-file-details">
                  <span className="recent-file-name" title={file.name}>
                    {file.name}
                  </span>
                  <span className="recent-file-meta">
                    {formatDate(file.lastModified)} · {formatFileSize(file.size)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="recent-activity-empty">No recent files to show yet.</p>
        )}
      </article>
    </section>
  );
}

export default DashboardOverview;
