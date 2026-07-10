/* ============================================================
   Page: Settings.jsx
   Description: Settings view for Agent Portal. Includes 2FA configuration
   and Change Password (with OTP verification via real API).
   Email change option has been removed per admin directive.
   ============================================================ */

import { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { apiRequest } from '../../config/apiHelper';

const settingsIcons = {
  lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

export default function Settings() {
  const toast = useToast();
  const [emailVal, setEmailVal] = useState('');
  const [loading, setLoading] = useState(true);

  // 2FA State
  const [tfaEnabled, setTfaEnabled] = useState(
    localStorage.getItem('kfpl_agent_2fa_enabled') === 'true'
  );

  // Password Change Flow States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordOtp, setPasswordOtp] = useState('');
  const [isPasswordOtpSent, setIsPasswordOtpSent] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch current session / email on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await apiRequest('/api/agent/auth/me');
        const user = response.agent || response.user || response;
        setEmailVal(user.email || '');
      } catch (err) {
        console.error('Failed to load session:', err);
        // Fallback: try to get from localStorage
        try {
          const stored = JSON.parse(localStorage.getItem('kfpl_agent_auth') || '{}');
          setEmailVal(stored.email || stored.user?.email || '');
        } catch { /* ignore */ }
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  const handleTfaToggle = (e) => {
    const checked = e.target.checked;
    setTfaEnabled(checked);
    localStorage.setItem('kfpl_agent_2fa_enabled', checked ? 'true' : 'false');
    toast(`Two-Factor Authentication ${checked ? 'Enabled' : 'Disabled'} successfully.`, 'success');
  };

  const handleSendPasswordOtp = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast('Please fill out all password fields.', 'warning');
      return;
    }
    if (newPassword.length < 8) {
      toast('New password must be at least 8 characters.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('New Password and Confirm Password do not match.', 'danger');
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest('/api/agent/settings/change-password/send-otp', {
        method: 'POST',
        body: JSON.stringify({ currentPassword }),
      });
      setIsPasswordOtpSent(true);
      toast('Security OTP sent to your registered email!', 'info');
    } catch (err) {
      console.error('Send OTP error:', err);
      toast(err.message || 'Failed to send OTP. Check your current password.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyPasswordOtp = async (e) => {
    e.preventDefault();
    if (!passwordOtp || passwordOtp.length < 4) {
      toast('Please enter a valid OTP code.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest('/api/agent/settings/change-password/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          otp: passwordOtp,
        }),
      });
      toast('Password changed successfully!', 'success');
      // Reset flow
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordOtp('');
      setIsPasswordOtpSent(false);
      setShowPasswordSection(false);
    } catch (err) {
      console.error('Verify OTP error:', err);
      toast(err.message || 'Invalid OTP or password change failed.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="kfpl-page" id="settings-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Security Settings</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Manage Two-Factor Authentication (2FA) and login password.
          </p>
        </div>
      </div>

      {/* ── Two Factor Authentication Toggle Card ─────────────────────── */}
      <div className="kfpl-card" style={{ padding: 28, background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border-light)', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--color-gold-glow)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {settingsIcons.shield}
            </div>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-navy)' }}>Two-Factor Authentication (2FA)</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5, maxWidth: 620 }}>
                Adds an extra layer of protection to your agent account. When enabled, an OTP code is sent to your email to verify your identity upon login.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: tfaEnabled ? 'var(--color-gold-dark)' : 'var(--color-text-muted)' }}>
              {tfaEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <label className="kfpl-switch" style={{ position: 'relative', display: 'inline-block', width: 46, height: 24 }}>
              <input
                type="checkbox"
                checked={tfaEnabled}
                onChange={handleTfaToggle}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span className="kfpl-switch-slider" style={{
                position: 'absolute',
                cursor: 'pointer',
                inset: 0,
                backgroundColor: tfaEnabled ? 'var(--color-gold)' : '#CBD5E1',
                transition: '.3s',
                borderRadius: 24,
                boxShadow: tfaEnabled ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: 18,
                  width: 18,
                  left: tfaEnabled ? 24 : 3,
                  bottom: 3,
                  backgroundColor: 'white',
                  transition: '.3s',
                  borderRadius: '50%'
                }} />
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Security Configuration ─────────────────────── */}
      <div className="kfpl-card kfpl-profile-card kfpl-profile-security-card">
        <div className="kfpl-card-header" style={{ borderBottom: '1px solid var(--color-border-light)', paddingBottom: 16 }}>
          <h3><span className="kfpl-profile-card-icon">{settingsIcons.lock}</span>Credential Management</h3>
        </div>
        <div className="kfpl-card-body" style={{ paddingTop: 24 }}>

          {/* Registered Email Display (read-only) */}
          <div style={{ background: '#FAFDFB', padding: 20, borderRadius: 'var(--radius-lg)', border: '1px solid #E2EDE7', boxShadow: 'var(--shadow-sm)', marginBottom: 24 }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-navy)' }}>Registered Email</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, color: 'var(--color-text-muted)' }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                {loading ? 'Loading...' : (emailVal || 'Not available')}
              </span>
              <span className="kfpl-badge kfpl-badge--info" style={{ fontSize: '0.7rem', marginLeft: 8 }}>Read-only</span>
            </div>
            <p style={{ margin: '10px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              Email address changes are managed by the Super Admin. Contact admin to update.
            </p>
          </div>

          {/* Change Password Form Block */}
          <div style={{ background: '#FAFDFB', padding: 28, borderRadius: 'var(--radius-lg)', border: '1px solid #E2EDE7', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-navy)' }}>Update Password</h4>
              {!isPasswordOtpSent && (
                <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => setShowPasswordSection(!showPasswordSection)}>
                  {showPasswordSection ? 'Cancel' : 'Modify'}
                </button>
              )}
            </div>

            {showPasswordSection && (
              <div>
                {!isPasswordOtpSent ? (
                  <form onSubmit={handleSendPasswordOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="kfpl-form-group">
                      <label className="kfpl-form-label">Current Password</label>
                      <div className="kfpl-login-password-wrap">
                        <input
                          className="kfpl-form-input"
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Enter current password"
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          required
                        />
                        <button type="button" className="kfpl-login-password-toggle" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            {showCurrentPassword ? (
                              <>
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                <line x1="1" y1="1" x2="23" y2="23"/>
                              </>
                            ) : (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="kfpl-form-group">
                      <label className="kfpl-form-label">New Password</label>
                      <div className="kfpl-login-password-wrap">
                        <input
                          className="kfpl-form-input"
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          required
                        />
                        <button type="button" className="kfpl-login-password-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            {showNewPassword ? (
                              <>
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                <line x1="1" y1="1" x2="23" y2="23"/>
                              </>
                            ) : (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="kfpl-form-group">
                      <label className="kfpl-form-label">Confirm New Password</label>
                      <div className="kfpl-login-password-wrap">
                        <input
                          className="kfpl-form-input"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          required
                        />
                        <button type="button" className="kfpl-login-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            {showConfirmPassword ? (
                              <>
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                <line x1="1" y1="1" x2="23" y2="23"/>
                              </>
                            ) : (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>
                    <button type="submit" className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" style={{ alignSelf: 'flex-start' }} disabled={submitting}>
                      {submitting ? 'Sending...' : 'Send Security OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPasswordOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                      A safety OTP verification code was sent to <strong style={{ color: 'var(--color-navy)' }}>{emailVal}</strong>. Enter it below to update your login password.
                    </div>
                    <div className="kfpl-form-group">
                      <label className="kfpl-form-label">6-Digit Safety OTP</label>
                      <input
                        className="kfpl-form-input"
                        type="text"
                        maxLength="6"
                        placeholder="Enter OTP"
                        value={passwordOtp}
                        onChange={e => setPasswordOtp(e.target.value.replace(/\D/g, ''))}
                        required
                        style={{ textAlign: 'center', letterSpacing: 6, fontWeight: 700, fontSize: '1.1rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button type="button" className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => { setIsPasswordOtpSent(false); setPasswordOtp(''); }}>
                        Back
                      </button>
                      <button type="submit" className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" disabled={submitting}>
                        {submitting ? 'Verifying...' : 'Verify & Change Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
            {!showPasswordSection && (
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Password changes require multi-factor safety check verification sent to your email.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
