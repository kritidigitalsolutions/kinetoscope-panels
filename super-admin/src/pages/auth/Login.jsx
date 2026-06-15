/* ============================================================
   Page: Login.jsx
   Description: Admin login page with glassmorphism card
   ============================================================ */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    // Simulate login
    setTimeout(() => {
      if (email === 'admin@kfpl.com' && password === 'admin123') {
        localStorage.setItem('kfpl_auth', JSON.stringify({ token: 'mock-jwt', admin: { name: 'Super Admin', email } }));
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Try admin@kfpl.com / admin123');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="kfpl-login">
      <div className="kfpl-login-card">
        {/* Logo */}
        <div className="kfpl-login-logo">
          <div className="kfpl-login-logo-icon">K</div>
          <h1 className="kfpl-login-title">Super Admin Portal</h1>
          <p className="kfpl-login-subtitle">Kross Film Productions Ltd.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="kfpl-login-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form className="kfpl-login-form" onSubmit={handleSubmit}>
          <div className="kfpl-login-input-group">
            <label className="kfpl-login-label">Email Address</label>
            <input
              type="email"
              className="kfpl-login-input"
              placeholder="admin@kfpl.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div className="kfpl-login-input-group">
            <label className="kfpl-login-label">Password</label>
            <div className="kfpl-login-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                className="kfpl-login-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="kfpl-login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="kfpl-login-options">
            <label className="kfpl-login-remember">
              <input type="checkbox" /> Remember me
            </label>
            <span className="kfpl-login-forgot" onClick={() => navigate('/forgot-password')}>
              Forgot Password?
            </span>
          </div>

          <button type="submit" className="kfpl-login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="kfpl-login-footer">
          © 2025 Kross Film Productions Ltd. All rights reserved.
        </div>
      </div>
    </div>
  );
}

/* ============ END: Login.jsx ============ */
