import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('employee');
  const [regDept, setRegDept] = useState('Engineering');

  if (!isOpen) return null;

  const handleDemoFill = (role) => {
    setError(null);
    setActiveTab('login');
    if (role === 'admin') {
      setLoginEmail('admin@zylker.com');
      setLoginPassword('admin123');
    } else if (role === 'manager') {
      setLoginEmail('manager@zylker.com');
      setLoginPassword('manager123');
    } else {
      setLoginEmail('employee@zylker.com');
      setLoginPassword('employee123');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check credentials.');
      }

      localStorage.setItem('smartspend_token', data.token);
      localStorage.setItem('smartspend_user', JSON.stringify(data.user));
      onAuthSuccess(data.user, data.token, data.message);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: regRole,
          department: regDept
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }

      localStorage.setItem('smartspend_token', data.token);
      localStorage.setItem('smartspend_user', JSON.stringify(data.user));
      onAuthSuccess(data.user, data.token, data.message);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 99999 }}>
      <div 
        className="modal-content"
        style={{
          maxWidth: '520px',
          width: '94%',
          borderRadius: '12px',
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.35)',
          overflow: 'hidden',
          padding: 0,
          background: '#ffffff'
        }}
      >
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '24px 28px',
          color: '#ffffff',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '20px',
              top: '20px',
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              background: '#3b82f6',
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={22} color="#ffffff" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.3px' }}>
              SmartSpend Security Access
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Enterprise Travel & Expense Management • Role-Based Access Control
          </p>

          {/* Tab Selector */}
          <div style={{
            display: 'flex',
            marginTop: '18px',
            background: 'rgba(255,255,255,0.08)',
            padding: '3px',
            borderRadius: '8px'
          }}>
            <button
              onClick={() => { setActiveTab('login'); setError(null); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'login' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                fontWeight: activeTab === 'login' ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <LogIn size={15} />
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(null); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'register' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                fontWeight: activeTab === 'register' ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <UserPlus size={15} />
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px' }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              fontSize: '0.86rem',
              marginBottom: '16px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Work Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="email"
                    required
                    placeholder="e.g. employee@zylker.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="password"
                    required
                    placeholder="Enter account password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.35)'
                }}
              >
                {loading ? 'Signing In...' : 'Sign In to Workspace'}
              </button>

              {/* 1-Click Demo Profiles */}
              <div style={{ marginTop: '22px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="#f59e0b" />
                  Quick-Fill Demo Roles
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleDemoFill('admin')}
                    style={{
                      padding: '8px 6px',
                      borderRadius: '6px',
                      border: '1px solid #bfdbfe',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    🛡️ Admin<br /><span style={{ fontSize: '0.7rem', color: '#60a5fa' }}>Arvind</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoFill('manager')}
                    style={{
                      padding: '8px 6px',
                      borderRadius: '6px',
                      border: '1px solid #bbf7d0',
                      background: '#f0fdf4',
                      color: '#15803d',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    👔 Manager<br /><span style={{ fontSize: '0.7rem', color: '#4ade80' }}>Karthik Narayanan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoFill('employee')}
                    style={{
                      padding: '8px 6px',
                      borderRadius: '6px',
                      border: '1px solid #fed7aa',
                      background: '#fff7ed',
                      color: '#c2410c',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    👤 Employee<br /><span style={{ fontSize: '0.7rem', color: '#fb923c' }}>Aditya Verma</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arvind Ramakrishnan"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px 9px 38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Work Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                  <input
                    type="email"
                    required
                    placeholder="e.g. arvind.r@zylker.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px 9px 38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Password (min. 6 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Create a secure password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px 9px 38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    System Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      background: '#ffffff',
                      outline: 'none',
                      fontWeight: 500
                    }}
                  >
                    <option value="employee">👤 Employee (Submitter)</option>
                    <option value="manager">👔 Approving Manager</option>
                    <option value="admin">🛡️ Finance Administrator</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Department
                  </label>
                  <select
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      background: '#ffffff',
                      outline: 'none',
                      fontWeight: 500
                    }}
                  >
                    <option value="Engineering & Cloud Infra">Engineering</option>
                    <option value="Global Sales & Client Travel">Global Sales</option>
                    <option value="Marketing & Brand Growth">Marketing</option>
                    <option value="Product Design">Product Design</option>
                    <option value="Finance & Operations">Finance</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#10b981',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.35)'
                }}
              >
                {loading ? 'Creating Account...' : 'Complete Registration & Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

