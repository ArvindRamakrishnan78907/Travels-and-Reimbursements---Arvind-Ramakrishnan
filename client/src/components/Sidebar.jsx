import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  DollarSign,
  User,
  Shield,
  Lock
} from 'lucide-react';

export default function Sidebar({ activeNav, setActiveNav, isMyView, setIsMyView, currentUser }) {
  const userRole = currentUser?.role || 'admin';

  // Viva-Safe Core Business Modules
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trips', label: 'Trips (Travel)', icon: Briefcase },
    { id: 'reports', label: 'Expense Reports', icon: FileText },
    { id: 'advances', label: 'Cash Advances', icon: DollarSign },
  ];

  return (
    <aside className="sidebar">
      <div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            const isRestrictedForEmployee = userRole === 'employee' && item.minRole !== 'employee';

            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={19} strokeWidth={isActive ? 2.3 : 1.8} />
                  <span>{item.label}</span>
                </div>

                {isRestrictedForEmployee && (
                  <span 
                    title="Requires Manager or Admin Authorization" 
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <Lock size={10} />
                    {item.minRole === 'admin' ? 'Admin' : 'Mgr'}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <button
          className="btn-switch-view"
          onClick={() => setIsMyView(!isMyView)}
        >
          <User size={16} />
          <span>{isMyView ? "Switch to Admin View" : "Switch to My View"}</span>
        </button>

        {currentUser && (
          <div style={{
            marginTop: '12px',
            padding: '10px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e'
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.name}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                Role: {currentUser.role}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
