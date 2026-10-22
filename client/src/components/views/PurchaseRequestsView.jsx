import React, { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, XCircle, Download } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import Modal from '../Modal';

export default function PurchaseRequestsView({ viewMode = 'admin', onNotification }) {
  const [prs, setPrs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [item, setItem] = useState('');
  const [vendor, setVendor] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [requester, setRequester] = useState(viewMode === 'my' ? 'Arvind' : '');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPRs = async () => {
    try {
      const res = await fetch(`/api/purchaserequests?viewMode=${viewMode}`);
      if (res.ok) {
        const data = await res.json();
        setPrs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPRs();
    if (viewMode === 'my') setRequester('Arvind');
  }, [viewMode]);

  const handleAction = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/purchaserequests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setPrs(prs.map(p => p.id === id ? { ...p, status: newStatus } : p));
        if (onNotification) onNotification(`Purchase Request ${id} marked as ${newStatus} and saved!`);
      }
    } catch (err) {
      console.error(err);
      if (onNotification) onNotification('Failed to update purchase request on server');
    }
  };

  const handleExport = () => {
    exportToCSV('purchase_requests_ledger', prs);
    if (onNotification) onNotification('Purchase Requests CSV downloaded successfully!');
  };

  const handleCreatePR = async (e) => {
    e.preventDefault();
    if (!item || !amount) {
      alert('Please fill item description and amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/purchaserequests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item,
          vendor: vendor || 'Corporate Vendor',
          department,
          requester: requester || 'Arvind',
          amount: parseFloat(amount)
        })
      });

      const result = await res.json();
      if (result.success) {
        setIsModalOpen(false);
        setItem('');
        setVendor('');
        setAmount('');
        fetchPRs();
        if (onNotification) onNotification(result.message);
      }
    } catch (err) {
      alert('Failed to create purchase request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = prs.filter(p =>
    p.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="section-view-container">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <h2>Purchase Requests (PR / PO) {viewMode === 'my' ? '(My Requisitions)' : '(All Staff)'}</h2>
          <p>Procurement requisitions, vendor purchase orders, and budget sign-offs</p>
        </div>
        <div className="section-header-actions">
          <button className="btn-secondary-action" onClick={handleExport}>
            <Download size={15} /> Export CSV
          </button>
          <button className="btn-primary-action" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Create Purchase Request
          </button>
        </div>
      </div>

      <div className="stats-summary-grid">
        <div className="stat-metric-card">
          <span className="stat-metric-title">Open Requisitions</span>
          <span className="stat-metric-num">{prs.filter(p => p.status === 'pending').length}</span>
          <span className="stat-metric-sub">
            Total: ${prs.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="stat-metric-card">
          <span className="stat-metric-title">Approved POs</span>
          <span className="stat-metric-num">{prs.filter(p => p.status === 'approved').length}</span>
          <span className="stat-metric-sub">This Quarter</span>
        </div>
        <div className="stat-metric-card">
          <span className="stat-metric-title">Total PR Volume</span>
          <span className="stat-metric-num">
            ${prs.reduce((sum, p) => sum + p.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span className="stat-metric-sub">Across all requisitions</span>
        </div>
      </div>

      <div className="data-table-card">
        <div className="table-toolbar">
          <div className="search-box-input">
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search item, vendor, requester..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className="modern-table">
          <thead>
            <tr>
              <th>PR Number</th>
              <th>Item & Description</th>
              <th>Vendor</th>
              <th>Department</th>
              <th>Requester</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{p.id}</td>
                <td style={{ fontWeight: 600, color: '#1e293b' }}>{p.item}</td>
                <td style={{ color: '#475569' }}>{p.vendor}</td>
                <td>
                  <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                    {p.department}
                  </span>
                </td>
                <td>
                  <div className="user-info-col">
                    <img src={p.avatar} alt={p.requester} className="avatar-img" />
                    <span className="user-name">{p.requester}</span>
                  </div>
                </td>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>${p.amount.toFixed(2)}</td>
                <td>
                  <span className={`badge-pill ${p.status}`}>{p.status.toUpperCase()}</span>
                </td>
                <td>
                  {p.status === 'pending' && viewMode === 'admin' ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn-primary-action"
                        style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                        onClick={() => handleAction(p.id, 'approved')}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-secondary-action"
                        style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#dc2626' }}
                        onClick={() => handleAction(p.id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {p.status === 'approved' ? 'Approved' : 'Processed'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create PR Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Purchase Request (PR)"
      >
        <form onSubmit={handleCreatePR} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group-item">
            <label>Item Description / Service *</label>
            <input
              type="text"
              required
              placeholder="e.g. Developer Laptops Upgrade (5 Units)"
              className="form-control-input"
              value={item}
              onChange={(e) => setItem(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group-item">
              <label>Vendor / Supplier</label>
              <input
                type="text"
                placeholder="e.g. Apple Inc. / Dell"
                className="form-control-input"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />
            </div>
            <div className="form-group-item">
              <label>Department</label>
              <select
                className="form-control-input"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Engineering">Engineering</option>
                <option value="Product Design">Product Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group-item">
              <label>Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="2400.00"
                className="form-control-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="form-group-item">
              <label>Requester Name</label>
              <input
                type="text"
                className="form-control-input"
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn-secondary-action"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-action"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Submit Purchase Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
