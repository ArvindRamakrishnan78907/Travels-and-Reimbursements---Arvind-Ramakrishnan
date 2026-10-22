import React from 'react';
import { TrendingDown, Download } from 'lucide-react';
import { exportToPDF } from '../../utils/exportUtils';

export default function AnalyticsView({ onNotification }) {
  const categories = [
    { name: 'Flights & Airfare', pct: 38, amount: 64200, color: '#1b74e4' },
    { name: 'Lodging & Hotels', pct: 29, amount: 49100, color: '#10b981' },
    { name: 'Client Dinners & Meals', pct: 18, amount: 30400, color: '#f59e0b' },
    { name: 'Ground Transit & Rental', pct: 10, amount: 16900, color: '#8b5cf6' },
    { name: 'Conferences & Subscriptions', pct: 5, amount: 8450, color: '#ec4899' },
  ];

  const topSpenders = [
    { name: 'Aditya Verma', dept: 'Executive', amount: 18500, trips: 6 },
    { name: 'Manoj Raghavan', dept: 'Sales', amount: 14200, trips: 5 },
    { name: 'Karthik Kumar', dept: 'Engineering', amount: 9800, trips: 4 },
    { name: 'Sneha Kulkarni', dept: 'Partnerships', amount: 8400, trips: 3 },
  ];

  const handleExportPDF = () => {
    exportToPDF('Executive Spend Analytics Deck - Zylker Enterprise');
    if (onNotification) onNotification('Opening printable PDF Executive Deck...');
  };

  return (
    <div className="section-view-container">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <h2>Spend Analytics & Insights</h2>
          <p>Multi-dimensional analysis of enterprise travel and operational spend patterns</p>
        </div>
        <div className="section-header-actions">
          <button className="btn-primary-action" onClick={handleExportPDF}>
            <Download size={15} /> Export PDF Report
          </button>
        </div>
      </div>

      <div className="stats-summary-grid">
        <div className="stat-metric-card">
          <span className="stat-metric-title">Average Cost Per Trip</span>
          <span className="stat-metric-num">$1,480</span>
          <span className="stat-metric-sub" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrendingDown size={14} /> -4.2% vs last quarter
          </span>
        </div>
        <div className="stat-metric-card">
          <span className="stat-metric-title">Out-of-Policy Spend</span>
          <span className="stat-metric-num">1.8%</span>
          <span className="stat-metric-sub">Target: &lt; 3.0%</span>
        </div>
        <div className="stat-metric-card">
          <span className="stat-metric-title">Automated Receipt Match</span>
          <span className="stat-metric-num">89.4%</span>
          <span className="stat-metric-sub">Via OCR Assistant</span>
        </div>
      </div>

      {/* Grid: Category Breakdown and Top Spenders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Category Breakdown */}
        <div className="data-table-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '18px', color: '#0f172a' }}>
            Spend by Expense Category
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {categories.map((cat) => (
              <div key={cat.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{cat.name}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>
                    ${cat.amount.toLocaleString()} ({cat.pct}%)
                  </span>
                </div>
                <div className="budget-bar-bg">
                  <div
                    className="budget-bar-fill"
                    style={{ width: `${cat.pct}%`, background: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Spenders */}
        <div className="data-table-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '18px', color: '#0f172a' }}>
            Top Spenders (This Fiscal Year)
          </h3>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Traveler</th>
                <th>Trips</th>
                <th>Total Spend</th>
              </tr>
            </thead>
            <tbody>
              {topSpenders.map((s) => (
                <tr key={s.name}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{s.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.dept}</div>
                  </td>
                  <td style={{ color: '#475569' }}>{s.trips}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>${s.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
