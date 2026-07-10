/* ============================================================
   Page: Profile.jsx
   Description: Agent profile view with nominee and bank details management.
   ============================================================ */

import { useState, useEffect } from 'react';
import { formatCurrency } from '../../data/mockData';
import { useToast } from '../../components/ui/Toast';
import { apiRequest } from '../../config/apiHelper';

const profileIcons = {
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  bank: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>,
  nominee: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 11c1.66 0 3-1.57 3-3.5S17.66 4 16 4s-3 1.57-3 3.5S14.34 11 16 11z"/><path d="M8 11c1.66 0 3-1.57 3-3.5S9.66 4 8 4 5 5.57 5 7.5 6.34 11 8 11z"/><path d="M2 20c.55-3.1 3.01-5 6-5 1.25 0 2.38.32 3.31.9"/><path d="M22 20c-.55-3.1-3.01-5-6-5-1.25 0-2.38.32-3.31.9"/></svg>
};

export default function Profile() {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ commissionPaid: 0, commissionPending: 0 });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profRes, dashRes] = await Promise.all([
          apiRequest('/api/agent/profile'),
          apiRequest('/api/agent/dashboard').catch(() => null)
        ]);

        const extractProfile = (res) => {
          if (!res) return null;
          if (res.profile) return res.profile;
          if (res.agent) return res.agent;
          if (res.data) {
            if (res.data.profile) return res.data.profile;
            if (res.data.agent) return res.data.agent;
            return res.data;
          }
          return res;
        };
        const rawProfile = extractProfile(profRes);
        setProfile(rawProfile);

        if (dashRes) {
          setStats({
            commissionPaid: dashRes.commissionPaid ?? 0,
            commissionPending: dashRes.commissionPending ?? 0,
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        toast('Failed to load agent profile', 'error', 'Error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="kfpl-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading profile...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="kfpl-page">
        <div className="kfpl-empty-state">
          <div className="kfpl-empty-state-title">Profile not found</div>
          <p>Failed to load your profile details from the server.</p>
        </div>
      </div>
    );
  }

  const name = profile.name || profile.fullName || 'Agent';
  const email = profile.email || '';
  const phone = profile.phone || '';
  const address = profile.address || 'India';
  const agentId = profile.agentId || '—';
  const status = profile.status || 'active';
  const kycStatus = (profile.kycStatus || profile.kyc || 'PENDING').toUpperCase();
  const joinDate = profile.joiningDate || profile.joinDate || profile.createdAt;
  const memberSince = joinDate
    ? new Date(joinDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const bankName = profile.bankName || '—';
  const bankAccount = profile.bankAccount || profile.accountNumber || '—';
  const ifsc = profile.ifsc || profile.ifscCode || '—';

  const nomineeName = profile.nomineeName || profile.nominee?.name || '—';
  const nomineeRelation = profile.nomineeRelation || profile.nominee?.relation || '—';
  const nomineeContact = profile.nomineePhone || profile.nominee?.contact || '—';
  const nomineeEmail = profile.nomineeEmail || profile.nominee?.email || 'Not provided';

  return (
    <div className="kfpl-page" id="profile-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>My Profile</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Profile details. Nominee changes request approval ke through update honge.
          </p>
        </div>
      </div>

      <div className="kfpl-profile-hero">
        <div className="kfpl-profile-avatar-lg">
          {name.charAt(0)}
        </div>
        <div className="kfpl-profile-hero-info">
          <div className="kfpl-profile-eyebrow">Agent account</div>
          <h2>{name}</h2>
          <div className="kfpl-profile-hero-id">{agentId}</div>
          <div className="kfpl-profile-hero-status" style={{ display: 'flex', gap: '8px' }}>
            <span className={`kfpl-badge kfpl-badge--${status.toLowerCase() === 'active' ? 'success' : 'warning'}`}>{status}</span>
            <span className={`kfpl-badge kfpl-badge--${kycStatus === 'VERIFIED' ? 'success' : kycStatus === 'REJECTED' ? 'rejected' : 'warning'}`}>KYC: {kycStatus}</span>
          </div>
        </div>
        <div className="kfpl-profile-hero-stats">
          <div className="kfpl-profile-stat">
            <span className="kfpl-profile-stat-label">Total Earned</span>
            <span className="kfpl-profile-stat-value">{formatCurrency(stats.commissionPaid)}</span>
          </div>
          <div className="kfpl-profile-stat">
            <span className="kfpl-profile-stat-label">Pending Payout</span>
            <span className="kfpl-profile-stat-value">{formatCurrency(stats.commissionPending)}</span>
          </div>
        </div>
      </div>

      <div className="kfpl-profile-grid" style={{ marginTop: 24 }}>
        <div className="kfpl-card kfpl-profile-card kfpl-profile-card--wide">
          <div className="kfpl-card-header">
            <h3><span className="kfpl-profile-card-icon">{profileIcons.user}</span>Personal Information</h3>
          </div>
          <div className="kfpl-card-body">
            <div className="kfpl-profile-detail-row">
              <span className="kfpl-profile-detail-label">Full Name</span>
              <span className="kfpl-profile-detail-value">{name}</span>
            </div>
            <div className="kfpl-profile-detail-row">
              <span className="kfpl-profile-detail-label">Email</span>
              <span className="kfpl-profile-detail-value">{email}</span>
            </div>
            <div className="kfpl-profile-detail-row">
              <span className="kfpl-profile-detail-label">Phone</span>
              <span className="kfpl-profile-detail-value">{phone}</span>
            </div>
            <div className="kfpl-profile-detail-row">
              <span className="kfpl-profile-detail-label">Address</span>
              <span className="kfpl-profile-detail-value">{address}</span>
            </div>
          </div>
        </div>

        <div className="kfpl-card kfpl-profile-card">
          <div className="kfpl-card-header">
            <h3><span className="kfpl-profile-card-icon">{profileIcons.shield}</span>Account Details</h3>
          </div>
          <div className="kfpl-card-body">
            <div className="kfpl-profile-detail-row">
              <span className="kfpl-profile-detail-label">Agent ID</span>
              <span className="kfpl-profile-detail-value kfpl-mono">{agentId}</span>
            </div>
            <div className="kfpl-profile-detail-row">
              <span className="kfpl-profile-detail-label">Account Status</span>
              <span className={`kfpl-badge kfpl-badge--${status.toLowerCase() === 'active' ? 'success' : 'warning'}`}>{status}</span>
            </div>
            <div className="kfpl-profile-detail-row">
              <span className="kfpl-profile-detail-label">KYC Status</span>
              <span className={`kfpl-badge kfpl-badge--${kycStatus === 'VERIFIED' ? 'success' : kycStatus === 'REJECTED' ? 'rejected' : 'warning'}`}>{kycStatus}</span>
            </div>
            <div className="kfpl-profile-detail-row">
              <span className="kfpl-profile-detail-label">Member Since</span>
              <span className="kfpl-profile-detail-value">{memberSince}</span>
            </div>
          </div>
        </div>

        <div className="kfpl-card kfpl-profile-card">
          <div className="kfpl-card-header">
            <h3><span className="kfpl-profile-card-icon">{profileIcons.bank}</span>Bank Details</h3>
          </div>
          <div className="kfpl-card-body">
            <div className="kfpl-profile-detail-row">
              <span className="kfpl-profile-detail-label">Bank Name</span>
              <span className="kfpl-profile-detail-value">{bankName}</span>
            </div>
            <div className="kfpl-profile-detail-row">
              <span className="kfpl-profile-detail-label">Account Number</span>
              <span className="kfpl-profile-detail-value kfpl-mono">{bankAccount}</span>
            </div>
            <div className="kfpl-profile-detail-row">
              <span className="kfpl-profile-detail-label">IFSC Code</span>
              <span className="kfpl-profile-detail-value kfpl-mono">{ifsc}</span>
            </div>
          </div>
        </div>

        <div className="kfpl-card kfpl-profile-card">
          <div className="kfpl-card-header">
            <h3><span className="kfpl-profile-card-icon">{profileIcons.nominee}</span>Nominee Details</h3>
          </div>
          <div className="kfpl-card-body">
            <div className="kfpl-profile-detail-row">
              <span className="kfpl-profile-detail-label">Name</span>
              <span className="kfpl-profile-detail-value">{nomineeName}</span>
            </div>
            <div className="kfpl-profile-detail-row">
              <span className="kfpl-profile-detail-label">Relation</span>
              <span className="kfpl-profile-detail-value">{nomineeRelation}</span>
            </div>
            <div className="kfpl-profile-detail-row">
              <span className="kfpl-profile-detail-label">Contact</span>
              <span className="kfpl-profile-detail-value">{nomineeContact}</span>
            </div>
            <div className="kfpl-profile-detail-row">
              <span className="kfpl-profile-detail-label">Email</span>
              <span className="kfpl-profile-detail-value">{nomineeEmail}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
