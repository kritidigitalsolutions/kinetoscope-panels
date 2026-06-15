/* ============================================================
   Page: AddAgent.jsx
   Description: Form to create a new agent
   ============================================================ */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { COMMISSION_SLABS } from '../../data/mockData';

export default function AddAgent() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', pan: '',
    bankName: '', accountNo: '', ifsc: '',
    commissionOneTime: '', commissionMonthly: '', commissionSpecial: '',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addToast('Agent created successfully!', 'success', 'Agent Added');
    setTimeout(() => navigate('/agents'), 500);
  };

  return (
    <div className="kfpl-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Add New Agent</h2>
          <p className="kfpl-page-subtitle">Register a new agent on the platform</p>
        </div>
        <div className="kfpl-page-header-actions">
          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => navigate('/agents')}>Cancel</button>
        </div>
      </div>

      <form className="kfpl-form-card" onSubmit={handleSubmit}>
        <div className="kfpl-form-card-header">
          <div>
            <h3 className="kfpl-form-card-title">Agent Information</h3>
            <p className="kfpl-form-card-subtitle">Agent ID will be auto-generated</p>
          </div>
        </div>

        <div className="kfpl-form">
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

          <div className="kfpl-form-actions">
            <button type="button" className="kfpl-btn kfpl-btn--ghost" onClick={() => navigate('/agents')}>Cancel</button>
            <button type="submit" className="kfpl-btn kfpl-btn--primary">Create Agent</button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ============ END: AddAgent.jsx ============ */
