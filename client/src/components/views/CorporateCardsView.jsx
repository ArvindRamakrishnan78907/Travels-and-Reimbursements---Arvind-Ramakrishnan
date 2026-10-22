import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, Lock, Unlock } from 'lucide-react';
import Modal from '../Modal';

export default function CorporateCardsView({ onNotification }) {
  const [cards, setCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [holder, setHolder] = useState('');
  const [title, setTitle] = useState('');
  const [limit, setLimit] = useState('10000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCards = async () => {
    try {
      const res = await fetch('/api/corporatecards');
      if (res.ok) {
        const data = await res.json();
        setCards(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleIssueCard = async (e) => {
    e.preventDefault();
    if (!holder || !limit) {
      alert('Please fill card holder and limit');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/corporatecards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holder,
          title: title || 'Executive Corporate Visa',
          limit: parseFloat(limit)
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setHolder('');
        setTitle('');
        fetchCards();
        if (onNotification) onNotification(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to issue card');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFreeze = async (cardId) => {
    try {
      const res = await fetch(`/api/corporatecards/${cardId}/toggle-status`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (data.success) {
        fetchCards();
        if (onNotification) onNotification(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalLimit = cards.reduce((sum, c) => sum + (c.limit || 0), 0);
  const totalSpent = cards.reduce((sum, c) => sum + (c.spent || 0), 0);

  return (
    <div className="section-view-container">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <h2>Corporate Cards & Banking Feed</h2>
          <p>Real-time corporate card transactions, spend caps, and card controls</p>
        </div>
        <div className="section-header-actions">
          <button className="btn-primary-action" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Issue Virtual Card
          </button>
        </div>
      </div>

      <div className="stats-summary-grid">
        <div className="stat-metric-card">
          <span className="stat-metric-title">Active Corporate Cards</span>
          <span className="stat-metric-num">{cards.length}</span>
          <span className="stat-metric-sub">Mastercard & Visa</span>
        </div>
        <div className="stat-metric-card">
          <span className="stat-metric-title">Total Credit Limit</span>
          <span className="stat-metric-num">${totalLimit.toLocaleString()}</span>
          <span className="stat-metric-sub">Available: ${(totalLimit - totalSpent).toLocaleString()}</span>
        </div>
        <div className="stat-metric-card">
          <span className="stat-metric-title">Total Card Spend</span>
          <span className="stat-metric-num">${totalSpent.toLocaleString()}</span>
          <span className="stat-metric-sub" style={{ color: '#10b981' }}>Reconciled & active</span>
        </div>
      </div>

      <div className="budget-grid-list">
        {cards.map((c) => {
          const pct = Math.round(((c.spent || 0) / (c.limit || 1)) * 100);
          const isFrozen = c.status === 'frozen';
          return (
            <div key={c.id} className="budget-card-box" style={{ opacity: isFrozen ? 0.7 : 1 }}>
              <div className="budget-card-header">
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{c.holder}</div>
                  <div className="budget-dept-title">{c.title}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CreditCard size={22} color={isFrozen ? '#94a3b8' : 'var(--primary)'} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>•••• {c.last4}</span>
                </div>
              </div>

              <div className="budget-figures">
                <span>Spent: <strong>${(c.spent || 0).toLocaleString()}</strong></span>
                <span>Limit: <strong>${(c.limit || 0).toLocaleString()}</strong></span>
              </div>

              <div className="budget-bar-bg">
                <div
                  className="budget-bar-fill"
                  style={{
                    width: `${pct}%`,
                    background: isFrozen ? '#94a3b8' : pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#10b981'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                <span style={{ color: isFrozen ? '#ef4444' : pct > 80 ? '#dc2626' : '#64748b', fontWeight: 600 }}>
                  {isFrozen ? 'CARD FROZEN' : `${pct}% of limit utilized`}
                </span>
                <button
                  className="btn-secondary-action"
                  style={{ padding: '3px 8px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => handleToggleFreeze(c.id)}
                >
                  {isFrozen ? <Unlock size={12} /> : <Lock size={12} />}
                  <span>{isFrozen ? 'Unfreeze' : 'Freeze'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Issue Virtual Card Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issue New Virtual Corporate Card"
      >
        <form onSubmit={handleIssueCard} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group-item">
            <label>Cardholder Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Arvind"
              className="form-control-input"
              value={holder}
              onChange={(e) => setHolder(e.target.value)}
            />
          </div>

          <div className="form-group-item">
            <label>Card Purpose / Title</label>
            <input
              type="text"
              placeholder="e.g. Travel & Client Entertainment Visa"
              className="form-control-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group-item">
            <label>Monthly Spending Limit ($) *</label>
            <input
              type="number"
              required
              min="500"
              placeholder="10000"
              className="form-control-input"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
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
              {isSubmitting ? 'Issuing...' : 'Issue Card'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
