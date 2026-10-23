import React from 'react';
import { CreditCard, Clock, Wallet } from 'lucide-react';
import { formatINR } from '../utils/formatCurrency';

export default function VerdictRow({ summary, totalSpend }) {
  const cards = [
    {
      title: 'Total Spend (YTD)',
      value: formatINR(totalSpend || 1177000),
      sub: '+8.4% vs last period',
      icon: CreditCard,
      color: '#1b74e4',
      bg: '#eff6ff'
    },
    {
      title: 'Awaiting Manager Review',
      value: `${summary?.pendingTripsCount || 4} Claims`,
      sub: formatINR(summary?.pendingReportsAmount || 118250),
      icon: Clock,
      color: '#f59e0b',
      bg: '#fffbeb'
    },
    {
      title: 'Active Cash Advances',
      value: formatINR(summary?.employeeAdvances || 165000),
      sub: '3 pending reconciliation',
      icon: Wallet,
      color: '#10b981',
      bg: '#ecfdf5'
    }
  ];

  return (
    <div className="verdict-row-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="verdict-card">
            <div className="verdict-info">
              <span className="verdict-title">{card.title}</span>
              <span className="verdict-value">{card.value}</span>
              <span className="verdict-sub">{card.sub}</span>
            </div>
            <div className="verdict-icon-box" style={{ background: card.bg, color: card.color }}>
              <Icon size={22} strokeWidth={2.2} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
