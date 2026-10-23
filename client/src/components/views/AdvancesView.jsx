import UserAvatar from '../UserAvatar';
import { safeFetch as fetch } from '../../utils/safeFetch.js';
import React, { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, CheckCircle2, Download } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import { formatINR } from '../../utils/formatCurrency';
import Modal from '../Modal';

export default function AdvancesView({ viewMode = 'admin', onNotification }) {
  const [advances, setAdvances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [employee, setEmployee] = useState(viewMode === 'my' ? 'Arvind' : '');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAdvances = async () => {
    try {
      const res = await fetch(`/api/advances?viewMode=${viewMode}`);
      if (res.ok) {
        const data = await res.json();
        setAdvances(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdvances();
    if (viewMode === 'my') setEmployee('Arvind');
  }, [viewMode]);

  const handleSettle = async (id) => {
    try {
      const res = await fetch(`/api/advances/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settlementStatus: 'settled' })
      });
      const data = await res.json();
      if (data.success) {
        setAdvances(advances.map(a => a.id === id ? { ...a, settlementStatus: 'settled' } : a));
        if (onNotification) onNotification(`Advance ${id} reconciled, settled, and saved!`);
      }
    } catch (err) {
      console.error(err);
      if (onNotification) onNotification('Failed to update advance on server');
    }
  };

  const handleExport = () => {
    exportToCSV('cash_advances_ledger', advances);
    if (onNotification) onNotification('Advances ledger CSV downloaded successfully!');
  };

  const handleDisburseAdvance = async (e) => {
    e.preventDefault();
    if (!employee || !amount) {
      alert('Please fill employee name and advance amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/advances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee,
          amount: parseFloat(amount),
          purpose
        })
      });

      const result = await res.json();
      if (result.success) {
        setIsModalOpen(false);
        setAmount('');
        setPurpose('');
        fetchAdvances();
        if (onNotification) onNotification(result.message);
      }
    } catch (err) {
      alert('Failed to disburse advance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = advances.filter(a => {
    const matchesSearch = a.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.settlementStatus.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="section-view-container">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <h2>Cash Advances Ledger {viewMode === 'my' ? '(My Advances)' : '(Company Wide)'}</h2>
          <p>Track prepaid employee disbursements, travel advances, and balance settlements</p>
        </div>
        <div className="section-header-actions">
          <button className="btn-secondary-action" onClick={handleExport}>
            <Download size={15} /> Export CSV
          </button>
          <button className="btn-primary-action" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Disburse Advance
          </button>
        </div>
      </div>

      <div className="stats-summary-grid">
        <div className="stat-metric-card">
          <span className="stat-metric-title">Total Outstanding Advances</span>
          <span className="stat-metric-num">
            {formatINR(advances.filter(a => a.settlementStatus === 'unsettled').reduce((sum, a) => sum + a.amount, 0), { paise: true })}
          </span>
          <span className="stat-metric-sub">{advances.length} Active accounts</span>
        </div>
        <div className="stat-metric-card">
          <span className="stat-metric-title">Unsettled Disbursed</span>
          <span className="stat-metric-num">{advances.filter(a => a.settlementStatus === 'unsettled').length}</span>
          <span className="stat-metric-sub" style={{ color: '#d97706' }}>Action Required</span>
        </div>
        <div className="stat-metric-card">
          <span className="stat-metric-title">Settlement Turnaround</span>
          <span className="stat-metric-num">91.8%</span>
          <span className="stat-metric-sub">Avg 12 days SLA</span>
        </div>
      </div>

      <div className="data-table-card">
        <div className="table-toolbar">
          <div className="search-box-input">
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search employee, advance ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Segmented Status Filters with Live Badges */}
          <div className="status-segments" style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
            {[
              { id: 'ALL', label: 'All Advances', count: advances.length },
              { id: 'UNSETTLED', label: 'Unsettled', count: advances.filter(a => a.settlementStatus === 'unsettled').length },
              { id: 'SETTLED', label: 'Settled', count: advances.filter(a => a.settlementStatus === 'settled').length }
            ].map(seg => (
              <button
                key={seg.id}
                type="button"
                onClick={() => setStatusFilter(seg.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: statusFilter === seg.id ? 700 : 500,
                  background: statusFilter === seg.id ? '#ffffff' : 'transparent',
                  color: statusFilter === seg.id ? '#0f172a' : '#64748b',
                  boxShadow: statusFilter === seg.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <span>{seg.label}</span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  background: statusFilter === seg.id ? '#0f172a' : '#cbd5e1',
                  color: '#ffffff'
                }}>
                  {seg.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <table className="modern-table">
          <thead>
            <tr>
              <th>Advance ID</th>
              <th>Employee</th>
              <th>Purpose</th>
              <th>Issued Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.id}</td>
                  <td>
                    <div className="user-info-col">
                      <UserAvatar name={item.employee} size={30} />
                      <div className="user-text-meta">
                        <span className="user-name">{item.employee}</span>
                        <span className="user-email">{item.email}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#334155' }}>{item.purpose}</td>
                  <td style={{ color: '#64748b', fontSize: '0.84rem' }}>{item.issuedDate}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{formatINR(item.amount, { paise: true })}</td>
                  <td>
                    <span className={`badge-pill ${item.settlementStatus}`}>
                      {item.settlementStatus.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {item.settlementStatus === 'unsettled' ? (
                      <button
                        className="btn-primary-action"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => handleSettle(item.id)}
                      >
                        <CheckCircle2 size={13} /> Reconcile
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Settled</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  No cash advances found matching status filter "{statusFilter}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Disburse Advance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Disburse New Cash Advance"
      >
        <form onSubmit={handleDisburseAdvance} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group-item">
            <label>Employee Name *</label>
            <input
              type="text"
              required
              className="form-control-input"
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
            />
          </div>

          <div className="form-group-item">
            <label>Advance Amount (₹) *</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="25000.00"
              className="form-control-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="form-group-item">
            <label>Purpose of Advance</label>
            <input
              type="text"
              placeholder="e.g. Travel per-diem and cab fare for client visit"
              className="form-control-input"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
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
              {isSubmitting ? 'Disbursing...' : 'Disburse Cash Advance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
