/* ============================================================
   Page: AddInvestor.jsx
   Description: Form to create a new investor profile
   ============================================================ */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';

export default function AddInvestor() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', dob: '', address: '',
    pan: '', bankName: '', accountNo: '', ifsc: '',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addToast('Investor created successfully!', 'success', 'Investor Added');
    setTimeout(() => navigate('/investors'), 500);
  };

  return (
    <div className="kfpl-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Add New Investor</h2>
          <p className="kfpl-page-subtitle">Fill in the details to onboard a new investor</p>
        </div>
        <div className="kfpl-page-header-actions">
          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => navigate('/investors')}>Cancel</button>
        </div>
      </div>

      <form className="kfpl-form-card" onSubmit={handleSubmit}>
        <div className="kfpl-form-card-header">
          <div>
            <h3 className="kfpl-form-card-title">Personal Information</h3>
            <p className="kfpl-form-card-subtitle">Client ID will be auto-generated</p>
          </div>
        </div>

        <div className="kfpl-form">
          {/* Personal Details */}
          <div className="kfpl-form-section">
            <div className="kfpl-form-section-title">Basic Details</div>
            <div className="kfpl-form-row">
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Full Name <span className="required">*</span></label>
                <input className="kfpl-input" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter full name" required />
              </div>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Email Address <span className="required">*</span></label>
                <input className="kfpl-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="investor@email.com" required />
              </div>
            </div>
            <div className="kfpl-form-row">
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Phone Number <span className="required">*</span></label>
                <input className="kfpl-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" required />
              </div>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Date of Birth</label>
                <input className="kfpl-input" name="dob" type="date" value={form.dob} onChange={handleChange} />
              </div>
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Address</label>
              <textarea className="kfpl-textarea" name="address" value={form.address} onChange={handleChange} placeholder="Full address" rows="2" />
            </div>
          </div>

          {/* KYC & Bank */}
          <div className="kfpl-form-section">
            <div className="kfpl-form-section-title">KYC & Bank Details</div>
            <div className="kfpl-form-row-3">
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">PAN Number</label>
                <input className="kfpl-input" name="pan" value={form.pan} onChange={handleChange} placeholder="ABCPK1234L" />
              </div>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Bank Name</label>
                <input className="kfpl-input" name="bankName" value={form.bankName} onChange={handleChange} placeholder="Bank name" />
              </div>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Account Number</label>
                <input className="kfpl-input" name="accountNo" value={form.accountNo} onChange={handleChange} placeholder="Account number" />
              </div>
            </div>
            <div className="kfpl-form-row">
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">IFSC Code</label>
                <input className="kfpl-input" name="ifsc" value={form.ifsc} onChange={handleChange} placeholder="HDFC0001234" />
              </div>
              <div></div>
            </div>
          </div>

          {/* Agreement Upload */}
          <div className="kfpl-form-section">
            <div className="kfpl-form-section-title">Agreement Document</div>
            <div className="kfpl-dropzone">
              <div className="kfpl-dropzone-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="40" height="40">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div className="kfpl-dropzone-text">Drag & drop files here, or click to browse</div>
              <div className="kfpl-dropzone-hint">PDF, JPG, PNG up to 10MB</div>
            </div>
          </div>

          {/* Actions */}
          <div className="kfpl-form-actions">
            <button type="button" className="kfpl-btn kfpl-btn--ghost" onClick={() => navigate('/investors')}>Cancel</button>
            <button type="submit" className="kfpl-btn kfpl-btn--primary">Create Investor</button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ============ END: AddInvestor.jsx ============ */
