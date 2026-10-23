// Centralized API client with automatic offline/standalone fallback
import { mockStore } from './mockDatabase.js';

function getLocalStore() {
  const saved = localStorage.getItem('smartspend_local_data');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  localStorage.setItem('smartspend_local_data', JSON.stringify(mockStore));
  return JSON.parse(JSON.stringify(mockStore));
}

function saveLocalStore(data) {
  localStorage.setItem('smartspend_local_data', JSON.stringify(data));
}

export async function safeFetch(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : null;
  const token = localStorage.getItem('smartspend_token');

  // Try real backend API first if running locally with custom server
  try {
    const res = await fetch(endpoint, options);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return { ok: true, status: res.status, json: async () => data };
    }
  } catch (netErr) {
    // Network fallback
  }

  // --- Embedded Client-Side Data Engine (Static & GitHub Pages) ---
  const store = getLocalStore();

  // 1. Authentication
  if (endpoint.startsWith('/api/auth/login')) {
    const { email } = body || {};
    const user = store.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || {
      id: 'custom-' + Date.now(),
      name: (email || 'Arvind').split('@')[0],
      email: email || 'admin@zylker.com',
      role: 'admin',
      department: 'Management',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
    };
    return {
      ok: true,
      status: 200,
      json: async () => ({ success: true, token: 'mock-jwt-' + Date.now(), user, message: `Welcome back, ${user.name}!` })
    };
  }

  if (endpoint.startsWith('/api/auth/register')) {
    const newUser = {
      id: 'u-' + Date.now(),
      name: body.name || 'User',
      email: body.email,
      role: body.role || 'employee',
      department: body.department || 'General',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
    };
    store.users.push(newUser);
    saveLocalStore(store);
    return {
      ok: true,
      status: 201,
      json: async () => ({ success: true, token: 'mock-jwt-' + Date.now(), user: newUser, message: 'Account created successfully!' })
    };
  }

  // 2. Dashboard
  if (endpoint.startsWith('/api/dashboard/overview')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        fiscalYear: store.spendSummary.fiscalYear,
        totalSpend: store.spendSummary.totalSpend,
        spendData: store.spendSummary.timeframes['This Year'],
        overallSummary: store.overallSummary
      })
    };
  }

  // 3. Trips
  if (endpoint.startsWith('/api/trips/pending')) {
    return { ok: true, status: 200, json: async () => store.pendingTrips };
  }

  if (endpoint.startsWith('/api/trips')) {
    const parts = endpoint.split('/');
    const tripId = parts[3];

    // PUT: Update trip status (e.g. approve trip)
    if (method === 'PUT' && tripId) {
      const trip = store.trips.find(t => t.id === tripId);
      if (trip) {
        if (body.status) trip.status = body.status;
        saveLocalStore(store);
        return { ok: true, status: 200, json: async () => ({ success: true, message: `Trip ${tripId} status updated to ${body.status}!`, trip }) };
      }
    }

    if (method === 'POST') {
      const newTrip = {
        id: 'TRP-' + Math.floor(100 + Math.random() * 900),
        destination: body.destination,
        purpose: body.purpose || 'Business Trip',
        traveler: body.traveler || 'Arvind Ramakrishnan',
        email: body.email || 'admin@zylker.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        dates: body.dates || 'Upcoming',
        budget: Number(body.budget) || 10000,
        status: 'pending'
      };
      store.trips.unshift(newTrip);
      saveLocalStore(store);
      return { ok: true, status: 201, json: async () => ({ success: true, trip: newTrip }) };
    }
    return { ok: true, status: 200, json: async () => store.trips };
  }

  // 4. Reports (Including Reimburse action)
  if (endpoint.startsWith('/api/reports/pending')) {
    return { ok: true, status: 200, json: async () => store.pendingReports };
  }

  if (endpoint.startsWith('/api/reports')) {
    const parts = endpoint.split('/');
    const reportId = parts[3];

    // PUT: Update report status (e.g. mark as reimbursed or in-review)
    if (method === 'PUT' && reportId) {
      const report = store.reports.find(r => r.id === reportId);
      if (report) {
        if (body.status) report.status = body.status;
        saveLocalStore(store);
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            message: `Report ${reportId} marked as ${body.status}!`,
            report
          })
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, message: `Report ${reportId} updated!` })
      };
    }

    if (method === 'POST') {
      const newReport = {
        id: 'EXP-' + Math.floor(1000 + Math.random() * 9000),
        title: body.title,
        employee: body.employee || 'Arvind Ramakrishnan',
        email: body.email || 'admin@zylker.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        submittedDate: new Date().toISOString().split('T')[0],
        receiptsCount: body.receiptsCount || 1,
        amount: Number(body.amount) || 1000,
        policyStatus: 'Compliant',
        status: 'pending'
      };
      store.reports.unshift(newReport);
      saveLocalStore(store);
      return { ok: true, status: 201, json: async () => ({ success: true, report: newReport }) };
    }
    return { ok: true, status: 200, json: async () => store.reports };
  }

  // 5. Advances
  if (endpoint.startsWith('/api/advances')) {
    const parts = endpoint.split('/');
    const advanceId = parts[3];

    if (method === 'PUT' && advanceId) {
      const adv = store.advances.find(a => a.id === advanceId);
      if (adv) {
        if (body.settlementStatus) adv.settlementStatus = body.settlementStatus;
        saveLocalStore(store);
        return { ok: true, status: 200, json: async () => ({ success: true, advance: adv }) };
      }
    }

    if (method === 'POST') {
      const newAdvance = {
        id: 'ADV-' + Math.floor(100 + Math.random() * 900),
        employee: body.employee || 'Arvind Ramakrishnan',
        email: body.email || 'admin@zylker.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        amount: Number(body.amount) || 5000,
        purpose: body.purpose || 'Travel Advance',
        issuedDate: new Date().toISOString().split('T')[0],
        settlementStatus: 'unsettled'
      };
      store.advances.unshift(newAdvance);
      saveLocalStore(store);
      return { ok: true, status: 201, json: async () => ({ success: true, advance: newAdvance }) };
    }
    return { ok: true, status: 200, json: async () => store.advances };
  }

  // 6. Settings
  if (endpoint.startsWith('/api/settings')) {
    return { ok: true, status: 200, json: async () => store.settings };
  }

  // 7. Actions (Approve trip)
  if (endpoint.startsWith('/api/actions/approve-trip')) {
    const { approverId } = body || {};
    const trip = store.pendingTrips.find(t => t.id === approverId);
    if (trip && trip.count > 0) {
      trip.count -= 1;
      saveLocalStore(store);
      return { ok: true, status: 200, json: async () => ({ success: true, message: `Approved 1 trip for ${trip.name}`, item: trip }) };
    }
    return { ok: true, status: 200, json: async () => ({ success: true, message: 'Approved' }) };
  }

  return { ok: true, status: 200, json: async () => ({ success: true }) };
}
