/* ============================================================
   Page: Settings.jsx
   Description: Admin settings and configuration
   ============================================================ */

import { useState } from 'react';
import { useToast } from '../../components/ui/Toast';

export default function Settings() {
  const addToast = useToast();
  const [sessionTimeout, setSessionTimeout] = useState('8');
  const [emailNotif, setEmailNotif] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleSave = () => {
    addToast('Settings saved successfully', 'success', 'Settings Updated');
  };

  return (
    <div className="kfpl-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Settings</h2>
          <p className="kfpl-page-subtitle">Configure platform and admin preferences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Account Settings */}
        <div className="kfpl-detail-info-card">
          <div className="kfpl-detail-info-title">Account Settings</div>
          <div className="kfpl-form" style={{ gap: '16px' }}>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Admin Name</label>
              <input className="kfpl-input" defaultValue="Super Admin" />
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Email Address</label>
              <input className="kfpl-input" defaultValue="admin@kfpl.com" type="email" />
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Change Password</label>
              <input className="kfpl-input" type="password" placeholder="Enter new password" />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="kfpl-detail-info-card">
          <div className="kfpl-detail-info-title">Security & Session</div>
          <div className="kfpl-form" style={{ gap: '16px' }}>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Session Timeout (hours)</label>
              <select className="kfpl-select" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}>
                <option value="2">2 hours</option>
                <option value="4">4 hours</option>
                <option value="8">8 hours (Default)</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border-light)' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Email Notifications</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Receive email alerts for actions</div>
              </div>
              <div className="kfpl-toggle" onClick={() => setEmailNotif(!emailNotif)}>
                <div className={`kfpl-toggle-track ${emailNotif ? 'active' : ''}`}>
                  <div className="kfpl-toggle-thumb"></div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Two-Factor Authentication</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Extra security for login</div>
              </div>
              <div className="kfpl-toggle" onClick={() => setTwoFactor(!twoFactor)}>
                <div className={`kfpl-toggle-track ${twoFactor ? 'active' : ''}`}>
                  <div className="kfpl-toggle-thumb"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Configuration */}
        <div className="kfpl-detail-info-card">
          <div className="kfpl-detail-info-title">Platform Configuration</div>
          <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Platform Version</span><span className="kfpl-detail-info-value">v1.0.0</span></div>
          <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Active Sessions</span><span className="kfpl-detail-info-value">1 / 1</span></div>
          <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">API Status</span><span className="kfpl-detail-info-value" style={{ color: 'var(--color-success)', fontWeight: 600 }}>Connected</span></div>
          <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Last Backup</span><span className="kfpl-detail-info-value">2025-04-12 02:00 AM</span></div>
          <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Database Size</span><span className="kfpl-detail-info-value">2.4 GB</span></div>
        </div>

        {/* Investment Segments Config */}
        <div className="kfpl-detail-info-card">
          <div className="kfpl-detail-info-title">Investment Segments</div>
          <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Film Making</span><span className="kfpl-detail-info-value" style={{ color: 'var(--color-gold)' }}>● Active</span></div>
          <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Distribution</span><span className="kfpl-detail-info-value" style={{ color: '#1565C0' }}>● Active</span></div>
          <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Music</span><span className="kfpl-detail-info-value" style={{ color: '#2E7D32' }}>● Active</span></div>
          <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Trading & Syndication</span><span className="kfpl-detail-info-value" style={{ color: '#E65100' }}>● Active</span></div>
          <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Content IP Bank</span><span className="kfpl-detail-info-value" style={{ color: '#7B1FA2' }}>● Active</span></div>
          <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Film Exhibition</span><span className="kfpl-detail-info-value" style={{ color: '#00838F' }}>● Active</span></div>
        </div>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="kfpl-btn kfpl-btn--primary" onClick={handleSave}>Save Settings</button>
      </div>
    </div>
  );
}

/* ============ END: Settings.jsx ============ */
