/**
 * Export and Download Utility functions for CSV and PDF (Localized to Indian Rupees INR ₹)
 */
import { formatINR } from './formatCurrency';

export function exportToCSV(filename, data) {
  if (!data || !data.length) {
    alert("No data available to export");
    return;
  }

  // Extract keys as header row, formatting monetary columns with (₹) in header
  const rawHeaders = Object.keys(data[0]);
  const formattedHeaders = rawHeaders.map(h => {
    if (h.toLowerCase() === 'amount') return 'Amount (₹)';
    if (h.toLowerCase() === 'budget') return 'Budget (₹)';
    return h;
  });

  const csvRows = [];
  
  // Header row
  csvRows.push(formattedHeaders.map(h => `"${h}"`).join(','));

  // Data rows with raw numbers for spreadsheet arithmetic
  for (const row of data) {
    const values = rawHeaders.map(header => {
      let val = row[header];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    });
    csvRows.push(values.join(','));
  }

  // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel / LibreOffice renders ₹ correctly
  const csvContent = "\uFEFF" + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPDF(reportTitle = "Executive Spend Analytics Deck") {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    window.print();
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportTitle}</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 30px; color: #1e293b; }
          h1 { color: #1b74e4; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 6px; }
          .meta { color: #64748b; font-size: 0.9rem; margin-bottom: 24px; }
          .kpi-grid { display: flex; gap: 20px; margin-bottom: 30px; }
          .kpi-card { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: #f8fafc; }
          .kpi-title { font-size: 0.8rem; text-transform: uppercase; color: #64748b; font-weight: 600; }
          .kpi-val { font-size: 1.4rem; font-weight: 700; color: #0f172a; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { text-align: left; background: #f1f5f9; padding: 10px; font-size: 0.8rem; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; }
          .footer { margin-top: 40px; font-size: 0.8rem; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <h1>${reportTitle}</h1>
        <div class="meta">Generated: ${new Date().toLocaleString('en-IN')} | Organization: Zylker Enterprise Expense Cloud (INR ₹)</div>
        
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-title">Total Spend YTD</div>
            <div class="kpi-val">${formatINR(1397800, { paise: true })}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Average Cost / Trip</div>
            <div class="kpi-val">${formatINR(122840, { paise: true })}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Policy Compliance</div>
            <div class="kpi-val">98.2%</div>
          </div>
        </div>

        <h3>Category Spend Breakdown (INR)</h3>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Allocation</th>
              <th>Total Amount (₹)</th>
              <th>Policy Benchmark</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Flights & Airfare</td><td>38%</td><td>${formatINR(531164, { paise: true })}</td><td>Within 5% threshold</td></tr>
            <tr><td>Lodging & Hotels</td><td>29%</td><td>${formatINR(405362, { paise: true })}</td><td>Preferred corporate rates</td></tr>
            <tr><td>Client Dinners & Meals</td><td>18%</td><td>${formatINR(251604, { paise: true })}</td><td>Per-diem compliant</td></tr>
            <tr><td>Ground Transit & Rental</td><td>10%</td><td>${formatINR(139780, { paise: true })}</td><td>Standard cab allowance</td></tr>
            <tr><td>Conferences & SaaS</td><td>5%</td><td>${formatINR(69890, { paise: true })}</td><td>Pre-approved POs</td></tr>
          </tbody>
        </table>

        <div class="footer">Confidential Financial Report &bull; SmartSpend Digital Corporate Travel & Reimbursement System &bull; Currency: INR (₹)</div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export function exportSingleReportPDF(report) {
  const printWindow = window.open('', '_blank', 'width=850,height=750');
  if (!printWindow) {
    window.print();
    return;
  }

  const amt = Number(report.amount) || 0;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Expense Report - ${report.id}</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 36px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1b74e4; padding-bottom: 16px; margin-bottom: 20px; }
          .title { font-size: 1.6rem; font-weight: 800; color: #1b74e4; }
          .badge { padding: 4px 12px; border-radius: 16px; font-size: 0.8rem; font-weight: bold; background: #dcfce7; color: #15803d; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px; font-size: 0.9rem; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .meta-item strong { color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th { background: #f1f5f9; padding: 10px 14px; text-align: left; font-size: 0.8rem; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
          td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; }
          .total-row { font-size: 1.05rem; font-weight: bold; background: #f8fafc; }
          .sign-box { margin-top: 40px; display: flex; justify-content: space-between; font-size: 0.85rem; color: #64748b; }
          .sign-line { border-top: 1px solid #94a3b8; width: 200px; padding-top: 6px; text-align: center; }
          .footer { margin-top: 40px; font-size: 0.8rem; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">EXPENSE CLAIM REIMBURSEMENT</div>
            <div style="color: #64748b; font-size: 0.85rem;">Report ID: ${report.id}</div>
          </div>
          <div>
            <span class="badge">${(report.status || 'PENDING').toUpperCase()}</span>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item"><strong>Employee:</strong> ${report.employee}</div>
          <div class="meta-item"><strong>Email:</strong> ${report.email || 'employee@zylker.com'}</div>
          <div class="meta-item"><strong>Submission Date:</strong> ${report.submittedDate}</div>
          <div class="meta-item"><strong>Policy Status:</strong> ${report.policyStatus || 'Compliant'}</div>
          <div class="meta-item" style="grid-column: span 2;"><strong>Report Title / Purpose:</strong> ${report.title}</div>
        </div>

        <h3>Itemized Claim Breakdown (INR ₹)</h3>
        <table>
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Description / Category</th>
              <th>Compliance Check</th>
              <th style="text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>REC-01</td>
              <td>Travel, Lodging & Transportation</td>
              <td style="color: #10b981; font-weight: 600;">Verified</td>
              <td style="text-align: right;">${formatINR(amt * 0.70, { paise: true })}</td>
            </tr>
            <tr>
              <td>REC-02</td>
              <td>Business Meals & Client Hospitality</td>
              <td style="color: #10b981; font-weight: 600;">Verified</td>
              <td style="text-align: right;">${formatINR(amt * 0.30, { paise: true })}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">Total Reimbursement Claim:</td>
              <td style="text-align: right; color: #1b74e4; font-weight: 700;">${formatINR(amt, { paise: true })}</td>
            </tr>
          </tbody>
        </table>

        <div class="sign-box">
          <div class="sign-line">Employee Signature</div>
          <div class="sign-line">Finance Approver Signature</div>
        </div>

        <div class="footer">
          Generated automatically by SmartSpend Digital Corporate Travel & Reimbursement System &bull; Currency: INR (₹)
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
