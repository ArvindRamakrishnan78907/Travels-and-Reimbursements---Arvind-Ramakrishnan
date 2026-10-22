import React from 'react';
import { Briefcase } from 'lucide-react';

export default function PendingTripsCard({ trips, onApproveTrip }) {
  return (
    <section className="dashboard-card pending-trips-card">
      <div className="card-header-row">
        <div className="card-title-group">
          <Briefcase size={18} className="card-icon" />
          <h2 className="card-title">PENDING TRIPS</h2>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <span>APPROVER</span>
          <span>COUNT</span>
        </div>

        <div className="table-body">
          {trips && trips.length > 0 ? (
            trips.map((approver) => (
              <div key={approver.id} className="table-row">
                <div className="user-info-col">
                  <img
                    src={approver.avatar}
                    alt={approver.name}
                    className="avatar-img"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%23e2e8f0"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="%23475569">${encodeURIComponent(approver.name ? approver.name.slice(0, 2).toUpperCase() : 'U')}</text></svg>`;
                    }}
                  />
                  <div className="user-text-meta">
                    <span className="user-name">{approver.name}</span>
                    <span className="user-email">{approver.email}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="badge-count">{approver.count}</span>
                  {approver.count > 0 && onApproveTrip && (
                    <button
                      onClick={() => onApproveTrip(approver.id)}
                      title="Approve 1 pending trip"
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        background: '#edf4fe',
                        color: '#1b74e4',
                        borderRadius: '4px',
                        border: '1px solid #c7ddfc'
                      }}
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
              No pending trips.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
