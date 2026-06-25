/* ============================================================
   Page: PerkManagement.jsx
   Description: Perk definitions CRUD and assign to investor
   ============================================================ */

import { useState, useEffect, useMemo } from 'react';
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

// ── SVG Icons ───────────────────────
const icons = {
  star: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  library: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  assigned: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>,
  x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  revoke: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
};

const STORAGE_KEY = 'kfpl_assigned_perks';

export default function PerkManagement() {
  const addToast = useToast();
  const [activeTab, setActiveTab] = useState('library');
  const [showAssign, setShowAssign] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [assignForm, setAssignForm] = useState({ selectedClients: [], perkId: '' });
  const [clientSearch, setClientSearch] = useState('');
  const [newPerk, setNewPerk] = useState({ name: '', description: '', tier: '', minInvestment: '' });

  // Assigned perks state (localStorage backed)
  const [assignedPerks, setAssignedPerks] = useState([]);
  const [assignedSearch, setAssignedSearch] = useState('');
  const [assignedFilterPerk, setAssignedFilterPerk] = useState('');
  const [assignedFilterTier, setAssignedFilterTier] = useState('');

  // Load assigned perks from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (saved.length > 0) {
        setAssignedPerks(saved);
      } else {
        // Seed from investors mock data
        const seeded = [];
        investors.forEach(inv => {
          if (inv.perks && inv.perks.length > 0) {
            inv.perks.forEach(perkName => {
              const perkObj = perks.find(p => p.name === perkName);
              seeded.push({
                id: `ap-${inv.id}-${perkName.replace(/\s/g, '')}`,
                investorId: inv.id,
                investorName: inv.name,
                clientId: inv.clientId,
                perkId: perkObj?.id || 0,
                perkName: perkName,
                tier: perkObj?.tier || 'silver',
                assignedAt: inv.joinDate || '2024-01-15',
                status: 'active',
              });
            });
          }
        });
        setAssignedPerks(seeded);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      }
    } catch { setAssignedPerks([]); }
  }, []);

  // Save to localStorage whenever assignedPerks changes
  const saveAssigned = (list) => {
    setAssignedPerks(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  // ── Handle Assign Perk (multi-client) ──
  const handleAssign = () => {
    const perk = perks.find(p => p.id === Number(assignForm.perkId));
    if (!perk || assignForm.selectedClients.length === 0) return;

    const newEntries = [];
    assignForm.selectedClients.forEach(clientId => {
      const inv = investors.find(i => i.id === Number(clientId));
      if (!inv) return;
      // Skip if already assigned
      const alreadyAssigned = assignedPerks.some(
        ap => ap.investorId === inv.id && ap.perkId === perk.id && ap.status === 'active'
      );
      if (alreadyAssigned) return;

      newEntries.push({
        id: `ap-${inv.id}-${perk.id}-${Date.now()}`,
        investorId: inv.id,
        investorName: inv.name,
        clientId: inv.clientId,
        perkId: perk.id,
        perkName: perk.name,
        tier: perk.tier,
        assignedAt: new Date().toISOString().split('T')[0],
        status: 'active',
      });
    });

    if (newEntries.length === 0) {
      addToast('Selected clients already have this perk assigned.', 'warning', 'Already Assigned');
    } else {
      const updated = [...assignedPerks, ...newEntries];
      saveAssigned(updated);
      addToast(`Perk "${perk.name}" assigned to ${newEntries.length} client(s)!`, 'success', 'Perk Assigned');
    }

    setShowAssign(false);
    setAssignForm({ selectedClients: [], perkId: '' });
    setClientSearch('');
  };

  // ── Handle Revoke ──
  const handleRevoke = (assignmentId) => {
    const updated = assignedPerks.map(ap =>
      ap.id === assignmentId ? { ...ap, status: 'revoked' } : ap
    );
    saveAssigned(updated);
    addToast('Perk revoked successfully.', 'info', 'Perk Revoked');
  };

  const handleAddPerk = () => {
    addToast('Perk created successfully!', 'success', 'Perk Created');
    setShowAdd(false);
    setNewPerk({ name: '', description: '', tier: '', minInvestment: '' });
  };

  // ── Client toggle in assign modal ──
  const toggleClient = (clientId) => {
    setAssignForm(prev => ({
      ...prev,
      selectedClients: prev.selectedClients.includes(clientId)
        ? prev.selectedClients.filter(id => id !== clientId)
        : [...prev.selectedClients, clientId],
    }));
  };

  const selectAllFiltered = (filteredClients) => {
    const allIds = filteredClients.map(c => String(c.id));
    const allSelected = allIds.every(id => assignForm.selectedClients.includes(id));
    if (allSelected) {
      setAssignForm(prev => ({
        ...prev,
        selectedClients: prev.selectedClients.filter(id => !allIds.includes(id)),
      }));
    } else {
      setAssignForm(prev => ({
        ...prev,
        selectedClients: [...new Set([...prev.selectedClients, ...allIds])],
      }));
    }
  };

  // ── Filtered clients for assign modal ──
  const filteredClients = useMemo(() => {
    return investors.filter(i => {
      if (i.status !== 'active') return false;
      if (!clientSearch) return true;
      const q = clientSearch.toLowerCase();
      return i.name.toLowerCase().includes(q) || i.clientId.toLowerCase().includes(q);
    });
  }, [clientSearch]);

  // ── Filtered assigned perks for table ──
  const filteredAssigned = useMemo(() => {
    return assignedPerks.filter(ap => {
      if (assignedFilterPerk && ap.perkName !== assignedFilterPerk) return false;
      if (assignedFilterTier && ap.tier !== assignedFilterTier) return false;
      if (assignedSearch) {
        const q = assignedSearch.toLowerCase();
        if (!ap.investorName.toLowerCase().includes(q) && !ap.clientId.toLowerCase().includes(q) && !ap.perkName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [assignedPerks, assignedSearch, assignedFilterPerk, assignedFilterTier]);

  const activePerks = perks.filter(p => p.status === 'active').length;
  const inactivePerks = perks.filter(p => p.status !== 'active').length;
  const totalAssigned = assignedPerks.filter(ap => ap.status === 'active').length;

  return (
    <div className="kfpl-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Perks & Recognition</h2>
          <p className="kfpl-page-subtitle">Manage perk definitions and assign to clients</p>
        </div>
        <div className="kfpl-page-header-actions">
          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => setShowAssign(true)}>
            {icons.star}
            Assign Perk
          </button>
          <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" onClick={() => setShowAdd(true)}>
            {icons.plus}
            Add Perk
          </button>
        </div>
      </div>

      {/* ═══════ Tabs ═══════ */}
      <div className="kfpl-tabs">
        <button className={`kfpl-tab ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>
          {icons.library}
          Perks Library
        </button>
        <button className={`kfpl-tab ${activeTab === 'assigned' ? 'active' : ''}`} onClick={() => setActiveTab('assigned')}>
          {icons.assigned}
          Assigned Perks
          {totalAssigned > 0 && <span className="kfpl-perk-tab-count">{totalAssigned}</span>}
        </button>
      </div>

      {/* ═══════ Tab: Perks Library ═══════ */}
      {activeTab === 'library' && (
        <>
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
        </>
      )}

      {/* ═══════ Tab: Assigned Perks ═══════ */}
      {activeTab === 'assigned' && (
        <>
          {/* Assigned Perks Stats */}
          <div className="kfpl-perks-stats">
            <div className="kfpl-perks-stat">
              <span className="kfpl-perks-stat-num">{assignedPerks.length}</span>
              <span className="kfpl-perks-stat-label">Total Assignments</span>
            </div>
            <div className="kfpl-perks-stat">
              <span className="kfpl-perks-stat-num" style={{ color: 'var(--color-success)' }}>{totalAssigned}</span>
              <span className="kfpl-perks-stat-label">Active</span>
            </div>
            <div className="kfpl-perks-stat">
              <span className="kfpl-perks-stat-num" style={{ color: 'var(--color-danger, #ef4444)' }}>{assignedPerks.filter(a => a.status === 'revoked').length}</span>
              <span className="kfpl-perks-stat-label">Revoked</span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="kfpl-assigned-filters">
            <div className="kfpl-assigned-search-wrap">
              {icons.search}
              <input
                type="text"
                className="kfpl-assigned-search"
                placeholder="Search by client name, ID, or perk…"
                value={assignedSearch}
                onChange={e => setAssignedSearch(e.target.value)}
              />
            </div>
            <select className="kfpl-select kfpl-assigned-filter-select" value={assignedFilterPerk} onChange={e => setAssignedFilterPerk(e.target.value)}>
              <option value="">All Perks</option>
              {perks.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <select className="kfpl-select kfpl-assigned-filter-select" value={assignedFilterTier} onChange={e => setAssignedFilterTier(e.target.value)}>
              <option value="">All Tiers</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="diamond">Diamond</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>

          {/* Assigned Perks Table */}
          <div className="kfpl-table-container">
            <table className="kfpl-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Client</th>
                  <th>Client ID</th>
                  <th>Perk Name</th>
                  <th>Tier</th>
                  <th>Assigned Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssigned.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
                      No assigned perks found
                    </td>
                  </tr>
                ) : (
                  filteredAssigned.map((ap, idx) => {
                    const tier = tierConfig[ap.tier] || tierConfig.silver;
                    return (
                      <tr key={ap.id} className={ap.status === 'revoked' ? 'kfpl-row-revoked' : ''}>
                        <td>{idx + 1}</td>
                        <td>
                          <div className="kfpl-assigned-client-cell">
                            <div className="kfpl-assigned-client-avatar" style={{ background: tier.gradient }}>
                              {ap.investorName.charAt(0)}
                            </div>
                            <span className="kfpl-assigned-client-name">{ap.investorName}</span>
                          </div>
                        </td>
                        <td><span className="kfpl-client-id-tag">{ap.clientId}</span></td>
                        <td>
                          <div className="kfpl-assigned-perk-cell">
                            <span className="kfpl-assigned-perk-icon-mini" style={{ background: tier.bg }}>
                              {perkIcons[ap.perkName] || defaultIcon}
                            </span>
                            {ap.perkName}
                          </div>
                        </td>
                        <td><Badge status={ap.tier}>{ap.tier}</Badge></td>
                        <td>{new Date(ap.assignedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td><Badge status={ap.status === 'active' ? 'active' : 'inactive'}>{ap.status}</Badge></td>
                        <td>
                          {ap.status === 'active' ? (
                            <button className="kfpl-btn kfpl-btn--danger-ghost kfpl-btn--xs" onClick={() => handleRevoke(ap.id)} title="Revoke perk">
                              {icons.revoke}
                              Revoke
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ═══════ Assign Perk Modal (Multi-Client) ═══════ */}
      <Modal
        isOpen={showAssign}
        onClose={() => { setShowAssign(false); setAssignForm({ selectedClients: [], perkId: '' }); setClientSearch(''); }}
        title="Assign Perk to Clients"
        size="lg"
        footer={
          <>
            <button className="kfpl-btn kfpl-btn--ghost" onClick={() => { setShowAssign(false); setAssignForm({ selectedClients: [], perkId: '' }); setClientSearch(''); }}>Cancel</button>
            <button className="kfpl-btn kfpl-btn--primary" onClick={handleAssign} disabled={assignForm.selectedClients.length === 0 || !assignForm.perkId}>
              Assign to {assignForm.selectedClients.length} Client{assignForm.selectedClients.length !== 1 ? 's' : ''}
            </button>
          </>
        }
      >
        <div className="kfpl-form" style={{ gap: '20px' }}>
          {/* Perk Selector */}
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Select Perk <span className="required">*</span></label>
            <select className="kfpl-select" value={assignForm.perkId} onChange={(e) => setAssignForm(prev => ({ ...prev, perkId: e.target.value }))}>
              <option value="">Choose perk to assign</option>
              {perks.filter(p => p.status === 'active').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.tier} tier)</option>
              ))}
            </select>
          </div>

          {/* Multi-Client Selector */}
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">
              Select Clients <span className="required">*</span>
              {assignForm.selectedClients.length > 0 && (
                <span className="kfpl-assign-selected-count">{assignForm.selectedClients.length} selected</span>
              )}
            </label>

            {/* Search Bar */}
            <div className="kfpl-client-search-box">
              {icons.search}
              <input
                type="text"
                placeholder="Search clients by name or ID…"
                value={clientSearch}
                onChange={e => setClientSearch(e.target.value)}
                className="kfpl-client-search-input"
              />
            </div>

            {/* Select All / Deselect All */}
            <div className="kfpl-client-select-actions">
              <button type="button" className="kfpl-btn kfpl-btn--ghost kfpl-btn--xs" onClick={() => selectAllFiltered(filteredClients)}>
                {filteredClients.every(c => assignForm.selectedClients.includes(String(c.id))) ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Client List (scrollable) */}
            <div className="kfpl-client-checklist">
              {filteredClients.length === 0 ? (
                <div className="kfpl-client-checklist-empty">No active clients found</div>
              ) : (
                filteredClients.map(inv => {
                  const isSelected = assignForm.selectedClients.includes(String(inv.id));
                  const alreadyHas = assignForm.perkId && assignedPerks.some(
                    ap => ap.investorId === inv.id && ap.perkId === Number(assignForm.perkId) && ap.status === 'active'
                  );
                  return (
                    <div
                      key={inv.id}
                      className={`kfpl-client-check-item ${isSelected ? 'selected' : ''} ${alreadyHas ? 'already-assigned' : ''}`}
                      onClick={() => !alreadyHas && toggleClient(String(inv.id))}
                    >
                      <div className={`kfpl-client-checkbox ${isSelected ? 'checked' : ''}`}>
                        {isSelected && icons.check}
                      </div>
                      <div className="kfpl-client-check-avatar">
                        {inv.name.charAt(0)}
                      </div>
                      <div className="kfpl-client-check-info">
                        <span className="kfpl-client-check-name">{inv.name}</span>
                        <span className="kfpl-client-check-id">{inv.clientId}</span>
                      </div>
                      <div className="kfpl-client-check-meta">
                        <Badge status={inv.category}>{inv.category}</Badge>
                        {alreadyHas && <span className="kfpl-already-badge">Already Assigned</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* ═══════ Add Perk Modal ═══════ */}
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
                <option value="diamond">Diamond</option>
                <option value="platinum">Platinum</option>
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
