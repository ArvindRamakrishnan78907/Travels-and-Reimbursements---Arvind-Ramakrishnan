import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, AlertCircle, Building2 } from 'lucide-react';

export default function AuthScreen({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('employee');
  const [regDept, setRegDept] = useState('Engineering');

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
        throw new Error(data.message || 'Invalid email or password.');
      }

      localStorage.setItem('smartspend_token', data.token);
      localStorage.setItem('smartspend_user', JSON.stringify(data.user));
      onAuthSuccess(data.user, data.token, data.message);
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email, password) => {
    setError(null);
    setActiveTab('login');
    setLoginEmail(email);
    setLoginPassword(password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          background: '#1e293b',
          color: '#ffffff',
          marginBottom: '12px'
        }}>
          <Building2 size={24} />
        </div>
        <h1 style={{
          margin: '0 0 6px 0',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#0f172a',
          letterSpacing: '-0.3px'
        }}>
          SmartSpend
        </h1>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
          Corporate Travel & Reimbursement System
        </p>
      </div>

      {/* Auth Card */}
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '400px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
        padding: '28px 28px',
        boxSizing: 'border-box'
      }}>
        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: 'transparent',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'login' ? 600 : 500,
              color: activeTab === 'login' ? '#0f172a' : '#64748b',
              borderBottom: activeTab === 'login' ? '2px solid #0f172a' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-1px'
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(null); }}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: 'transparent',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'register' ? 600 : 500,
              color: activeTab === 'register' ? '#0f172a' : '#64748b',
              borderBottom: activeTab === 'register' ? '2px solid #0f172a' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-1px'
            }}
          >
            Register
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 12px',
            borderRadius: '6px',
            background: '#fef2f2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            fontSize: '0.82rem',
            marginBottom: '16px'
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Form */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '10px' }} />
                <input
                  type="email"
                  required
                  placeholder="name@zylker.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 12px 8px 34px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    color: '#0f172a'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '10px' }} />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 12px 8px 34px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    color: '#0f172a'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                background: '#0f172a',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
              <ArrowRight size={15} />
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '10px' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Arvind"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 12px 8px 34px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Work Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '10px' }} />
                <input
                  type="email"
                  required
                  placeholder="arvind@zylker.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 12px 8px 34px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '10px' }} />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 12px 8px 34px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Role
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    background: '#ffffff',
                    outline: 'none'
                  }}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Department
                </label>
                <select
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    background: '#ffffff',
                    outline: 'none'
                  }}
                >
                  <option value="Finance & Accounts">Finance</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Sales & Operations">Sales</option>
                  <option value="Human Resources">HR</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                background: '#0f172a',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        )}

        {/* Demo Accounts for Easy Testing */}
        <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            marginBottom: '8px'
          }}>
            Quick Login (Test Accounts)
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => fillCredentials('admin@zylker.com', 'admin123')}
              style={{
                flex: 1,
                padding: '6px 4px',
                borderRadius: '5px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '0.74rem',
                color: '#334155',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 500
              }}
              title="Click to fill Admin credentials"
            >
              Admin<br /><span style={{ fontSize: '0.68rem', color: '#2563eb' }}>Arvind</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('manager@zylker.com', 'manager123')}
              style={{
                flex: 1,
                padding: '6px 4px',
                borderRadius: '5px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '0.74rem',
                color: '#334155',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 500
              }}
              title="Click to fill Manager credentials"
            >
              Manager<br /><span style={{ fontSize: '0.68rem', color: '#16a34a' }}>Karthik</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('employee@zylker.com', 'employee123')}
              style={{
                flex: 1,
                padding: '6px 4px',
                borderRadius: '5px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '0.74rem',
                color: '#334155',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 500
              }}
              title="Click to fill Employee credentials"
            >
              Employee<br /><span style={{ fontSize: '0.68rem', color: '#d97706' }}>Aditya</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
