import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import SpendSummaryCard from './components/SpendSummaryCard';
import OverallSummaryCard from './components/OverallSummaryCard';
import PendingTripsCard from './components/PendingTripsCard';
import PendingReportsCard from './components/PendingReportsCard';
import AuthScreen from './components/AuthScreen';

// Core Business Views
import TripsView from './components/views/TripsView';
import ReportsView from './components/views/ReportsView';
import AdvancesView from './components/views/AdvancesView';

import { CheckCircle2 } from 'lucide-react';

const navTitles = {
  dashboard: 'Executive Dashboard',
  trips: 'Trips (Travel Requests)',
  reports: 'Expense Reports & OCR Scanning',
  advances: 'Cash Advances Ledger'
};

export default function App() {
  const [activeNav, setActiveNav] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('nav') || window.location.hash.replace('#', '') || 'dashboard';
  });

  // User Authentication & Session State (with auto-heal for cached names)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smartspend_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'Sentamizh' || parsed.name === 'Senthamizh') {
          parsed.name = 'Arvind';
          localStorage.setItem('smartspend_user', JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {}
    return null;
  });

  const [authToken, setAuthToken] = useState(() => localStorage.getItem('smartspend_token') || null);

  const [isMyView, setIsMyView] = useState(() => currentUser?.role === 'employee');
  const [timeframe, setTimeframe] = useState('This Year');
  
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingTrips, setPendingTrips] = useState([]);
  const [pendingReports, setPendingReports] = useState(null);
  const [toast, setToast] = useState(null);

  const viewMode = isMyView ? 'my' : 'admin';

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleAuthSuccess = (user, token, message) => {
    setCurrentUser(user);
    setAuthToken(token);
    showNotification(message || `Signed in as ${user.name} (${user.role.toUpperCase()})`);
    
    // Automatically configure view perspective based on role
    if (user.role === 'employee') {
      setIsMyView(true);
    } else {
      setIsMyView(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('smartspend_token');
    localStorage.removeItem('smartspend_user');
    setCurrentUser(null);
    setAuthToken(null);
    showNotification('Signed out successfully.');
  };

  const fetchAllData = async () => {
    if (!currentUser) return;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const [overviewRes, tripsRes, reportsRes] = await Promise.all([
        fetch(`/api/dashboard/overview?timeframe=${encodeURIComponent(timeframe)}&viewMode=${viewMode}`, { headers }),
        fetch('/api/trips/pending', { headers }),
        fetch('/api/reports/pending', { headers })
      ]);

      if (overviewRes.ok) setDashboardData(await overviewRes.json());
      if (tripsRes.ok) setPendingTrips(await tripsRes.json());
      if (reportsRes.ok) setPendingReports(await reportsRes.json());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [timeframe, isMyView, currentUser]);

  const handleApproveTrip = async (approverId) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/actions/approve-trip', {
        method: 'POST',
        headers,
        body: JSON.stringify({ approverId })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        fetchAllData();
      }
    } catch (err) {
      showNotification('Approval error');
    }
  };

  // If unauthenticated, show the dedicated, minimalist full-screen authentication gateway
  if (!currentUser) {
    return (
      <>
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
        {toast && (
          <div className="toast-notice">
            <CheckCircle2 size={18} color="#10b981" />
            <span>{toast}</span>
          </div>
        )}
      </>
    );
  }

  // Render content according to active sidebar navigation option
  const renderCurrentView = () => {
    switch (activeNav) {
      case 'trips':
        return <TripsView viewMode={viewMode} onNotification={showNotification} />;
      case 'reports':
        return <ReportsView viewMode={viewMode} onNotification={showNotification} />;
      case 'advances':
        return <AdvancesView viewMode={viewMode} onNotification={showNotification} />;
      case 'dashboard':
      default:
        return (
          <div className="dashboard-grid">
            {/* Row 1: Spend Summary & Overall Summary */}
            <div className="grid-row-top">
              <SpendSummaryCard
                timeframe={timeframe}
                setTimeframe={setTimeframe}
                data={dashboardData?.spendData || []}
                fiscalYear={dashboardData?.fiscalYear || "2020-2021"}
              />

              <OverallSummaryCard
                summary={dashboardData?.overallSummary}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
              />
            </div>

            {/* Row 2: Pending Trips & Pending Reports */}
            <div className="grid-row-bottom">
              <PendingTripsCard
                trips={pendingTrips}
                onApproveTrip={viewMode === 'admin' ? handleApproveTrip : null}
              />

              <PendingReportsCard
                reportsData={pendingReports}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        isMyView={isMyView}
        setIsMyView={setIsMyView}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <main className="main-wrapper">
        <TopHeader
          title={navTitles[activeNav] || 'Executive Dashboard'}
          activeNav={activeNav}
          isMyView={isMyView}
          setIsMyView={setIsMyView}
          currentUser={currentUser}
          onOpenAuth={handleLogout}
          onLogout={handleLogout}
        />

        {/* Content Body - Full Width & Clean Enterprise Layout */}
        <div className="content-body" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
            {renderCurrentView()}
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="toast-notice">
          <CheckCircle2 size={18} color="#10b981" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
