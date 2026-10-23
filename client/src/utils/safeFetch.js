// Embedded Reactive Data Engine for SmartSpend (Full Offline & Static Hosting Support)
import { mockStore } from './mockDatabase.js';

function getLocalStore() {
  const saved = localStorage.getItem('smartspend_local_data');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.reports && parsed.trips) {
        return parsed;
      }
    } catch (e) {}
  }
  // Initialize from clean mockStore
  localStorage.setItem('smartspend_local_data', JSON.stringify(mockStore));
  return JSON.parse(JSON.stringify(mockStore));
}

function saveLocalStore(data) {
  localStorage.setItem('smartspend_local_data', JSON.stringify(data));
  // Dispatch custom storage event for instant UI syncing across views
  window.dispatchEvent(new Event('smartspend:data-updated'));
}

export async function safeFetch(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  let body = null;
  if (options.body) {
    try {
      body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
    } catch (e) {
      body = options.body;
    }
  }

  // If running in development with an actual live Node.js backend on localhost
  if (typeof window !== 'undefined') {
    try {
      const res = await window.fetch(endpoint, options);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        return { ok: true, status: res.status, json: async () => data };
      }
    } catch (netErr) {
      // Local server not running or network interrupted: fall through smoothly
    }
  }

  // --- Embedded Client-Side Data Engine (for GitHub Pages / Production) ---
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
      avatar: null
    };
    return {
      ok: true,
      status: 200,
      json: async () => ({ success: true, token: 'jwt-' + Date.now(), user, message: `Welcome back, ${user.name}!` })
    };
  }

  if (endpoint.startsWith('/api/auth/register')) {
    const newUser = {
      id: 'u-' + Date.now(),
      name: body.name || 'User',
      email: body.email,
      role: body.role || 'employee',
      department: body.department || 'General',
      avatar: null
    };
    store.users.push(newUser);
    saveLocalStore(store);
    return {
      ok: true,
      status: 201,
      json: async () => ({ success: true, token: 'jwt-' + Date.now(), user: newUser, message: 'Account created successfully!' })
    };
  }

  // 2. Dashboard Overview
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

  // 3. Trips Module (Approve & Update)
  if (endpoint.startsWith('/api/trips/pending')) {
    return { ok: true, status: 200, json: async () => store.pendingTrips };
  }

  if (endpoint.startsWith('/api/trips')) {
    const parts = endpoint.split('?')[0].split('/');
    const tripId = parts[3];

    // PUT /api/trips/:id -> Approve or update trip status
    if (method === 'PUT' && tripId) {
      const trip = store.trips.find(t => t.id === tripId);
      if (trip) {
        if (body && body.status) trip.status = body.status;
        saveLocalStore(store);
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            message: `Trip ${tripId} status updated to ${body.status}!`,
            trip
          })
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, message: `Trip ${tripId} updated!` })
      };
    }

    // POST /api/trips -> Create new trip
    if (method === 'POST') {
      const newTrip = {
        id: 'TRP-' + Math.floor(100 + Math.random() * 900),
        destination: body.destination,
        purpose: body.purpose || 'Business Trip',
        traveler: body.traveler || 'Arvind Ramakrishnan',
        email: body.email || 'admin@zylker.com',
        avatar: null,
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

  // 4. Reports Module (Reimburse & File Claims)
  if (endpoint.startsWith('/api/reports/pending')) {
    return { ok: true, status: 200, json: async () => store.pendingReports };
  }

  if (endpoint.startsWith('/api/reports')) {
    const parts = endpoint.split('?')[0].split('/');
    const reportId = parts[3];

    // PUT /api/reports/:id -> Reimburse report
    if (method === 'PUT' && reportId) {
      const report = store.reports.find(r => r.id === reportId);
      if (report) {
        if (body && body.status) report.status = body.status;
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

    // POST /api/reports -> Create claim
    if (method === 'POST') {
      const newReport = {
        id: 'EXP-' + Math.floor(1000 + Math.random() * 9000),
        title: body.title,
        employee: body.employee || 'Arvind Ramakrishnan',
        email: body.email || 'admin@zylker.com',
        avatar: null,
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

  // 5. Cash Advances Module
  if (endpoint.startsWith('/api/advances')) {
    const parts = endpoint.split('?')[0].split('/');
    const advanceId = parts[3];

    if (method === 'PUT' && advanceId) {
      const adv = store.advances.find(a => a.id === advanceId);
      if (adv) {
        if (body && body.settlementStatus) adv.settlementStatus = body.settlementStatus;
        saveLocalStore(store);
        return { ok: true, status: 200, json: async () => ({ success: true, advance: adv }) };
      }
    }

    if (method === 'POST') {
      const newAdvance = {
        id: 'ADV-' + Math.floor(100 + Math.random() * 900),
        employee: body.employee || 'Arvind Ramakrishnan',
        email: body.email || 'admin@zylker.com',
        avatar: null,
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

  // 7. Actions: Dashboard Approve Pending Trip Card
  if (endpoint.startsWith('/api/actions/approve-trip')) {
    const { approverId } = body || {};
    const approver = store.pendingTrips.find(t => t.id === approverId);
    if (approver && approver.count > 0) {
      approver.count -= 1;
      saveLocalStore(store);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: `Approved 1 trip for ${approver.name}! Remaining: ${approver.count}`,
          item: approver
        })
      };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: 'Trip approved successfully!' })
    };
  }

  return { ok: true, status: 200, json: async () => ({ success: true }) };
}
