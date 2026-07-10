/* ============================================================
   Page: ForgotPassword.jsx
   Description: Email-based OTP password reset flow
   ============================================================ */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=newPassword
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 800);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 800);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/login');
    }, 800);
  };

  return (
    <div className="kfpl-login">
      {/* Left Column: Cinema Wallpaper */}
      <div className="kfpl-login-wallpaper">
        <div className="kfpl-login-brand">
          <div className="kfpl-login-brand-logo">K</div>
          <h1>Kinetoscope</h1>
          <p>Agent Portal. Reset your credentials securely here.</p>
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="kfpl-login-panel">
        <div className="kfpl-login-card animate-scale-in">
          <div className="kfpl-login-logo">
            <div className="kfpl-login-logo-icon">K</div>
            <h1 className="kfpl-login-title">Reset Password</h1>
            <p className="kfpl-login-subtitle">
              {step === 1 ? 'Enter your email to receive a 6-digit OTP' : step === 2 ? 'Enter the OTP sent to your email' : 'Set your new password'}
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="kfpl-login-form animate-fade-in">
              <div className="kfpl-login-input-group">
                <label className="kfpl-login-label">Email Address</label>
                <input 
                  className="kfpl-login-input" 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  autoFocus 
                />
              </div>
              <button type="submit" className="kfpl-login-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="kfpl-login-form animate-fade-in">
              <div className="kfpl-login-input-group">
                <label className="kfpl-login-label">6-Digit OTP</label>
                <input 
                  className="kfpl-login-input" 
                  type="text" 
                  placeholder="Enter verification code" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                  maxLength={6} 
                  required 
                  autoFocus 
                  style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.25rem', fontWeight: 700 }} 
                />
              </div>
              <button type="submit" className="kfpl-login-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="kfpl-login-form animate-fade-in">
              <div className="kfpl-login-input-group">
                <label className="kfpl-login-label">New Password</label>
                <input 
                  className="kfpl-login-input" 
                  type="password" 
                  placeholder="Enter your new password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  required 
                />
              </div>
              <div className="kfpl-login-input-group">
                <label className="kfpl-login-label">Confirm Password</label>
                <input 
                  className="kfpl-login-input" 
                  type="password" 
                  placeholder="Confirm your new password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="kfpl-login-btn" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span className="kfpl-login-forgot" onClick={() => navigate('/login')}>
              ← Back to Sign In
            </span>
          </div>

          <div className="kfpl-login-footer">
            © 2026 Kinetoscope. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ END: ForgotPassword.jsx ============ */
