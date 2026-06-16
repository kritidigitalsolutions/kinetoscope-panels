/* ============================================================
   Page: EditAgent.jsx
   Description: Form to edit an existing agent profile
   ============================================================ */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import Badge from '../../components/ui/Badge';
import { agents, COMMISSION_SLABS } from '../../data/mockData';

export default function EditAgent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();

  const agent = agents.find(a => a.id === Number(id));

  const [form, setForm] = useState({
    name: '', email: '', phone: '', pan: '',
    bankName: '', accountNo: '', ifsc: '',
    commissionOneTime: '', commissionMonthly: '', commissionSpecial: '',
    status: '',
  });

  useEffect(() => {
    if (agent) {
      setForm({
        name: agent.name || '',
        email: agent.email || '',
        phone: agent.phone || '',
        pan: agent.pan || '',
        bankName: agent.bankName || '',
        accountNo: agent.accountNo || '',
        ifsc: agent.ifsc || '',
        commissionOneTime: agent.commissionOneTime ?? '',
        commissionMonthly: agent.commissionMonthly ?? '',
        commissionSpecial: agent.commissionSpecial ?? '',
        status: agent.status || '',
      });
    }
  }, [agent]);

  if (!agent) {
    return (
      <div className="kfpl-page">
        <div className="kfpl-empty">
          <div className="kfpl-empty-title">Agent not found</div>
          <button className="kfpl-btn kfpl-btn--primary mt-4" onClick={() => navigate('/agents')}>Back to List</button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update mock data in-memory so changes reflect immediately
    const idx = agents.findIndex(a => a.id === Number(id));
    if (idx !== -1) {
      agents[idx] = {
        ...agents[idx],
        name: form.name,
        email: form.email,
        phone: form.phone,
        pan: form.pan,
        bankName: form.bankName,
        accountNo: form.accountNo,
        ifsc: form.ifsc,
        commissionOneTime: parseFloat(form.commissionOneTime) || 0,
        commissionMonthly: parseFloat(form.commissionMonthly) || 0,
        commissionSpecial: parseFloat(form.commissionSpecial) || 0,
        status: form.status,
      };
    }
    addToast(`Agent "${form.name}" updated successfully!`, 'success', 'Agent Updated');
    setTimeout(() => navigate(`/agents/${id}`), 500);
  };

  return (
    <div className="kfpl-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Edit Agent Profile</h2>
          <p className="kfpl-page-subtitle">Update details for <strong>{agent.name}</strong> — {agent.agentId}</p>
        </div>
        <div className="kfpl-page-header-actions">
          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => navigate(`/agents/${id}`)}>Cancel</button>
        </div>
      </div>

      <form className="kfpl-form-card" onSubmit={handleSubmit}>
        <div className="kfpl-form-card-header">
          <div>
            <h3 className="kfpl-form-card-title">Agent Information</h3>
            <p className="kfpl-form-card-subtitle">Agent ID: {agent.agentId}</p>
          </div>
          <Badge status={agent.status}>{agent.status}</Badge>
        </div>

        <div className="kfpl-form">
          {/* Personal Details */}
          <div className="kfpl-form-section">
            <div className="kfpl-form-section-title">Personal Details</div>
            <div className="kfpl-form-row">
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Full Name <span className="required">*</span></label>
                <input className="kfpl-input" name="name" value={form.name} onChange={handleChange} placeholder="Enter full name" required />
              </div>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Email Address <span className="required">*</span></label>
                <input className="kfpl-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="agent@email.com" required />
              </div>
            </div>
            <div className="kfpl-form-row">
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Phone Number <span className="required">*</span></label>
                <input className="kfpl-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 99887 76650" required />
              </div>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">PAN Number</label>
                <input className="kfpl-input" name="pan" value={form.pan} onChange={handleChange} placeholder="ABCVP1234T" />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="kfpl-form-section">
            <div className="kfpl-form-section-title">Account Settings</div>
            <div className="kfpl-form-row">
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Status</label>
                <select className="kfpl-input" name="status" value={form.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div></div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="kfpl-form-section">
            <div className="kfpl-form-section-title">Bank Details</div>
            <div className="kfpl-form-row-3">
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Bank Name</label>
                <input className="kfpl-input" name="bankName" value={form.bankName} onChange={handleChange} placeholder="Bank name" />
              </div>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Account Number</label>
                <input className="kfpl-input" name="accountNo" value={form.accountNo} onChange={handleChange} placeholder="Account number" />
              </div>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">IFSC Code</label>
                <input className="kfpl-input" name="ifsc" value={form.ifsc} onChange={handleChange} placeholder="HDFC0004321" />
              </div>
            </div>
          </div>

          {/* Commission Configuration */}
          <div className="kfpl-form-section">
            <div className="kfpl-form-section-title">Commission Configuration</div>
            <div className="kfpl-form-row-3">
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">One-Time Commission %</label>
                <input className="kfpl-input" name="commissionOneTime" type="number" step="0.1" value={form.commissionOneTime} onChange={handleChange} placeholder="e.g. 2" />
              </div>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Monthly Slab %</label>
                <select className="kfpl-select" name="commissionMonthly" value={form.commissionMonthly} onChange={handleChange}>
                  <option value="">Select slab</option>
                  {COMMISSION_SLABS.map(s => (
                    <option key={s.id} value={s.percentage}>{s.label} — {s.percentage}%</option>
                  ))}
                </select>
              </div>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Special Commission %</label>
                <input className="kfpl-input" name="commissionSpecial" type="number" step="0.1" value={form.commissionSpecial} onChange={handleChange} placeholder="e.g. 0.5" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="kfpl-form-actions">
            <button type="button" className="kfpl-btn kfpl-btn--ghost" onClick={() => navigate(`/agents/${id}`)}>Cancel</button>
            <button type="submit" className="kfpl-btn kfpl-btn--primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16" style={{ marginRight: '6px' }}>
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2 2h11l5 5v11z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ============ END: EditAgent.jsx ============ */
