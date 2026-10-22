import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, CheckCircle, Plane, Calendar, MapPin, DollarSign, ShieldCheck, Printer, X, FileText, Compass } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import { formatINR } from '../../utils/formatCurrency';
import { INDIAN_CITIES, ROUTE_PRESETS } from '../../utils/indianCities';
import Modal from '../Modal';

export default function TripsView({ viewMode = 'admin', onNotification }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [trips, setTrips] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Form State
  const [destination, setDestination] = useState('');
  const [traveler, setTraveler] = useState(viewMode === 'my' ? 'Arvind' : '');
  const [purpose, setPurpose] = useState('');
  const [dates, setDates] = useState('');
  const [budget, setBudget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTrips = async () => {
    try {
      const res = await fetch(`/api/trips?viewMode=${viewMode}`);
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrips();
    if (viewMode === 'my') setTraveler('Arvind');
  }, [viewMode]);

  const handleApprove = async (tripId) => {
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      const data = await res.json();
      if (data.success) {
        setTrips(trips.map(t => t.id === tripId ? { ...t, status: 'approved' } : t));
        if (onNotification) onNotification(`Trip ${tripId} approved and saved to database!`);
        if (selectedTrip && selectedTrip.id === tripId) {
          setSelectedTrip({ ...selectedTrip, status: 'approved' });
        }
      }
    } catch (err) {
      console.error(err);
      if (onNotification) onNotification('Failed to update trip on server');
    }
  };

  const handleExport = () => {
    exportToCSV('business_trips', trips);
    if (onNotification) onNotification('Trips CSV file downloaded successfully!');
  };

  const handlePrintItinerary = (trip) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      window.print();
      return;
    }
    const html = `
      <html>
        <head>
          <title>Itinerary - ${trip.id}</title>
          <style>
            body { font-family: -apple-system, sans-serif; padding: 25px; color: #1e293b; }
            h1 { color: #1b74e4; margin-bottom: 4px; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-weight: bold; background: #e0f2fe; color: #0369a1; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; font-size: 0.85rem; color: #64748b; }
          </style>
        </head>
        <body>
          <h1>Official Travel Itinerary</h1>
          <p><strong>Trip Code:</strong> ${trip.id} &bull; <span class="badge">${trip.status.toUpperCase()}</span></p>
          <hr />
          <p><strong>Traveler:</strong> ${trip.traveler} (${trip.email})</p>
          <p><strong>Destination:</strong> ${trip.destination}</p>
          <p><strong>Travel Dates:</strong> ${trip.dates}</p>
          <p><strong>Business Purpose:</strong> ${trip.purpose}</p>
          <p><strong>Total Approved Budget:</strong> ₹${(trip.budget || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <h3>Itemized Budget Cap</h3>
          <table>
            <thead><tr><th>Expense Category</th><th>Allocation</th><th>Estimated Amount</th></tr></thead>
            <tbody>
              <tr><td>Flight & Airline Reservation</td><td>45%</td><td>₹${((trip.budget || 0) * 0.45).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
              <tr><td>Hotel & Accommodations</td><td>35%</td><td>₹${((trip.budget || 0) * 0.35).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
              <tr><td>Daily Meals & Per-Diem</td><td>15%</td><td>₹${((trip.budget || 0) * 0.15).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
              <tr><td>Ground Transport & Cabs</td><td>5%</td><td>₹${((trip.budget || 0) * 0.05).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
            </tbody>
          </table>
          <p style="margin-top: 30px; font-size: 0.8rem; color: #94a3b8; text-align: center;">Zylker Corporate Expense Management System</p>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!destination || !traveler) {
      alert('Please provide destination and traveler name');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          traveler,
          purpose,
          dates: dates || 'Nov 18 - Nov 24, 2026',
          budget: parseFloat(budget) || 1800
        })
      });

      const result = await res.json();
      if (result.success) {
        setIsModalOpen(false);
        setDestination('');
        setPurpose('');
        setBudget('');
        setDates('');
        fetchTrips();
        if (onNotification) onNotification(result.message);
      }
    } catch (err) {
      alert('Failed to create trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trip.traveler.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trip.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'ALL' || trip.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="section-view-container">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <h2>Business Trips Management {viewMode === 'my' ? '(My Trips)' : '(Company Wide)'}</h2>
          <p>Oversee travel itineraries, budget approvals, and team reservations</p>
        </div>
        <div className="section-header-actions">
          <button className="btn-secondary-action" onClick={handleExport}>
            <Download size={15} /> Export CSV
          </button>
          <button className="btn-primary-action" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> New Trip Request
          </button>
        </div>
      </div>

      <div className="stats-summary-grid">
        <div className="stat-metric-card">
          <span className="stat-metric-title">Active Trips</span>
          <span className="stat-metric-num">{trips.length}</span>
          <span className="stat-metric-sub">{viewMode === 'my' ? 'Personal bookings' : 'Across all teams'}</span>
        </div>
        <div className="stat-metric-card">
          <span className="stat-metric-title">Pending Approval</span>
          <span className="stat-metric-num">{trips.filter(t => t.status === 'pending').length}</span>
          <span className="stat-metric-sub" style={{ color: '#d97706' }}>Action Required</span>
        </div>
        <div className="stat-metric-card">
          <span className="stat-metric-title">Total Allocated</span>
          <span className="stat-metric-num">
            {formatINR(trips.reduce((acc, t) => acc + (t.budget || 0), 0), { paise: true })}
          </span>
          <span className="stat-metric-sub">Within Travel Cap</span>
        </div>
      </div>

      <div className="data-table-card">
        <div className="table-toolbar">
          <div className="search-box-input">
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search destination, employee, trip ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="status-segments" style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
            {[
              { id: 'ALL', label: 'All', count: trips.length },
              { id: 'PENDING', label: 'Pending Approval', count: trips.filter(t => t.status === 'pending').length },
              { id: 'APPROVED', label: 'Approved', count: trips.filter(t => t.status === 'approved').length },
              { id: 'COMPLETED', label: 'Completed', count: trips.filter(t => t.status === 'completed').length }
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
              <th>Trip ID</th>
              <th>Traveler</th>
              <th>Destination & Purpose</th>
              <th>Travel Dates</th>
              <th>Budget</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.length > 0 ? (
              filteredTrips.map((trip) => (
                <tr key={trip.id}>
                  <td>
                    <button
                      onClick={() => setSelectedTrip(trip)}
                      style={{ fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', textAlign: 'left' }}
                      title="Click to view full details"
                    >
                      {trip.id}
                    </button>
                  </td>
                  <td>
                    <div className="user-info-col">
                      <img src={trip.avatar} alt={trip.traveler} className="avatar-img" />
                      <div className="user-text-meta">
                        <span className="user-name">{trip.traveler}</span>
                        <span className="user-email">{trip.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div
                      onClick={() => setSelectedTrip(trip)}
                      style={{ fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}
                      title="Click to view full details"
                    >
                      {trip.destination}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{trip.purpose}</div>
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.84rem' }}>{trip.dates}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{formatINR(trip.budget, { paise: true })}</td>
                  <td>
                    <span className={`badge-pill ${trip.status}`}>
                      {trip.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn-secondary-action"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => setSelectedTrip(trip)}
                      >
                        View Details
                      </button>
                      {trip.status === 'pending' && viewMode === 'admin' && (
                        <button
                          className="btn-primary-action"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => handleApprove(trip.id)}
                        >
                          <CheckCircle size={13} /> Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  No business trips found matching status filter "{statusFilter}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Trip Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Trip Request"
      >
        <form onSubmit={handleCreateTrip} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Quick Route Preset Chips */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              <Compass size={14} color="#1b74e4" />
              <span>Quick Route Presets:</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ROUTE_PRESETS.map((route, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setDestination(`${route.from} to ${route.to}`);
                    setPurpose('Client Architecture & Strategy Review');
                    setBudget('45000');
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '5px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {route.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group-item">
            <label>Destination City / Route *</label>
            <input
              type="text"
              required
              list="indianCitiesList"
              placeholder="e.g. Chennai (MAA) to Mumbai (BOM)"
              className="form-control-input"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
            <datalist id="indianCitiesList">
              {INDIAN_CITIES.map((c, i) => (
                <option key={i} value={`${c.city} (${c.airport}) - ${c.state}`} />
              ))}
            </datalist>
          </div>

          <div className="form-group-item">
            <label>Traveler Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Arvind"
              className="form-control-input"
              value={traveler}
              onChange={(e) => setTraveler(e.target.value)}
            />
          </div>

          <div className="form-group-item">
            <label>Business Purpose</label>
            <input
              type="text"
              placeholder="e.g. Q4 Client Strategy Meet"
              className="form-control-input"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group-item">
              <label>Budget Cap (₹)</label>
              <input
                type="number"
                placeholder="150000"
                className="form-control-input"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
            <div className="form-group-item">
              <label>Dates</label>
              <input
                type="text"
                placeholder="Nov 20 - Nov 26, 2026"
                className="form-control-input"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
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
              {isSubmitting ? 'Creating...' : 'Submit Trip Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Interactive Trip Details Modal */}
      {selectedTrip && (
        <Modal
          isOpen={!!selectedTrip}
          onClose={() => setSelectedTrip(null)}
          title={`Trip Dossier & Itinerary: ${selectedTrip.id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Header Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  <Plane size={18} color="var(--primary)" />
                  <span>{selectedTrip.destination}</span>
                </div>
                <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '3px' }}>
                  {selectedTrip.purpose}
                </div>
              </div>
              <span className={`badge-pill ${selectedTrip.status}`}>
                {selectedTrip.status.toUpperCase()}
              </span>
            </div>

            {/* Traveler & Schedule Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ border: '1px solid #eef2f6', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Traveler Profile</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: '8px' }}>
                  <img src={selectedTrip.avatar} alt={selectedTrip.traveler} style={{ width: 34, height: 34, borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{selectedTrip.traveler}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{selectedTrip.email}</div>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #eef2f6', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Travel Window</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '8px', color: '#1e293b', fontWeight: 600, fontSize: '0.88rem' }}>
                  <Calendar size={16} color="var(--primary)" />
                  <span>{selectedTrip.dates}</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#10b981', marginTop: '2px', fontWeight: 600 }}>
                  Confirmed booking window
                </div>
              </div>
            </div>

            {/* Budget Breakdown Table */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                  Allocated Budget Breakdown
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  Total: {formatINR(selectedTrip.budget, { paise: true })}
                </span>
              </div>
              
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>% Cap</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>Flights & Roundtrip Airfare</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>45%</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                        {formatINR((selectedTrip.budget || 0) * 0.45, { paise: true })}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>Corporate Hotel & Lodging</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>35%</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                        {formatINR((selectedTrip.budget || 0) * 0.35, { paise: true })}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>Meals & Daily Per-Diem Cap</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>15%</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                        {formatINR((selectedTrip.budget || 0) * 0.15, { paise: true })}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 12px' }}>Airport Transit & Taxis</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>5%</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                        {formatINR((selectedTrip.budget || 0) * 0.05, { paise: true })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Compliance Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px 14px', borderRadius: '8px', color: '#065f46', fontSize: '0.8rem', fontWeight: 600 }}>
              <ShieldCheck size={18} color="#059669" />
              <span>Compliant with Zylker Global Travel & Per-Diem Policy 2026. Audit Verified.</span>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
              <button
                className="btn-secondary-action"
                onClick={() => handlePrintItinerary(selectedTrip)}
              >
                <Printer size={15} /> Print / Save Itinerary (PDF)
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                {selectedTrip.status === 'pending' && viewMode === 'admin' && (
                  <button
                    className="btn-primary-action"
                    onClick={() => handleApprove(selectedTrip.id)}
                  >
                    <CheckCircle size={14} /> Approve Trip
                  </button>
                )}
                <button
                  className="btn-secondary-action"
                  onClick={() => setSelectedTrip(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
