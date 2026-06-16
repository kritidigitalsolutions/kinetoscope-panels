/* ============================================================
   Page: EditInvestor.jsx
   Description: Form to edit an existing investor/client profile
   ============================================================ */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import Badge from '../../components/ui/Badge';
import FileDropzone from '../../components/ui/FileDropzone';
import { investors } from '../../data/mockData';

export default function EditInvestor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();

  const investor = investors.find(inv => inv.id === Number(id));

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', dob: '', address: '',
    pan: '', bankName: '', accountNo: '', ifsc: '',
    category: '', status: '',
  });

  useEffect(() => {
    if (investor) {
      setForm({
        fullName: investor.name || '',
        email: investor.email || '',
        phone: investor.phone || '',
        dob: investor.dob || '',
        address: investor.address || '',
        pan: investor.pan || '',
        bankName: investor.bankName || '',
        accountNo: investor.accountNo || '',
        ifsc: investor.ifsc || '',
        category: investor.category || '',
        status: investor.status || '',
      });
    }
  }, [investor]);

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

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update mock data in-memory so changes reflect immediately
    const idx = investors.findIndex(inv => inv.id === Number(id));
    if (idx !== -1) {
      investors[idx] = {
        ...investors[idx],
        name: form.fullName,
        email: form.email,
        phone: form.phone,
        dob: form.dob,
        address: form.address,
        pan: form.pan,
        bankName: form.bankName,
        accountNo: form.accountNo,
        ifsc: form.ifsc,
        category: form.category,
        status: form.status,
      };
    }
    addToast(`Client "${form.fullName}" updated successfully!`, 'success', 'Client Updated');
    setTimeout(() => navigate(`/investors/${id}`), 500);
  };

  return (
    <div className="kfpl-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Edit Client Profile</h2>
          <p className="kfpl-page-subtitle">Update details for <strong>{investor.name}</strong> — {investor.clientId}</p>
        </div>
        <div className="kfpl-page-header-actions">
          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => navigate(`/investors/${id}`)}>Cancel</button>
        </div>
      </div>

      <form className="kfpl-form-card" onSubmit={handleSubmit}>
        <div className="kfpl-form-card-header">
          <div>
            <h3 className="kfpl-form-card-title">Personal Information</h3>
            <p className="kfpl-form-card-subtitle">Client ID: {investor.clientId}</p>
          </div>
          <Badge status={investor.category}>{investor.category} Tier</Badge>
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

          {/* Status & Category */}
          <div className="kfpl-form-section">
            <div className="kfpl-form-section-title">Account Settings</div>
            <div className="kfpl-form-row">
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Category / Tier</label>
                <select className="kfpl-input" name="category" value={form.category} onChange={handleChange}>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                  <option value="diamond">Diamond</option>
                </select>
              </div>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Status</label>
                <select className="kfpl-input" name="status" value={form.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
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
          <FileDropzone label="Agreement Document" />

          {/* Actions */}
          <div className="kfpl-form-actions">
            <button type="button" className="kfpl-btn kfpl-btn--ghost" onClick={() => navigate(`/investors/${id}`)}>Cancel</button>
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

/* ============ END: EditInvestor.jsx ============ */
