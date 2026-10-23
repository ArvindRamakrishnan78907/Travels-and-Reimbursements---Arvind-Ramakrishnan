import UserAvatar from './UserAvatar';
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
                  <UserAvatar name={item.name} size={32} />
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
