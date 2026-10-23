import UserAvatar from './UserAvatar';
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
                  <UserAvatar name={approver.name} size={32} />
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
