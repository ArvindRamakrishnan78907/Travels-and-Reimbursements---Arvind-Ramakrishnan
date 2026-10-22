import React, { useState } from 'react';
import { FolderMinus } from 'lucide-react';
import { formatINR } from '../utils/formatCurrency';

export default function PendingReportsCard({ reportsData }) {
  const [activeTab, setActiveTab] = useState('reimbursements');

  const forApproval = reportsData?.forApproval || { count: 1, items: [] };
  const forReimbursements = reportsData?.forReimbursements || { totalAmount: 692658.00, items: [] };

  const activeItems = activeTab === 'reimbursements' ? forReimbursements.items : forApproval.items;

  return (
    <section className="dashboard-card pending-reports-card">
      <div className="card-header-row" style={{ marginBottom: '12px' }}>
        <div className="card-title-group">
          <FolderMinus size={18} className="card-icon" />
          <h2 className="card-title">PENDING REPORTS</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="reports-tab-bar">
        <button
          className={`tab-btn ${activeTab === 'approval' ? 'active' : ''}`}
          onClick={() => setActiveTab('approval')}
        >
          For Approval ({forApproval.count < 10 ? ` 0${forApproval.count} ` : ` ${forApproval.count} `} Report)
        </button>
        <button
          className={`tab-btn ${activeTab === 'reimbursements' ? 'active' : ''}`}
          onClick={() => setActiveTab('reimbursements')}
        >
          For Reimbursements ({formatINR(forReimbursements.totalAmount || 692658, { paise: true })})
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <span>USERNAME</span>
          <span>AMOUNT</span>
        </div>

        <div className="table-body">
          {activeItems && activeItems.length > 0 ? (
            activeItems.map((item) => (
              <div key={item.id} className="table-row">
                <div className="user-info-col">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="avatar-img"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%23e2e8f0"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="%23475569">${encodeURIComponent(item.name ? item.name.slice(0, 2).toUpperCase() : 'U')}</text></svg>`;
                    }}
                  />
                  <div className="user-text-meta">
                    <span className="user-name">{item.name}</span>
                    <span className="user-email">{item.email}</span>
                  </div>
                </div>

                <div className="amount-text">
                  {formatINR(item.amount, { paise: true })}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
              No reports in this queue.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
