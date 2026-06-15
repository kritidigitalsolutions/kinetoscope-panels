/* ============================================================
   Page: PerkManagement.jsx
   Description: Perk definitions CRUD and assign to investor
   ============================================================ */

import { useState } from 'react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { perks, investors, formatCurrency } from '../../data/mockData';
import { useToast } from '../../components/ui/Toast';

// ── Tier Config ───────────────────────
const tierConfig = {
  silver: { gradient: 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 100%)', icon: '🥈', bg: 'rgba(192, 192, 192, 0.08)' },
  gold: { gradient: 'linear-gradient(135deg, #F5E6C0 0%, #C9A84C 100%)', icon: '🥇', bg: 'rgba(201, 168, 76, 0.08)' },
  platinum: { gradient: 'linear-gradient(135deg, #E5E8EB 0%, #8FA3B8 100%)', icon: '💎', bg: 'rgba(143, 163, 184, 0.06)' },
  diamond: { gradient: 'linear-gradient(135deg, #E0F7FA 0%, #4DD0E1 100%)', icon: '👑', bg: 'rgba(77, 208, 225, 0.06)' },
};

// ── Perk Icons by name ───────────────────────
const perkIcons = {
  'Priority Support': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  'Annual Gala Invite': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  'Quarterly Review': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  'Film Set Visit': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg>,
  'Premiere Tickets': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="2" y1="12" x2="22" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  'Tax Advisory': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
};

const defaultIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>;

export default function PerkManagement() {
  const addToast = useToast();
  const [showAssign, setShowAssign] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [assignForm, setAssignForm] = useState({ investorId: '', perkId: '' });
  const [newPerk, setNewPerk] = useState({ name: '', description: '', tier: '', minInvestment: '' });

  const handleAssign = () => {
    addToast('Perk assigned successfully!', 'success', 'Perk Assigned');
    setShowAssign(false);
    setAssignForm({ investorId: '', perkId: '' });
  };

  const handleAddPerk = () => {
    addToast('Perk created successfully!', 'success', 'Perk Created');
    setShowAdd(false);
    setNewPerk({ name: '', description: '', tier: '', minInvestment: '' });
  };

  const activePerks = perks.filter(p => p.status === 'active').length;
  const inactivePerks = perks.filter(p => p.status !== 'active').length;

  return (
    <div className="kfpl-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Perks & Recognition</h2>
          <p className="kfpl-page-subtitle">Manage perk definitions and assign to clients</p>
        </div>
        <div className="kfpl-page-header-actions">
          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => setShowAssign(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Assign Perk
          </button>
          <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" onClick={() => setShowAdd(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Perk
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="kfpl-perks-stats">
        <div className="kfpl-perks-stat">
          <span className="kfpl-perks-stat-num">{perks.length}</span>
          <span className="kfpl-perks-stat-label">Total Perks</span>
        </div>
        <div className="kfpl-perks-stat">
          <span className="kfpl-perks-stat-num" style={{ color: 'var(--color-success)' }}>{activePerks}</span>
          <span className="kfpl-perks-stat-label">Active</span>
        </div>
        <div className="kfpl-perks-stat">
          <span className="kfpl-perks-stat-num" style={{ color: 'var(--color-text-muted)' }}>{inactivePerks}</span>
          <span className="kfpl-perks-stat-label">Inactive</span>
        </div>
        <div className="kfpl-perks-stat">
          <span className="kfpl-perks-stat-num" style={{ color: 'var(--color-gold-dark)' }}>4</span>
          <span className="kfpl-perks-stat-label">Tiers</span>
        </div>
      </div>

      {/* Perks Grid — Premium Cards */}
      <div className="kfpl-perks-grid">
        {perks.map(perk => {
          const tier = tierConfig[perk.tier] || tierConfig.silver;
          return (
            <div className="kfpl-perk-card" key={perk.id} style={{ '--tier-bg': tier.bg }}>
              {/* Tier stripe */}
              <div className="kfpl-perk-tier-stripe" style={{ background: tier.gradient }} />

              {/* Header */}
              <div className="kfpl-perk-card-header">
                <div className="kfpl-perk-icon-wrap" style={{ background: tier.bg }}>
                  {perkIcons[perk.name] || defaultIcon}
                </div>
                <div className="kfpl-perk-card-badges">
                  <Badge status={perk.status}>{perk.status}</Badge>
                </div>
              </div>

              {/* Body */}
              <div className="kfpl-perk-card-body">
                <h4 className="kfpl-perk-card-title">{perk.name}</h4>
                <p className="kfpl-perk-card-desc">{perk.description}</p>
              </div>

              {/* Footer */}
              <div className="kfpl-perk-card-footer">
                <div className="kfpl-perk-tier-badge">
                  <span className="kfpl-perk-tier-icon">{tier.icon}</span>
                  <Badge status={perk.tier}>{perk.tier} tier</Badge>
                </div>
                <div className="kfpl-perk-min">
                  <span className="kfpl-perk-min-label">Min Investment</span>
                  <span className="kfpl-perk-min-value">{formatCurrency(perk.minInvestment)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Perk Modal */}
      <Modal
        isOpen={showAssign}
        onClose={() => setShowAssign(false)}
        title="Assign Perk to Client"
        footer={
          <>
            <button className="kfpl-btn kfpl-btn--ghost" onClick={() => setShowAssign(false)}>Cancel</button>
            <button className="kfpl-btn kfpl-btn--primary" onClick={handleAssign} disabled={!assignForm.investorId || !assignForm.perkId}>Assign</button>
          </>
        }
      >
        <div className="kfpl-form" style={{ gap: '16px' }}>
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Select Client</label>
            <select className="kfpl-select" value={assignForm.investorId} onChange={(e) => setAssignForm(prev => ({ ...prev, investorId: e.target.value }))}>
              <option value="">Choose client</option>
              {investors.filter(i => i.status === 'active').map(inv => (
                <option key={inv.id} value={inv.id}>{inv.name} ({inv.clientId})</option>
              ))}
            </select>
          </div>
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Select Perk</label>
            <select className="kfpl-select" value={assignForm.perkId} onChange={(e) => setAssignForm(prev => ({ ...prev, perkId: e.target.value }))}>
              <option value="">Choose perk</option>
              {perks.filter(p => p.status === 'active').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.tier})</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Add Perk Modal */}
      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add New Perk"
        footer={
          <>
            <button className="kfpl-btn kfpl-btn--ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="kfpl-btn kfpl-btn--primary" onClick={handleAddPerk} disabled={!newPerk.name}>Create Perk</button>
          </>
        }
      >
        <div className="kfpl-form" style={{ gap: '16px' }}>
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Perk Name <span className="required">*</span></label>
            <input className="kfpl-input" value={newPerk.name} onChange={(e) => setNewPerk(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. VIP Lounge Access" />
          </div>
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Description</label>
            <textarea className="kfpl-textarea" value={newPerk.description} onChange={(e) => setNewPerk(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe the perk..." rows="2" />
          </div>
          <div className="kfpl-form-row">
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Tier</label>
              <select className="kfpl-select" value={newPerk.tier} onChange={(e) => setNewPerk(prev => ({ ...prev, tier: e.target.value }))}>
                <option value="">Select tier</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
                <option value="diamond">Diamond</option>
              </select>
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Min Investment (₹)</label>
              <input className="kfpl-input" type="number" value={newPerk.minInvestment} onChange={(e) => setNewPerk(prev => ({ ...prev, minInvestment: e.target.value }))} placeholder="500000" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ============ END: PerkManagement.jsx ============ */
