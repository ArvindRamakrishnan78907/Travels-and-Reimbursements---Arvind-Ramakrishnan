import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck, DollarSign } from 'lucide-react';

export default function SettingsView({ onNotification }) {
  const [currency, setCurrency] = useState('USD');
  const [dailyMealCap, setDailyMealCap] = useState('75.00');
  const [mileageRate, setMileageRate] = useState('0.67');
  const [requireReceiptAbove, setRequireReceiptAbove] = useState('25.00');
  const [managerApprovalThreshold, setManagerApprovalThreshold] = useState('5000.00');
  const [autoApproveLimit, setAutoApproveLimit] = useState('50.00');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.currency) setCurrency(data.currency);
          if (data.dailyMealCap) setDailyMealCap(String(data.dailyMealCap));
          if (data.mileageRate) setMileageRate(String(data.mileageRate));
          if (data.requireReceiptAbove) setRequireReceiptAbove(String(data.requireReceiptAbove));
          if (data.managerApprovalThreshold) setManagerApprovalThreshold(String(data.managerApprovalThreshold));
          if (data.autoApproveLimit) setAutoApproveLimit(String(data.autoApproveLimit));
        }
      })
      .catch(err => console.error('Failed to load settings:', err));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency,
          dailyMealCap: parseFloat(dailyMealCap),
          mileageRate: parseFloat(mileageRate),
          requireReceiptAbove: parseFloat(requireReceiptAbove),
          managerApprovalThreshold: parseFloat(managerApprovalThreshold),
          autoApproveLimit: parseFloat(autoApproveLimit)
        })
      });
      const data = await res.json();
      if (data.success && onNotification) {
        onNotification('Organization policy and currency settings saved to database successfully!');
      }
    } catch (err) {
      alert('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="section-view-container">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <h2>Organization Policies & Settings</h2>
          <p>Configure company expense guidelines, per-diem caps, multi-currency, and approval rules</p>
        </div>
        <div className="section-header-actions">
          <button className="btn-primary-action" onClick={handleSave} disabled={isSaving}>
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="settings-form-layout">
        {/* Card 1: Expense Policy Caps */}
        <div className="settings-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Expense Policy Rules</h3>
          </div>

          <div className="form-group-item">
            <label>Receipt Mandatory Threshold ($)</label>
            <input
              type="number"
              step="0.01"
              className="form-control-input"
              value={requireReceiptAbove}
              onChange={(e) => setRequireReceiptAbove(e.target.value)}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Claims exceeding this dollar amount must attach a verified invoice/receipt.
            </span>
          </div>

          <div className="form-group-item">
            <label>Daily Meal Per-Diem Cap ($)</label>
            <input
              type="number"
              step="0.01"
              className="form-control-input"
              value={dailyMealCap}
              onChange={(e) => setDailyMealCap(e.target.value)}
            />
          </div>

          <div className="form-group-item">
            <label>Standard Mileage Rate ($ per mile)</label>
            <input
              type="number"
              step="0.01"
              className="form-control-input"
              value={mileageRate}
              onChange={(e) => setMileageRate(e.target.value)}
            />
          </div>
        </div>

        {/* Card 2: Currency & Approval Hierarchy */}
        <div className="settings-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <DollarSign size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Currency & Approvals</h3>
          </div>

          <div className="form-group-item">
            <label>Primary Accounting Currency</label>
            <select
              className="form-control-input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD - United States Dollar ($)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="GBP">GBP - British Pound (£)</option>
              <option value="SGD">SGD - Singapore Dollar (S$)</option>
              <option value="INR">INR - Indian Rupee (₹)</option>
            </select>
          </div>

          <div className="form-group-item">
            <label>Multi-Tier Manager Approval Threshold ($)</label>
            <input
              type="number"
              step="0.01"
              className="form-control-input"
              value={managerApprovalThreshold}
              onChange={(e) => setManagerApprovalThreshold(e.target.value)}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Claims above this limit require Department Head + Finance Director sign-off.
            </span>
          </div>

          <div className="form-group-item">
            <label>Automatic OCR Auto-Approve Limit ($)</label>
            <input
              type="number"
              step="0.01"
              className="form-control-input"
              value={autoApproveLimit}
              onChange={(e) => setAutoApproveLimit(e.target.value)}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Low-risk Uber / transit receipts below this amount skip manual approval queues.
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
