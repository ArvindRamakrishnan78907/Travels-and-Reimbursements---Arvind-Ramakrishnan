import React from 'react';
import SpendChart from './SpendChart';

export default function SpendSummaryCard({ timeframe, setTimeframe, data, fiscalYear }) {
  return (
    <section className="dashboard-card spend-summary-card">
      <div className="card-header-row">
        <h2 className="card-title">SPEND SUMMARY</h2>
        <select
          className="select-dropdown"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="This Year">This Year</option>
          <option value="Previous Year">Previous Year</option>
        </select>
      </div>

      <SpendChart data={data} fiscalYear={fiscalYear} />
    </section>
  );
}
