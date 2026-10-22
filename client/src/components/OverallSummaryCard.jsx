import React from 'react';
import { FolderMinus, Clock, Banknote, Briefcase } from 'lucide-react';
import { formatINR } from '../utils/formatCurrency';

export default function OverallSummaryCard({ summary, timeframe, setTimeframe }) {
  if (!summary) return null;

  return (
    <section className="dashboard-card overall-summary-card">
      <div className="card-header-row">
        <h2 className="card-title">OVERALL SUMMARY</h2>
        <select
          className="select-dropdown"
          value={timeframe || 'This Year'}
          onChange={(e) => setTimeframe && setTimeframe(e.target.value)}
        >
          <option value="This Year">This Year</option>
          <option value="Previous Year">Previous Year</option>
        </select>
      </div>

      <div className="summary-items-list">
        {/* Total Expense */}
        <div className="summary-item-row">
          <div className="item-icon-box icon-box-expense">
            <FolderMinus size={22} strokeWidth={2} />
          </div>
          <div className="item-details">
            <span className="item-label">Total Expense</span>
            <span className="item-value">
              {formatINR(summary.totalExpense || 1397800, { paise: true })}
            </span>
          </div>
        </div>

        {/* Employee Reimbursements */}
        <div className="summary-item-row">
          <div className="item-icon-box icon-box-reimb">
            <Clock size={22} strokeWidth={2} />
          </div>
          <div className="item-details">
            <span className="item-label">Employee Reimbursements</span>
            <span className="item-value">
              {formatINR(summary.employeeReimbursements || 1033350, { paise: true })}
            </span>
          </div>
        </div>

        {/* Employee Advances */}
        <div className="summary-item-row">
          <div className="item-icon-box icon-box-advances">
            <Banknote size={22} strokeWidth={2} />
          </div>
          <div className="item-details">
            <span className="item-label">Employee Advances</span>
            <span className="item-value">
              {formatINR(summary.employeeAdvances || 186750, { paise: true })}
            </span>
          </div>
        </div>

        {/* Total Trips */}
        <div className="summary-item-row">
          <div className="item-icon-box icon-box-trips">
            <Briefcase size={22} strokeWidth={2} />
          </div>
          <div className="item-details">
            <span className="item-label">Total Trips</span>
            <span className="item-value">{summary.totalTrips || 80}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
