import UserAvatar from './UserAvatar';
import React from 'react';
import { UserCheck, Shield, LogIn, LogOut, KeyRound } from 'lucide-react';

export default function TopHeader({ 
  title = 'Dashboard', 
  activeNav = 'dashboard',
  isMyView, 
  setIsMyView, 
  currentUser,
  onOpenAuth,
  onLogout 
}) {
  const roleColors = {
    admin: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', label: 'ADMIN' },
    manager: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', label: 'MANAGER' },
    employee: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', label: 'EMPLOYEE' }
  };

  const userRole = currentUser?.role || 'admin';
  const roleStyle = roleColors[userRole] || roleColors.employee;

  return (
    <header className="top-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <h1 className="page-title" style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>{title}</h1>
        
        {/* Perspective toggle (Only relevant for Managers/Admins or to see personal slice) */}
        <button
          onClick={() => setIsMyView(!isMyView)}
          title="Click to toggle perspective"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 700,
            background: isMyView ? '#eff6ff' : '#f0fdf4',
            color: isMyView ? '#1b74e4' : '#16a34a',
            border: `1px solid ${isMyView ? '#bad3f8' : '#bbf7d0'}`,
            cursor: 'pointer'
          }}
        >
          {isMyView ? <UserCheck size={14} /> : <Shield size={14} />}
          <span>{isMyView ? `Viewing: My Profile (${currentUser?.name || 'Arvind'})` : 'Viewing: Company Admin (All Staff)'}</span>
        </button>
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* User Account / Auth Section */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px 4px 6px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '30px'
              }}
            >
              <UserAvatar name={currentUser.name} size={28} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                  {currentUser.name}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.1 }}>
                  {currentUser.department || 'Engineering'}
                </span>
              </div>
              <span 
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background: roleStyle.bg,
                  color: roleStyle.text,
                  border: `1px solid ${roleStyle.border}`,
                  letterSpacing: '0.4px',
                  marginLeft: '4px'
                }}
              >
                {roleStyle.label}
              </span>
            </div>

            <button
              onClick={onOpenAuth}
              title="Switch Account / Role"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: '#ffffff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                cursor: 'pointer'
              }}
            >
              <KeyRound size={14} />
              <span>Switch User</span>
            </button>

            <button
              onClick={onLogout}
              title="Sign Out"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                cursor: 'pointer'
              }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37,99,235,0.3)'
            }}
          >
            <LogIn size={15} />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
}
