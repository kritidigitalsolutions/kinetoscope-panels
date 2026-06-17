/* ============================================================
   Page: RewardConfig.jsx
   Description: Configuration dashboard for Agent Reward Catalog
   ============================================================ */

import { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

const DEFAULT_REWARDS = [
  { id: 'rew-1', targetDescription: 'Recruit 10 Active Clients', targetType: 'Clients Count', targetValue: 10, rewardDescription: 'Free annual holiday package to Bali + Elite Partner Badge', isActive: true },
  { id: 'rew-2', targetDescription: 'Reach ₹50 Lakhs Business Volume', targetType: 'Investment Volume', targetValue: 5000000, rewardDescription: '₹1 Lakh cash bonus + Golden Trophy at annual meet', isActive: true },
  { id: 'rew-3', targetDescription: 'Reach ₹1 Crore Business Volume', targetType: 'Investment Volume', targetValue: 10000000, rewardDescription: '₹2.5 Lakhs cash bonus + Diamond Ring & VIP Board seat', isActive: true }
];

export default function RewardConfig() {
  const addToast = useToast();

  const [rewards, setRewards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [form, setForm] = useState({ id: '', targetDescription: '', targetType: 'Clients Count', targetValue: '', rewardDescription: '', isActive: true });

  // Load from localStorage on mount
  useEffect(() => {
    const data = localStorage.getItem('kfpl_reward_catalog');
    if (data) {
      setRewards(JSON.parse(data));
    } else {
      setRewards(DEFAULT_REWARDS);
      localStorage.setItem('kfpl_reward_catalog', JSON.stringify(DEFAULT_REWARDS));
    }
  }, []);

  const saveRewards = (updatedList) => {
    setRewards(updatedList);
    localStorage.setItem('kfpl_reward_catalog', JSON.stringify(updatedList));
  };

  const handleOpenAdd = () => {
    setModalType('add');
    setForm({ id: '', targetDescription: '', targetType: 'Clients Count', targetValue: '', rewardDescription: '', isActive: true });
    setShowModal(true);
  };

  const handleOpenEdit = (rew) => {
    setModalType('edit');
    setForm({ ...rew });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this reward definition?')) {
      const updated = rewards.filter(r => r.id !== id);
      saveRewards(updated);
      addToast('Reward definition deleted successfully', 'success', 'Reward Deleted');
    }
  };

  const handleToggleStatus = (id) => {
    const updated = rewards.map(r => {
      if (r.id === id) {
        const nextActive = !r.isActive;
        addToast(`Reward status toggled to ${nextActive ? 'Active' : 'Inactive'}`, 'info', 'Status Updated');
        return { ...r, isActive: nextActive };
      }
      return r;
    });
    saveRewards(updated);
  };

  const handleSave = () => {
    if (!form.targetDescription.trim()) {
      alert('Target Description is required.');
      return;
    }
    const val = parseFloat(form.targetValue);
    if (isNaN(val) || val <= 0) {
      alert('Target Value must be a valid positive number.');
      return;
    }
    if (!form.rewardDescription.trim()) {
      alert('Reward Description is required.');
      return;
    }

    let updated;
    if (modalType === 'add') {
      const newRew = {
        ...form,
        id: 'rew-' + Date.now(),
        targetValue: val
      };
      updated = [...rewards, newRew];
      addToast('New reward added successfully', 'success', 'Reward Created');
    } else {
      updated = rewards.map(r => {
        if (r.id === form.id) {
          return { ...form, targetValue: val };
        }
        return r;
      });
      addToast('Reward updated successfully', 'success', 'Reward Updated');
    }

    saveRewards(updated);
    setShowModal(false);
  };

  const formatTargetValue = (type, val) => {
    if (type === 'Clients Count') return `${val} Clients`;
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="kfpl-page animate-fade-slide-up">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Agent Reward Catalog</h2>
          <p className="kfpl-page-subtitle">Configure performance-linked milestones, rewards, and eligibility definitions for agents</p>
        </div>
        <div className="kfpl-page-header-actions">
          <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" onClick={handleOpenAdd}>
            + Define New Reward
          </button>
        </div>
      </div>

      <div className="kfpl-card animate-fade-slide-up">
        <div className="kfpl-table-scroll">
          <table className="kfpl-table">
            <thead>
              <tr>
                <th>Target Metric</th>
                <th>Target Threshold</th>
                <th>Target Description</th>
                <th>Reward Description</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rewards.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '30px' }}>No rewards configured.</td>
                </tr>
              ) : (
                rewards.map(rew => (
                  <tr key={rew.id}>
                    <td>
                      <Badge status={rew.targetType === 'Clients Count' ? 'gold' : 'platinum'}>
                        {rew.targetType}
                      </Badge>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatTargetValue(rew.targetType, rew.targetValue)}</td>
                    <td className="wrap" style={{ fontSize: '0.875rem' }}>{rew.targetDescription}</td>
                    <td className="wrap" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-success)' }}>{rew.rewardDescription}</td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(rew.id)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', outline: 'none' }}
                        title="Click to toggle status"
                      >
                        <Badge status={rew.isActive ? 'active' : 'inactive'}>
                          {rew.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ padding: '4px 8px' }} onClick={() => handleOpenEdit(rew)}>
                          Edit
                        </button>
                        <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ padding: '4px 8px', color: 'var(--color-danger)' }} onClick={() => handleDelete(rew.id)}>
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

      {/* Reward Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'add' ? 'Define New Performance Reward' : 'Edit Reward Definition'}
        footer={
          <>
            <button className="kfpl-btn kfpl-btn--ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="kfpl-btn kfpl-btn--primary" onClick={handleSave}>Save Reward</button>
          </>
        }
      >
        <div className="kfpl-form" style={{ gap: '16px' }}>
          <div className="kfpl-form-row">
            <div className="kfpl-input-group" style={{ flex: 1 }}>
              <label className="kfpl-input-label">Target Metric Type <span className="required">*</span></label>
              <select
                className="kfpl-select"
                value={form.targetType}
                onChange={(e) => setForm(prev => ({ ...prev, targetType: e.target.value }))}
              >
                <option value="Clients Count">Clients Count</option>
                <option value="Investment Volume">Investment Volume (₹)</option>
              </select>
            </div>
            <div className="kfpl-input-group" style={{ flex: 1 }}>
              <label className="kfpl-input-label">Target Threshold Value <span className="required">*</span></label>
              <input
                type="number"
                className="kfpl-input"
                value={form.targetValue}
                onChange={(e) => setForm(prev => ({ ...prev, targetValue: e.target.value }))}
                placeholder={form.targetType === 'Clients Count' ? 'e.g. 10' : 'e.g. 5000000'}
              />
            </div>
          </div>

          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Target Milestone Description <span className="required">*</span></label>
            <input
              type="text"
              className="kfpl-input"
              value={form.targetDescription}
              onChange={(e) => setForm(prev => ({ ...prev, targetDescription: e.target.value }))}
              placeholder="e.g. Onboard 10 clients with active investments"
            />
          </div>

          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Reward Description <span className="required">*</span></label>
            <textarea
              className="kfpl-textarea"
              value={form.rewardDescription}
              onChange={(e) => setForm(prev => ({ ...prev, rewardDescription: e.target.value }))}
              placeholder="e.g. Holiday package to Bali + ₹1L cash prize..."
              rows="3"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Is Active</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>Whether this reward milestone is open for agents to achieve</div>
            </div>
            <div className="kfpl-toggle" onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}>
              <div className={`kfpl-toggle-track ${form.isActive ? 'active' : ''}`}>
                <div className="kfpl-toggle-thumb"></div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ============ END: RewardConfig.jsx ============ */
