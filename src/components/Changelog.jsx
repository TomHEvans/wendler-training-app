import React from 'react';

export default function Changelog({ logs }) {
  if (logs.length === 0) {
    return (
      <div className="fade-in">
        <h2 className="section-heading">Change Log</h2>
        <div className="card empty-state">
          <p>No changes recorded yet.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>
            All plan updates and completions will be logged here for full traceability.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h2 className="section-heading">Change Log</h2>
      <div className="card">
        {logs.map(log => (
          <div key={log.id} className="log-item">
            <div className="log-action">{log.action}</div>
            {log.details && <div className="log-details">{log.details}</div>}
            <div className="log-time">
              {formatDateTime(log.created_at)}
              {log.week_id && ` - ${log.week_id}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDateTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
