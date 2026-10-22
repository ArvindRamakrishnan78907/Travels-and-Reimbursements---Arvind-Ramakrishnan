import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import Modal from '../Modal';

export default function BudgetsView({ onNotification }) {
  const [budgets, setBudgets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [department, setDepartment] = useState('');
  const [allocated, setAllocated] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBudgets = async () => {
    try {
      const res = await fetch('/api/budgets');
      if (res.ok) {
        const data = await res.json();
        setBudgets(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!department || !allocated) {
      alert('Please fill department and allocated budget');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department,
          allocated: parseFloat(allocated),
          color
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setDepartment('');
        setAllocated('');
        fetchBudgets();
        if (onNotification) onNotification(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create budget plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAllocated = budgets.reduce((sum, b) => sum + (b.allocated || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const overallPct = totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0;

  return (
    <div className="section-view-container">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <h2>Department Budgets (Fiscal 2026-2027)</h2>
          <p>Track allocation caps, real-time burn rate, and projected end-of-year variance</p>
        </div>
        <div className="section-header-actions">
          <button className="btn-primary-action" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add Budget Plan
          </button>
        </div>
      </div>

      <div className="stats-summary-grid">
        <div className="stat-metric-card">
          <span className="stat-metric-title">Total Allocated Budget</span>
          <span className="stat-metric-num">${totalAllocated.toLocaleString()}</span>
          <span className="stat-metric-sub">Across {budgets.length} Cost Centers</span>
        </div>
        <div className="stat-metric-card">
          <span className="stat-metric-title">Actual Spend YTD</span>
          <span className="stat-metric-num">${totalSpent.toLocaleString()}</span>
          <span className="stat-metric-sub">{overallPct}% Burn Rate</span>
        </div>
        <div className="stat-metric-card">
          <span className="stat-metric-title">Remaining Surplus</span>
          <span className="stat-metric-num">${(totalAllocated - totalSpent).toLocaleString()}</span>
          <span className="stat-metric-sub" style={{ color: '#10b981' }}>On target for Q4</span>
        </div>
      </div>

      <div className="budget-grid-list">
        {budgets.map((b) => {
          const pct = Math.round(((b.spent || 0) / (b.allocated || 1)) * 100);
          const isWarning = pct >= 90;
          return (
            <div key={b.department} className="budget-card-box">
              <div className="budget-card-header">
                <span className="budget-dept-title">{b.department}</span>
                {isWarning && (
                  <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.74rem', fontWeight: 700 }}>
                    <AlertTriangle size={14} /> Near Cap
                  </span>
                )}
              </div>

              <div className="budget-figures">
                <span>Spent: <strong>${(b.spent || 0).toLocaleString()}</strong></span>
                <span>Cap: <strong>${(b.allocated || 0).toLocaleString()}</strong></span>
              </div>

              <div className="budget-bar-bg">
                <div
                  className="budget-bar-fill"
                  style={{
                    width: `${pct}%`,
                    background: isWarning ? '#ef4444' : pct > 75 ? '#f59e0b' : b.color || '#3b82f6'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                <span style={{ fontWeight: 600, color: isWarning ? '#dc2626' : '#1e293b' }}>
                  {pct}% Utilized
                </span>
                <span>Remaining: ${((b.allocated || 0) - (b.spent || 0)).toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Department Budget Allocation"
      >
        <form onSubmit={handleAddBudget} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group-item">
            <label>Department / Cost Center *</label>
            <input
              type="text"
              required
              placeholder="e.g. AI Research & Innovation"
              className="form-control-input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <div className="form-group-item">
            <label>Allocated Annual Budget ($) *</label>
            <input
              type="number"
              required
              min="1000"
              placeholder="75000"
              className="form-control-input"
              value={allocated}
              onChange={(e) => setAllocated(e.target.value)}
            />
          </div>

          <div className="form-group-item">
            <label>Theme Tag Color</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              {['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((c) => (
                <button
                  key={c}
                  type="button"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '3px solid #0f172a' : '2px solid transparent',
                    cursor: 'pointer'
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
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
              {isSubmitting ? 'Creating...' : 'Create Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
