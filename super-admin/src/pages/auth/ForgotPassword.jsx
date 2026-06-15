/* ============================================================
   Page: ForgotPassword.jsx
   Description: Password reset flow with OTP
   ============================================================ */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSent(true);
  };

  return (
    <div className="kfpl-login">
      <div className="kfpl-login-card">
        <div className="kfpl-login-logo">
          <div className="kfpl-login-logo-icon">K</div>
          <h1 className="kfpl-login-title">Reset Password</h1>
          <p className="kfpl-login-subtitle">Enter your email to receive a reset link</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✉️</div>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px', fontSize: '0.9375rem' }}>
              A password reset link has been sent to <strong style={{ color: 'var(--color-gold)' }}>{email}</strong>. 
              Please check your inbox.
            </p>
            <button className="kfpl-login-btn" onClick={() => navigate('/login')}>
              Back to Login
            </button>
          </div>
        ) : (
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
                required
              />
            </div>
            <button type="submit" className="kfpl-login-btn">Send Reset Link</button>
            <div style={{ textAlign: 'center' }}>
              <span className="kfpl-login-forgot" onClick={() => navigate('/login')}>
                ← Back to Login
              </span>
            </div>
          </form>
        )}

        <div className="kfpl-login-footer">
          © 2025 Kross Film Productions Ltd. All rights reserved.
        </div>
      </div>
    </div>
  );
}

/* ============ END: ForgotPassword.jsx ============ */
