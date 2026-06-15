/* ============================================================
   Page: Settings.jsx
   Description: Admin settings and configuration
   ============================================================ */

import { useState } from 'react';
import { useToast } from '../../components/ui/Toast';

export default function Settings() {
  const addToast = useToast();

  // Auth/Email State
  const [currentUser, setCurrentUser] = useState(() => {
    const authData = localStorage.getItem('kfpl_auth');
    return authData ? JSON.parse(authData) : { token: 'mock-jwt', admin: { name: 'Super Admin', email: 'admin@kfpl.com' } };
  });

  const currentEmail = currentUser?.admin?.email || 'admin@kfpl.com';

  // Email Change Form State
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // TFA Toggle State
  const [twoFactor, setTwoFactor] = useState(() => {
    return localStorage.getItem('kfpl_tfa') === 'true';
  });

  // Handle TFA toggle
  const handleTfaToggle = () => {
    const newValue = !twoFactor;
    setTwoFactor(newValue);
    localStorage.setItem('kfpl_tfa', String(newValue));
    addToast(
      `Two-Factor Authentication turned ${newValue ? 'ON' : 'OFF'}`,
      newValue ? 'success' : 'info',
      'Security Update'
    );
  };

  // Handle Send OTP
  const handleSendOtp = () => {
    setEmailError('');
    setEmailSuccess('');

    if (!newEmail) {
      setEmailError('Please enter a new email address.');
      return;
    }
    if (newEmail === currentEmail) {
      setEmailError('New email cannot be the same as current email.');
      return;
    }
    if (!newEmail.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setSendingOtp(true);
    // Simulate sending OTP
    setTimeout(() => {
      setOtpSent(true);
      setSendingOtp(false);
      addToast('Verification OTP sent to ' + newEmail, 'success', 'OTP Sent');
      setEmailError('');
    }, 800);
  };

  // Handle Verify OTP & Change Email
  const handleVerifyOtp = () => {
    setEmailError('');
    setEmailSuccess('');

    if (!emailOtp) {
      setEmailError('Please enter the verification OTP.');
      return;
    }

    setVerifyingOtp(true);
    // Simulate verification
    setTimeout(() => {
      setVerifyingOtp(false);
      // Mock OTP is 1234
      if (emailOtp === '1234') {
        const updatedUser = {
          ...currentUser,
          admin: {
            ...currentUser.admin,
            email: newEmail
          }
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('kfpl_auth', JSON.stringify(updatedUser));
        
        setEmailSuccess('Email changed successfully!');
        setNewEmail('');
        setEmailOtp('');
        setOtpSent(false);
        addToast('Email address updated successfully', 'success', 'Email Changed');
      } else {
        setEmailError('Invalid OTP code. Please enter 1234 to verify.');
      }
    }, 800);
  };

  // Handle Update Password
  const handleUpdatePassword = () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password should be at least 6 characters.');
      return;
    }

    setUpdatingPassword(true);
    // Simulate password update
    setTimeout(() => {
      setUpdatingPassword(false);
      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast('Your password has been changed successfully', 'success', 'Password Updated');
    }, 800);
  };

  return (
    <div className="kfpl-page animate-fade-slide-up">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Settings</h2>
          <p className="kfpl-page-subtitle">Configure admin credentials and login security preferences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column: Change Email & Security Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Change Email */}
          <div className="kfpl-detail-info-card">
            <div className="kfpl-detail-info-title">Change Email Address</div>
            
            {emailError && (
              <div className="kfpl-alert kfpl-alert--danger" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {emailError}
              </div>
            )}

            {emailSuccess && (
              <div className="kfpl-alert kfpl-alert--success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                {emailSuccess}
              </div>
            )}

            <div className="kfpl-form" style={{ gap: '16px' }}>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Current Email</label>
                <input className="kfpl-input" value={currentEmail} readOnly disabled style={{ background: 'var(--color-surface)', cursor: 'not-allowed' }} />
              </div>

              <div className="kfpl-input-group">
                <label className="kfpl-input-label">New Email Address</label>
                <input 
                  className="kfpl-input" 
                  type="email" 
                  placeholder="Enter new email" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={otpSent}
                />
              </div>

              {otpSent && (
                <div className="kfpl-input-group" style={{ animation: 'fadeIn 0.3s ease' }}>
                  <label className="kfpl-input-label">Enter Verification OTP</label>
                  <input 
                    className="kfpl-input" 
                    type="text" 
                    placeholder="Enter code (use 1234)" 
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    A 4-digit code was sent to your new email. Enter <strong>1234</strong> to verify.
                  </span>
                </div>
              )}

              <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
                {!otpSent ? (
                  <button 
                    className="kfpl-btn kfpl-btn--primary" 
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                ) : (
                  <>
                    <button 
                      className="kfpl-btn kfpl-btn--ghost" 
                      onClick={() => setOtpSent(false)}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Back
                    </button>
                    <button 
                      className="kfpl-btn kfpl-btn--primary" 
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp}
                      style={{ flex: 2, justifyContent: 'center' }}
                    >
                      {verifyingOtp ? 'Verifying...' : 'Verify & Update Email'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Security & TFA Options */}
          <div className="kfpl-detail-info-card">
            <div className="kfpl-detail-info-title">Security Settings</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Two-Factor Authentication (2FA)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>Requires entering an email OTP code (123456) when logging in</div>
              </div>
              <div className="kfpl-toggle" onClick={handleTfaToggle}>
                <div className={`kfpl-toggle-track ${twoFactor ? 'active' : ''}`}>
                  <div className="kfpl-toggle-thumb"></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Change Password */}
        <div className="kfpl-detail-info-card" style={{ height: 'fit-content' }}>
          <div className="kfpl-detail-info-title">Change Password</div>

          {passwordError && (
            <div className="kfpl-alert kfpl-alert--danger" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="kfpl-alert kfpl-alert--success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              {passwordSuccess}
            </div>
          )}

          <div className="kfpl-form" style={{ gap: '16px' }}>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Current Password</label>
              <input 
                className="kfpl-input" 
                type="password" 
                placeholder="Enter current password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">New Password</label>
              <input 
                className="kfpl-input" 
                type="password" 
                placeholder="Enter new password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Confirm New Password</label>
              <input 
                className="kfpl-input" 
                type="password" 
                placeholder="Confirm new password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button 
              className="kfpl-btn kfpl-btn--primary" 
              onClick={handleUpdatePassword}
              disabled={updatingPassword}
              style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}
            >
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ END: Settings.jsx ============ */
