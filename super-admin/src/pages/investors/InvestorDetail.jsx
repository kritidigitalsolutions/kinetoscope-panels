/* ============================================================
   Page: InvestorDetail.jsx
   Description: Investor profile with tabs for investments, ROI, perks
   ============================================================ */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import { investors, formatCurrency } from '../../data/mockData';
import { useToast } from '../../components/ui/Toast';

// ── SVG Icon Definitions ───────────────────────
const tabIcons = {
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  investments: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  roi: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  perks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
};

const infoIcons = {
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  mapPin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  fileText: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  landmark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" /><path d="M4 6v12c0 1.1.9 2 2 2h14v-4" /><path d="M18 12a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4v-6z" />
    </svg>
  )
};

const perkDetails = {
  'Priority Support': { desc: 'Direct 24/7 dedicated support helpline and query resolution within 2 hours.', icon: '📞' },
  'Annual Gala Invite': { desc: 'Complimentary premium access and VIP seating at the annual film gala and awards.', icon: '🎟️' },
  'Quarterly Review': { desc: 'One-on-one portfolio review sessions with senior investment strategists.', icon: '📊' },
  'Film Set Visit': { desc: 'Exclusive behind-the-scenes access to active KFPL production sets and meet & greet.', icon: '🎬' },
  'VIP Screening': { desc: 'Private premiere screening invites for upcoming movie and content releases.', icon: '🍿' },
  'Revenue Share Bonus': { desc: 'Additional 1.5% bonus payout on high-performing distribution segments.', icon: '💰' }
};

export default function InvestorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  const investor = investors.find(inv => inv.id === Number(id));

  const [localRiskProfile, setLocalRiskProfile] = useState(investor ? (investor.riskProfile || 'Conservative') : 'Conservative');
  const [localStatus, setLocalStatus] = useState(investor ? investor.status : 'active');

  if (!investor) {
    return (
      <div className="kfpl-page">
        <div className="kfpl-empty">
          <div className="kfpl-empty-title">Client not found</div>
          <button className="kfpl-btn kfpl-btn--primary mt-4" onClick={() => navigate('/investors')}>Back to List</button>
        </div>
      </div>
    );
  }

  const tabs = ['profile', 'investments', 'roi', 'perks'];

  // ROI tab calculations
  const totalPaidROI = investor.roiHistory.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
  const totalPendingROI = investor.roiHistory.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);

  const riskMap = {
    'Conservative': 'active', // green
    'Moderate': 'gold',       // gold
    'Aggressive': 'rejected'   // red
  };

  const handleRiskProfileChange = (e) => {
    const newRisk = e.target.value;
    setLocalRiskProfile(newRisk);
    investor.riskProfile = newRisk; // updates in-memory mock data
    addToast(`Risk profile updated to ${newRisk}`, 'success', 'Profile Updated');
  };

  const handleBlockClient = () => {
    const newStatus = localStatus === 'suspended' ? 'active' : 'suspended';
    investor.status = newStatus;
    setLocalStatus(newStatus);
    addToast(`Client status set to ${newStatus.toUpperCase()}`, 'info', 'Status Changed');
  };

  const handleHoldClient = () => {
    const newStatus = localStatus === 'inactive' ? 'active' : 'inactive';
    investor.status = newStatus;
    setLocalStatus(newStatus);
    addToast(`Client status set to ${newStatus.toUpperCase()}`, 'info', 'Status Changed');
  };

  const handleDeleteClient = () => {
    if (window.confirm(`Are you sure you want to completely delete client profile "${investor.name}"?`)) {
      const idx = investors.findIndex(inv => inv.id === investor.id);
      if (idx !== -1) {
        investors.splice(idx, 1);
      }
      addToast('Client profile deleted successfully!', 'success', 'Client Deleted');
      navigate('/investors');
    }
  };

  return (
    <div className="kfpl-page">
      {/* Premium Gradient Header Card */}
      <div className="kfpl-detail-card-header">
        <div className="kfpl-detail-profile">
          <div className="kfpl-detail-avatar">
            {investor.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="kfpl-detail-name" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{investor.name}</h2>
            <div className="kfpl-detail-id" style={{ marginTop: '2px' }}>ID: {investor.clientId}</div>
            <div className="kfpl-detail-meta" style={{ marginTop: '8px' }}>
              <Badge status={investor.category}>{investor.category} Tier</Badge>
              <Badge status={localStatus}>{localStatus}</Badge>
              <Badge status={riskMap[localRiskProfile]}>{localRiskProfile} Risk</Badge>
            </div>
          </div>
        </div>
        <div className="kfpl-detail-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ color: 'var(--color-white)', borderColor: 'rgba(255, 255, 255, 0.25)', background: 'rgba(255, 255, 255, 0.05)' }} onClick={() => navigate('/investors')}>
            ← Back
          </button>
          <button type="button" className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ color: 'var(--color-white)', borderColor: 'rgba(255, 255, 255, 0.25)', background: localStatus === 'suspended' ? '#EF4444' : 'rgba(255, 255, 255, 0.05)' }} onClick={handleBlockClient}>
            {localStatus === 'suspended' ? 'Unblock Client' : 'Block Client'}
          </button>
          <button type="button" className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ color: 'var(--color-white)', borderColor: 'rgba(255, 255, 255, 0.25)', background: localStatus === 'inactive' ? '#F59E0B' : 'rgba(255, 255, 255, 0.05)' }} onClick={handleHoldClient}>
            {localStatus === 'inactive' ? 'Resume Client' : 'Hold Client'}
          </button>
          <button type="button" className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ color: '#EF4444', borderColor: '#EF4444', background: 'rgba(239, 68, 68, 0.05)' }} onClick={handleDeleteClient}>
            Delete Client
          </button>
          <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" style={{ background: '#10B981', color: 'var(--color-white)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }} onClick={() => navigate(`/investors/${id}/edit`)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      {/* KPI summaries dashboard */}
      <div className="kfpl-detail-kpis-summary">
        <div className="kfpl-detail-kpi-summary-card">
          <span className="kfpl-detail-kpi-summary-label">Total Investment</span>
          <span className="kfpl-detail-kpi-summary-value" style={{ color: '#10B981' }}>{formatCurrency(investor.totalInvestment)}</span>
        </div>
        <div className="kfpl-detail-kpi-summary-card">
          <span className="kfpl-detail-kpi-summary-label">Active Segments</span>
          <span className="kfpl-detail-kpi-summary-value">{investor.investments.filter(i => i.status === 'Active').length} Segments</span>
        </div>
        <div className="kfpl-detail-kpi-summary-card">
          <span className="kfpl-detail-kpi-summary-label">ROI Rate</span>
          <span className="kfpl-detail-kpi-summary-value" style={{ color: '#F59E0B' }}>{investor.roiPercentage}% p.a.</span>
        </div>
        <div className="kfpl-detail-kpi-summary-card">
          <span className="kfpl-detail-kpi-summary-label">KYC Verification</span>
          <span className="kfpl-detail-kpi-summary-value">
            <Badge status={investor.kyc === 'Verified' ? 'active' : 'pending'}>{investor.kyc}</Badge>
          </span>
        </div>
      </div>

      {/* Segmented Pill Tab Bar */}
      <div className="kfpl-tabs">
        {tabs.map(tab => (
          <div
            key={tab}
            className={`kfpl-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tabIcons[tab]}
            {tab.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="kfpl-detail-grid">
          <div className="kfpl-detail-info-card">
            <div className="kfpl-detail-info-title">Personal Information</div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.user}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Full Name</span>
                <span className="kfpl-detail-info-item-value">{investor.name}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.mail}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Email Address</span>
                <span className="kfpl-detail-info-item-value">{investor.email}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.phone}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Phone Number</span>
                <span className="kfpl-detail-info-item-value">{investor.phone}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.calendar}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Date of Birth</span>
                <span className="kfpl-detail-info-item-value">{investor.dob}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.mapPin}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Address</span>
                <span className="kfpl-detail-info-item-value">{investor.address}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.calendar}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Join Date</span>
                <span className="kfpl-detail-info-item-value">{investor.joinDate}</span>
              </div>
            </div>
          </div>

          <div className="kfpl-detail-info-card">
            <div className="kfpl-detail-info-title">KYC & Financial Information</div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.shield}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">KYC Status</span>
                <span className="kfpl-detail-info-item-value">
                  <Badge status={investor.kyc === 'Verified' ? 'active' : 'pending'}>{investor.kyc}</Badge>
                </span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="kfpl-detail-info-item-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div>
                  <span className="kfpl-detail-info-item-label">Risk Profile</span>
                  <span className="kfpl-detail-info-item-value">{localRiskProfile}</span>
                </div>
                <select
                  value={localRiskProfile}
                  onChange={handleRiskProfileChange}
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <option value="Conservative">Conservative</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Aggressive">Aggressive</option>
                </select>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.fileText}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">PAN Card Number</span>
                <span className="kfpl-detail-info-item-value">{investor.pan}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.landmark}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Bank Name</span>
                <span className="kfpl-detail-info-item-value">{investor.bankName}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.fileText}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Account No.</span>
                <span className="kfpl-detail-info-item-value">{investor.accountNo}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.shield}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">IFSC Code</span>
                <span className="kfpl-detail-info-item-value">{investor.ifsc}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>{infoIcons.wallet}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Total Portfolio Value</span>
                <span className="kfpl-detail-info-item-value" style={{ color: '#10B981', fontWeight: 800 }}>{formatCurrency(investor.totalInvestment)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'investments' && (
        <div className="kfpl-table-container">
          <div className="kfpl-table-toolbar">
            <h3 className="kfpl-form-card-title" style={{ margin: 0 }}>Active Segment Distribution</h3>
          </div>
          <div className="kfpl-table-scroll">
            <table className="kfpl-table">
              <thead>
                <tr>
                  <th>Segment</th>
                  <th>Amount</th>
                  <th>ROI Rate</th>
                  <th>Risk Level</th>
                  <th>Allocation Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {investor.investments.map(inv => (
                  <tr key={inv.id}>
                    <td className="kfpl-table-cell-primary">{inv.segment}</td>
                    <td className="font-semibold" style={{ color: '#10B981' }}>{formatCurrency(inv.amount)}</td>
                    <td>{inv.roi}%</td>
                    <td>
                      <Badge status={inv.risk === 'High' ? 'rejected' : inv.risk === 'Medium' ? 'pending' : 'active'}>
                        {inv.risk}
                      </Badge>
                    </td>
                    <td>{inv.date}</td>
                    <td><Badge status={inv.status}>{inv.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'roi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ROI Stats row */}
          <div className="kfpl-grid-2col" style={{ gap: '20px' }}>
            <div className="kfpl-detail-kpi-summary-card" style={{ borderLeft: '4px solid #10B981' }}>
              <span className="kfpl-detail-kpi-summary-label">Total ROI Paid</span>
              <span className="kfpl-detail-kpi-summary-value" style={{ color: '#10B981' }}>{formatCurrency(totalPaidROI)}</span>
            </div>
            <div className="kfpl-detail-kpi-summary-card" style={{ borderLeft: '4px solid #F59E0B' }}>
              <span className="kfpl-detail-kpi-summary-label">Total ROI Pending</span>
              <span className="kfpl-detail-kpi-summary-value" style={{ color: '#F59E0B' }}>{formatCurrency(totalPendingROI)}</span>
            </div>
          </div>

          <div className="kfpl-table-container">
            <div className="kfpl-table-scroll">
              <table className="kfpl-table">
                <thead>
                  <tr>
                    <th>Payout Month</th>
                    <th>Payout Amount</th>
                    <th>Payout Status</th>
                    <th>Processed Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {investor.roiHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                        No ROI payout records found for this client.
                      </td>
                    </tr>
                  ) : (
                    investor.roiHistory.map(roi => (
                      <tr key={roi.id}>
                        <td className="kfpl-table-cell-primary">{roi.month}</td>
                        <td className="font-semibold">{formatCurrency(roi.amount)}</td>
                        <td><Badge status={roi.status}>{roi.status}</Badge></td>
                        <td>{roi.paidAt || '—'}</td>
                        <td>
                          {roi.status === 'pending' && (
                            <button
                              className="kfpl-btn kfpl-btn--success kfpl-btn--sm"
                              style={{ background: '#10B981', borderColor: 'transparent', color: 'var(--color-white)' }}
                              onClick={() => addToast(`ROI payout of ${formatCurrency(roi.amount)} for ${roi.month} marked as paid`, 'success', 'ROI Paid')}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14" style={{ marginRight: '4px' }}>
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'perks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="kfpl-page-header" style={{ marginBottom: '4px' }}>
            <div>
              <h3 className="kfpl-form-card-title" style={{ margin: 0 }}>Assigned Loyalty Perks</h3>
              <p className="kfpl-page-subtitle" style={{ margin: '2px 0 0 0' }}>Client benefits based on their {investor.category} recognition tier</p>
            </div>
          </div>

          {investor.perks.length === 0 ? (
            <div className="kfpl-detail-info-card">
              <div className="kfpl-empty" style={{ padding: '40px' }}>
                <div className="kfpl-empty-title">No perks assigned</div>
                <div className="kfpl-empty-text">Upgrade client recognition tier or assign custom perks.</div>
              </div>
            </div>
          ) : (
            <div className="kfpl-perks-grid">
              {investor.perks.map((perkName, i) => {
                const details = perkDetails[perkName] || { desc: 'Assigned platform benefit and VIP privileges.', icon: '⭐' };
                return (
                  <div key={i} className="kfpl-perk-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="kfpl-perk-tier-stripe" style={{ background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)' }} />
                    <div className="kfpl-perk-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 0' }}>
                      <div className="kfpl-perk-icon-wrap" style={{ background: 'var(--color-gold-light)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                        <span style={{ fontSize: '1.25rem' }}>{details.icon}</span>
                      </div>
                      <Badge status={investor.category}>{investor.category}</Badge>
                    </div>
                    <div className="kfpl-perk-card-body" style={{ flex: 1, padding: '16px 20px' }}>
                      <h4 className="kfpl-perk-card-title" style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 700 }}>{perkName}</h4>
                      <p className="kfpl-perk-card-desc" style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                        {details.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============ END: InvestorDetail.jsx ============ */
