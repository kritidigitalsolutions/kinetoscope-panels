/* ============================================================
   Page: CommissionConfig.jsx
   Description: Configuration dashboard for commission slabs and overrides
   ============================================================ */

import { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import { apiRequest } from '../../config/apiHelper';

// Default mock values if not already in localStorage
const DEFAULT_ONETIME_SLABS = [
  { id: 'ot-1', minAmount: 0, maxAmount: 1000000, percentage: 1.0 },
  { id: 'ot-2', minAmount: 1000000, maxAmount: 5000000, percentage: 1.5 },
  { id: 'ot-3', minAmount: 5000000, maxAmount: 999999999, percentage: 2.0 }
];

const DEFAULT_MONTHLY_SLABS = [
  { id: 'm-1', minAmount: 0, maxAmount: 1000000, percentage: 0.5 },
  { id: 'm-2', minAmount: 1000000, maxAmount: 5000000, percentage: 0.75 },
  { id: 'm-3', minAmount: 5000000, maxAmount: 999999999, percentage: 1.0 }
];

const DEFAULT_OVERRIDES = [
  { id: 'or-1', agentId: 'AGT-001', agentName: 'Vikram Patel', percentage: 0.5, reason: 'High-value clients portfolio onboarding' },
  { id: 'or-2', agentId: 'AGT-002', agentName: 'Neha Gupta', percentage: 0.5, reason: 'Promotional agent tier' }
];

export default function CommissionConfig() {
  const addToast = useToast();
  
  // Tabs: 'one-time' | 'monthly' | 'overrides'
  const [activeTab, setActiveTab] = useState('one-time');

  // State
  const [oneTimeSlabs, setOneTimeSlabs] = useState([]);
  const [monthlySlabs, setMonthlySlabs] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [calcAmount, setCalcAmount] = useState('');
  const [agentsList, setAgentsList] = useState([]);

  // Modal State
  const [showSlabModal, setShowSlabModal] = useState(false);
  const [slabModalType, setSlabModalType] = useState('add'); // 'add' | 'edit'
  const [slabForm, setSlabForm] = useState({ id: '', minAmount: '', maxAmount: '', percentage: '' });

  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideModalType, setOverrideModalType] = useState('add'); // 'add' | 'edit'
  const [overrideForm, setOverrideForm] = useState({ id: '', agentId: '', percentage: '', reason: '' });

  // Load from localStorage on mount
  useEffect(() => {
    const ot = localStorage.getItem('kfpl_commission_onetime');
    const m = localStorage.getItem('kfpl_commission_monthly');
    const ov = localStorage.getItem('kfpl_commission_overrides');

    if (ot) setOneTimeSlabs(JSON.parse(ot));
    else {
      setOneTimeSlabs(DEFAULT_ONETIME_SLABS);
      localStorage.setItem('kfpl_commission_onetime', JSON.stringify(DEFAULT_ONETIME_SLABS));
    }

    if (m) setMonthlySlabs(JSON.parse(m));
    else {
      setMonthlySlabs(DEFAULT_MONTHLY_SLABS);
      localStorage.setItem('kfpl_commission_monthly', JSON.stringify(DEFAULT_MONTHLY_SLABS));
    }

    if (ov) setOverrides(JSON.parse(ov));
    else {
      setOverrides(DEFAULT_OVERRIDES);
      localStorage.setItem('kfpl_commission_overrides', JSON.stringify(DEFAULT_OVERRIDES));
    }

    const fetchAgents = async () => {
      try {
        const res = await apiRequest('/api/super-admin/agents');
        const list = Array.isArray(res) ? res : (res.agents || []);
        setAgentsList(list);
      } catch (err) {
        console.error('Failed to load agents in config:', err);
      }
    };
    fetchAgents();
  }, []);

  // Sync to localStorage helpers
  const saveOneTimeSlabs = (data) => {
    setOneTimeSlabs(data);
    localStorage.setItem('kfpl_commission_onetime', JSON.stringify(data));
  };

  const saveMonthlySlabs = (data) => {
    setMonthlySlabs(data);
    localStorage.setItem('kfpl_commission_monthly', JSON.stringify(data));
  };

  const saveOverrides = (data) => {
    setOverrides(data);
    localStorage.setItem('kfpl_commission_overrides', JSON.stringify(data));
  };

  // Helper to check overlap
  const hasOverlap = (slabs, min, max, excludeId) => {
    return slabs.some(slab => {
      if (slab.id === excludeId) return false;
      // Overlap logic: min1 <= max2 AND min2 <= max1
      return min <= slab.maxAmount && slab.minAmount <= max;
    });
  };

  // Slab handlers
  const handleOpenAddSlab = () => {
    setSlabModalType('add');
    setSlabForm({ id: '', minAmount: '', maxAmount: '', percentage: '' });
    setShowSlabModal(true);
  };

  const handleOpenEditSlab = (slab) => {
    setSlabModalType('edit');
    setSlabForm({
      id: slab.id,
      minAmount: slab.minAmount,
      maxAmount: slab.maxAmount === 999999999 ? '' : slab.maxAmount,
      percentage: slab.percentage
    });
    setShowSlabModal(true);
  };

  const handleDeleteSlab = (id, slabsList, setListFn) => {
    if (window.confirm('Are you sure you want to delete this slab?')) {
      const updated = slabsList.filter(s => s.id !== id);
      setListFn(updated);
      addToast('Slab deleted successfully', 'success', 'Slab Removed');
    }
  };

  const handleSaveSlab = () => {
    const min = parseFloat(slabForm.minAmount);
    let max = parseFloat(slabForm.maxAmount);
    const pct = parseFloat(slabForm.percentage);

    if (isNaN(min) || min < 0) {
      alert('Please enter a valid Minimum Amount.');
      return;
    }
    if (slabForm.maxAmount === '' || isNaN(max)) {
      max = 999999999; // Represents No Limit / Unlimited
    }
    if (max <= min) {
      alert('Maximum Amount must be greater than Minimum Amount.');
      return;
    }
    if (isNaN(pct) || pct < 0 || pct > 100) {
      alert('Percentage must be between 0% and 100%.');
      return;
    }

    const currentSlabs = activeTab === 'one-time' ? oneTimeSlabs : monthlySlabs;
    const saveFn = activeTab === 'one-time' ? saveOneTimeSlabs : saveMonthlySlabs;

    // Check overlap
    if (hasOverlap(currentSlabs, min, max, slabForm.id)) {
      alert('This range overlaps with an existing slab. Please check your slab ranges.');
      return;
    }

    let updated;
    if (slabModalType === 'add') {
      const newSlab = {
        id: 'slab-' + Date.now(),
        minAmount: min,
        maxAmount: max,
        percentage: pct
      };
      updated = [...currentSlabs, newSlab].sort((a, b) => a.minAmount - b.minAmount);
      addToast('New slab added successfully', 'success', 'Slab Created');
    } else {
      updated = currentSlabs.map(s => {
        if (s.id === slabForm.id) {
          return { ...s, minAmount: min, maxAmount: max, percentage: pct };
        }
        return s;
      }).sort((a, b) => a.minAmount - b.minAmount);
      addToast('Slab updated successfully', 'success', 'Slab Updated');
    }

    saveFn(updated);
    setShowSlabModal(false);
  };

  // Override handlers
  const handleOpenAddOverride = () => {
    setOverrideModalType('add');
    setOverrideForm({ id: '', agentId: '', percentage: '', reason: '' });
    setShowOverrideModal(true);
  };

  const handleOpenEditOverride = (ov) => {
    setOverrideModalType('edit');
    setOverrideForm({
      id: ov.id,
      agentId: ov.agentId,
      percentage: ov.percentage,
      reason: ov.reason
    });
    setShowOverrideModal(true);
  };

  const handleDeleteOverride = (id) => {
    if (window.confirm('Are you sure you want to delete this special override?')) {
      const updated = overrides.filter(o => o.id !== id);
      saveOverrides(updated);
      addToast('Special override removed successfully', 'success', 'Override Deleted');
    }
  };

  const handleSaveOverride = () => {
    const pct = parseFloat(overrideForm.percentage);
    if (!overrideForm.agentId) {
      alert('Please select an agent.');
      return;
    }
    if (isNaN(pct) || pct < 0 || pct > 100) {
      alert('Please enter a valid percentage (0-100).');
      return;
    }
    if (!overrideForm.reason.trim()) {
      alert('Reason is mandatory for special overrides.');
      return;
    }

    const matchedAgent = agentsList.find(a => a.agentId === overrideForm.agentId || a.id === parseInt(overrideForm.agentId) || a._id === overrideForm.agentId);
    const agentName = matchedAgent ? (matchedAgent.name || matchedAgent.fullName) : overrideForm.agentId;

    let updated;
    if (overrideModalType === 'add') {
      // Prevent duplicate override for the same agent
      if (overrides.some(o => o.agentId === overrideForm.agentId)) {
        alert('Override already exists for this agent. Please edit the existing override.');
        return;
      }
      const newOv = {
        id: 'ov-' + Date.now(),
        agentId: overrideForm.agentId,
        agentName,
        percentage: pct,
        reason: overrideForm.reason
      };
      updated = [...overrides, newOv];
      addToast('Special override added successfully', 'success', 'Override Created');
    } else {
      updated = overrides.map(o => {
        if (o.id === overrideForm.id) {
          return { ...o, agentId: overrideForm.agentId, agentName, percentage: pct, reason: overrideForm.reason };
        }
        return o;
      });
      addToast('Special override updated successfully', 'success', 'Override Updated');
    }

    saveOverrides(updated);
    setShowOverrideModal(false);
  };

  const formatCurrencyLocal = (val) => {
    if (val === 999999999) return 'Unlimited / No Limit';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getCalculatedCommission = (slabs, amountStr) => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount < 0) return null;
    
    const matched = slabs.find(slab => {
      if (slab.maxAmount === 999999999) {
        return amount >= slab.minAmount;
      }
      return amount >= slab.minAmount && amount < slab.maxAmount;
    });
    
    if (!matched) return null;
    
    const commission = (amount * matched.percentage) / 100;
    return {
      slab: matched,
      amount: commission
    };
  };

  const renderCalculator = () => {
    const slabs = activeTab === 'one-time' ? oneTimeSlabs : monthlySlabs;
    const calcResult = getCalculatedCommission(slabs, calcAmount);
    
    return (
      <div style={{
        marginTop: '24px',
        paddingTop: '20px',
        borderTop: '1px dashed var(--color-border)',
      }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--color-navy)',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18" style={{ color: 'var(--color-gold-dark)' }}>
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/><line x1="12" y1="9" x2="12" y2="17"/>
          </svg>
          Commission Amount Calculator
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          alignItems: 'start'
        }}>
          <div className="kfpl-input-group" style={{ marginBottom: 0 }}>
            <label className="kfpl-input-label">Enter Investment Amount (₹)</label>
            <input
              type="number"
              className="kfpl-input"
              value={calcAmount}
              onChange={(e) => setCalcAmount(e.target.value)}
              placeholder="e.g. 15,00,000"
              style={{ width: '100%' }}
            />
          </div>
          
          {calcResult ? (
            <div style={{
              background: 'rgba(201, 168, 76, 0.05)',
              border: '1px solid rgba(201, 168, 76, 0.2)',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Matched Slab ({formatCurrencyLocal(calcResult.slab.minAmount)} - {formatCurrencyLocal(calcResult.slab.maxAmount)})
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  Commission Rate: <strong style={{ color: 'var(--color-success)' }}>{calcResult.slab.percentage}%</strong>
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)' }}>
                  {formatCurrencyLocal(calcResult.amount)}
                </span>
              </div>
            </div>
          ) : calcAmount ? (
            <div style={{
              background: 'var(--color-surface-hover)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: 'var(--color-text-muted)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              height: '100%'
            }}>
              No matching slab found for this amount.
            </div>
          ) : (
            <div style={{
              background: 'var(--color-surface-hover)',
              border: '1px dashed var(--color-border)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: 'var(--color-text-muted)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              height: '100%'
            }}>
              Enter an investment amount above to auto-calculate commission.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="kfpl-page animate-fade-slide-up">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Commission Slab Configuration</h2>
          <p className="kfpl-page-subtitle">Configure investment-linked commission slabs and manual agent overrides</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--color-border)', marginBottom: '24px', paddingBottom: '2px' }}>
        <button
          className={`kfpl-btn ${activeTab === 'one-time' ? 'kfpl-btn--primary' : 'kfpl-btn--ghost'}`}
          onClick={() => setActiveTab('one-time')}
          style={{ borderRadius: '8px 8px 0 0', padding: '10px 20px', borderBottom: activeTab === 'one-time' ? 'none' : '' }}
        >
          One-Time slabs
        </button>
        <button
          className={`kfpl-btn ${activeTab === 'monthly' ? 'kfpl-btn--primary' : 'kfpl-btn--ghost'}`}
          onClick={() => setActiveTab('monthly')}
          style={{ borderRadius: '8px 8px 0 0', padding: '10px 20px', borderBottom: activeTab === 'monthly' ? 'none' : '' }}
        >
          Monthly slabs
        </button>
        <button
          className={`kfpl-btn ${activeTab === 'overrides' ? 'kfpl-btn--primary' : 'kfpl-btn--ghost'}`}
          onClick={() => setActiveTab('overrides')}
          style={{ borderRadius: '8px 8px 0 0', padding: '10px 20px', borderBottom: activeTab === 'overrides' ? 'none' : '' }}
        >
          Special Overrides
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'one-time' && (
        <div className="kfpl-card animate-fade-slide-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-navy)' }}>One-Time Commission Slab Mapping</h3>
            <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" onClick={handleOpenAddSlab}>
              + Add One-Time Slab
            </button>
          </div>

          <div className="kfpl-table-scroll">
            <table className="kfpl-table">
              <thead>
                <tr>
                  <th>Min Amount</th>
                  <th>Max Amount</th>
                  <th style={{ textAlign: 'right' }}>Commission Rate (%)</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {oneTimeSlabs.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '30px' }}>No One-Time slabs configured.</td>
                  </tr>
                ) : (
                  oneTimeSlabs.map(slab => (
                    <tr key={slab.id}>
                      <td>{formatCurrencyLocal(slab.minAmount)}</td>
                      <td>{formatCurrencyLocal(slab.maxAmount)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>{slab.percentage}%</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ padding: '4px 8px' }} onClick={() => handleOpenEditSlab(slab)}>
                            Edit
                          </button>
                          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ padding: '4px 8px', color: 'var(--color-danger)' }} onClick={() => handleDeleteSlab(slab.id, oneTimeSlabs, saveOneTimeSlabs)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {renderCalculator()}
        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="kfpl-card animate-fade-slide-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-navy)' }}>Monthly Recurring Commission Slab Mapping</h3>
            <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" onClick={handleOpenAddSlab}>
              + Add Monthly Slab
            </button>
          </div>

          <div className="kfpl-table-scroll">
            <table className="kfpl-table">
              <thead>
                <tr>
                  <th>Min Amount</th>
                  <th>Max Amount</th>
                  <th style={{ textAlign: 'right' }}>Commission Rate (%)</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {monthlySlabs.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '30px' }}>No Monthly slabs configured.</td>
                  </tr>
                ) : (
                  monthlySlabs.map(slab => (
                    <tr key={slab.id}>
                      <td>{formatCurrencyLocal(slab.minAmount)}</td>
                      <td>{formatCurrencyLocal(slab.maxAmount)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>{slab.percentage}%</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ padding: '4px 8px' }} onClick={() => handleOpenEditSlab(slab)}>
                            Edit
                          </button>
                          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ padding: '4px 8px', color: 'var(--color-danger)' }} onClick={() => handleDeleteSlab(slab.id, monthlySlabs, saveMonthlySlabs)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {renderCalculator()}
        </div>
      )}

      {activeTab === 'overrides' && (
        <div className="kfpl-card animate-fade-slide-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-navy)' }}>Special Manual Commission Overrides</h3>
            <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" onClick={handleOpenAddOverride}>
              + Add Special Override
            </button>
          </div>

          <div className="kfpl-table-scroll">
            <table className="kfpl-table">
              <thead>
                <tr>
                  <th>Agent ID</th>
                  <th>Agent Name</th>
                  <th style={{ textAlign: 'right' }}>Override Rate (%)</th>
                  <th>Reason / Remarks</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {overrides.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '30px' }}>No special overrides configured.</td>
                  </tr>
                ) : (
                  overrides.map(ov => (
                    <tr key={ov.id}>
                      <td>{ov.agentId}</td>
                      <td style={{ fontWeight: 600 }}>{ov.agentName}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-gold-dark)' }}>+{ov.percentage}%</td>
                      <td style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{ov.reason}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ padding: '4px 8px' }} onClick={() => handleOpenEditOverride(ov)}>
                            Edit
                          </button>
                          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ padding: '4px 8px', color: 'var(--color-danger)' }} onClick={() => handleDeleteOverride(ov.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slab Form Modal */}
      <Modal
        isOpen={showSlabModal}
        onClose={() => setShowSlabModal(false)}
        title={slabModalType === 'add' ? `Add ${activeTab === 'one-time' ? 'One-Time' : 'Monthly'} Slab` : `Edit Slab`}
        footer={
          <>
            <button className="kfpl-btn kfpl-btn--ghost" onClick={() => setShowSlabModal(false)}>Cancel</button>
            <button className="kfpl-btn kfpl-btn--primary" onClick={handleSaveSlab}>Save Slab</button>
          </>
        }
      >
        <div className="kfpl-form" style={{ gap: '16px' }}>
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Minimum Investment (₹) <span className="required">*</span></label>
            <input
              type="number"
              className="kfpl-input"
              value={slabForm.minAmount}
              onChange={(e) => setSlabForm(prev => ({ ...prev, minAmount: e.target.value }))}
              placeholder="e.g. 0"
            />
          </div>
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Maximum Investment (₹) <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>(Leave empty for Unlimited)</span></label>
            <input
              type="number"
              className="kfpl-input"
              value={slabForm.maxAmount}
              onChange={(e) => setSlabForm(prev => ({ ...prev, maxAmount: e.target.value }))}
              placeholder="e.g. 1000000"
            />
          </div>
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Commission Percentage (%) <span className="required">*</span></label>
            <input
              type="number"
              step="0.01"
              className="kfpl-input"
              value={slabForm.percentage}
              onChange={(e) => setSlabForm(prev => ({ ...prev, percentage: e.target.value }))}
              placeholder="e.g. 1.25"
            />
          </div>
        </div>
      </Modal>

      {/* Override Form Modal */}
      <Modal
        isOpen={showOverrideModal}
        onClose={() => setShowOverrideModal(false)}
        title={overrideModalType === 'add' ? 'Add Special Agent Override' : 'Edit Special Override'}
        footer={
          <>
            <button className="kfpl-btn kfpl-btn--ghost" onClick={() => setShowOverrideModal(false)}>Cancel</button>
            <button className="kfpl-btn kfpl-btn--primary" onClick={handleSaveOverride}>Save Override</button>
          </>
        }
      >
        <div className="kfpl-form" style={{ gap: '16px' }}>
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Select Agent <span className="required">*</span></label>
            <select
              className="kfpl-select"
              value={overrideForm.agentId}
              onChange={(e) => setOverrideForm(prev => ({ ...prev, agentId: e.target.value }))}
              disabled={overrideModalType === 'edit'}
            >
              <option value="">Choose Agent</option>
              {agentsList.map(a => (
                <option key={a.id || a._id} value={a.agentId}>{a.name || a.fullName} ({a.agentId})</option>
              ))}
            </select>
          </div>
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Special Commission Override (%) <span className="required">*</span></label>
            <input
              type="number"
              step="0.01"
              className="kfpl-input"
              value={overrideForm.percentage}
              onChange={(e) => setOverrideForm(prev => ({ ...prev, percentage: e.target.value }))}
              placeholder="e.g. 0.5"
            />
          </div>
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Mandatory Reason / Notes <span className="required">*</span></label>
            <textarea
              className="kfpl-textarea"
              value={overrideForm.reason}
              onChange={(e) => setOverrideForm(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Provide a justification for this manual override..."
              rows="3"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ============ END: CommissionConfig.jsx ============ */
