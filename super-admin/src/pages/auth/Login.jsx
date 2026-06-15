/* ============================================================
   Page: Login.jsx
   Description: Admin login page with glassmorphism card and conditional 2FA OTP flow
   ============================================================ */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  
  // Stacking steps: 'credentials' or 'otp'
  const [step, setStep] = useState('credentials');
  
  // Credentials Credentials Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP Verification Form State
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  
  // Common states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Submit Credentials (Step 1)
  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    
    // Simulate API authorization check
    setTimeout(() => {
      // Allow current email as set in settings, fallback to admin@kfpl.com
      const savedAuth = localStorage.getItem('kfpl_auth');
      const activeAdminEmail = savedAuth ? JSON.parse(savedAuth)?.admin?.email : 'admin@kfpl.com';
      
      if ((email === activeAdminEmail || email === 'admin@kfpl.com') && password === 'admin123') {
        // Correct credentials entered. Check if 2FA (TFA) toggle is ON.
        const isTfaEnabled = localStorage.getItem('kfpl_tfa') === 'true';
        
        if (isTfaEnabled) {
          // Switch to OTP step
          setStep('otp');
          setError('');
        } else {
          // No TFA, log in directly
          localStorage.setItem('kfpl_auth', JSON.stringify({ 
            token: 'mock-jwt', 
            admin: { name: 'Super Admin', email } 
          }));
          navigate('/dashboard');
        }
      } else {
        setError(`Invalid credentials. Try ${activeAdminEmail} / admin123`);
      }
      setLoading(false);
    }, 800);
  };

  // Submit OTP Verification (Step 2)
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setOtpError('');

    if (!otp) {
      setOtpError('Please enter the verification code.');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      // Mock code is 123456
      if (otp === '123456') {
        localStorage.setItem('kfpl_auth', JSON.stringify({ 
          token: 'mock-jwt', 
          admin: { name: 'Super Admin', email: email || 'admin@kfpl.com' } 
        }));
        navigate('/dashboard');
      } else {
        setOtpError('Invalid OTP. Please enter 123456 to log in.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="kfpl-login">
      <div className="kfpl-login-card animate-scale-in">
        {/* Logo */}
        <div className="kfpl-login-logo">
          <div className="kfpl-login-logo-icon">K</div>
          <h1 className="kfpl-login-title">Super Admin Portal</h1>
          <p className="kfpl-login-subtitle">Kross Film Productions Ltd.</p>
        </div>

        {/* ── STEP 1: CREDENTIAL FORM ── */}
        {step === 'credentials' && (
          <>
            {error && (
              <div className="kfpl-login-error animate-fade-in">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}

            <form className="kfpl-login-form" onSubmit={handleCredentialsSubmit}>
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
          </>
        )}

        {/* ── STEP 2: TWO-FACTOR AUTHENTICATION FORM ── */}
        {step === 'otp' && (
          <div className="animate-fade-in">
            <div className="kfpl-login-tfa-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-gold)', marginBottom: '12px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '28px', height: '28px' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>Two-Factor Authentication</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                We sent a verification code to your email.<br />Please enter the 6-digit code below.
              </p>
            </div>

            {otpError && (
              <div className="kfpl-login-error animate-fade-in" style={{ marginBottom: '16px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {otpError}
              </div>
            )}

            <form className="kfpl-login-form" onSubmit={handleOtpSubmit}>
              <div className="kfpl-login-input-group">
                <label className="kfpl-login-label">Verification Code</label>
                <input
                  type="text"
                  maxLength="6"
                  className="kfpl-login-input"
                  placeholder="Enter 6-digit code (use 123456)"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.25rem', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="kfpl-login-btn"
                  style={{ flex: 1, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-gold)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                  onClick={() => {
                    setStep('credentials');
                    setOtp('');
                    setOtpError('');
                  }}
                  disabled={loading}
                >
                  Back
                </button>
                <button type="submit" className="kfpl-login-btn" style={{ flex: 2 }} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="kfpl-login-footer">
          © 2025 Kross Film Productions Ltd. All rights reserved.
        </div>
      </div>
    </div>
  );
}

/* ============ END: Login.jsx ============ */
