/* ============================================================
   Page: AddAgent.jsx
   Description: Form to create a new agent
   ============================================================ */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { COMMISSION_SLABS, agents } from '../../data/mockData';
import FileDropzone from '../../components/ui/FileDropzone';

export default function AddAgent() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', pan: '',
    bankName: '', accountNo: '', ifsc: '',
    commissionOneTime: '', commissionMonthly: '', commissionSpecial: '',
    nomineeName: '', nomineeRelation: '', nomineeContact: '', nomineeEmail: '',
  });

  const [portalEmail, setPortalEmail] = useState('');
  const [portalPassword, setPortalPassword] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const nextForm = { ...prev, [name]: value };
      if (name === 'email') {
        setPortalEmail(value);
      }
      return nextForm;
    });
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPortalPassword(pass);
    addToast('Secure password generated!', 'info', 'Password Generated');
  };

  const copyCredentials = () => {
    if (!portalEmail || !portalPassword) return;
    const text = `Email: ${portalEmail}\nPassword: ${portalPassword}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          addToast('Credentials copied to clipboard!', 'success', 'Copied');
        })
        .catch(() => {
          fallbackCopyText(text);
        });
    } else {
      fallbackCopyText(text);
    }
  };

  const fallbackCopyText = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      addToast('Credentials copied to clipboard!', 'success', 'Copied');
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textarea);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((form.nomineeRelation || form.nomineeContact) && !form.nomineeName) {
      alert('Nominee Name is required if Nominee Relation or Nominee Contact is provided.');
      return;
    }

    // Generate new agent ID & record
    const newId = agents.length > 0 ? Math.max(...agents.map(a => a.id)) + 1 : 1;
    const agentId = `AGT-${String(newId).padStart(3, '0')}`;
    
    const newAgent = {
      id: newId,
      name: form.name,
      agentId: agentId,
      email: form.email,
      phone: form.phone,
      pan: form.pan,
      status: 'active',
      totalClients: 0,
      totalInvestment: 0,
      commissionOneTime: Number(form.commissionOneTime) || 0,
      commissionMonthly: Number(form.commissionMonthly) || 0,
      commissionSpecial: Number(form.commissionSpecial) || 0,
      bankName: form.bankName,
      accountNo: form.accountNo,
      ifsc: form.ifsc,
      joinDate: new Date().toISOString().split('T')[0],
      clients: [],
      investments: [],
      commissionHistory: [],
      portalEmail: portalEmail || form.email,
      portalPassword: portalPassword || 'kfpl@123',
      nominee: {
        name: form.nomineeName,
        relation: form.nomineeRelation,
        contact: form.nomineeContact,
        email: form.nomineeEmail,
      }
    };
    
    agents.push(newAgent);

    addToast(`Agent "${form.name}" registered successfully!`, 'success', 'Agent Added');
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

          {/* KYC Document Uploads */}
          <FileDropzone label="PAN Card Upload" />
          <FileDropzone label="ID Proof Upload (Aadhaar / Driving License / Passport)" />
          <FileDropzone label="Bank Details Document (Cancelled Cheque / Bank Statement)" />

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

          {/* Nominee Details */}
          <div className="kfpl-form-section">
            <div className="kfpl-form-section-title">Nominee Details</div>
            <div className="kfpl-form-row">
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Nominee Name {(form.nomineeRelation || form.nomineeContact) && <span className="required">*</span>}</label>
                <input className="kfpl-input" name="nomineeName" value={form.nomineeName} onChange={handleChange} placeholder="Enter nominee's full name" required={!!(form.nomineeRelation || form.nomineeContact)} />
              </div>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Nominee Relation</label>
                <select className="kfpl-select" name="nomineeRelation" value={form.nomineeRelation} onChange={handleChange} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                  <option value="">Select Relation</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="kfpl-form-row">
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Nominee Contact Number</label>
                <input className="kfpl-input" name="nomineeContact" value={form.nomineeContact} onChange={handleChange} placeholder="Enter contact number" />
              </div>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Nominee Email Address</label>
                <input className="kfpl-input" name="nomineeEmail" type="email" value={form.nomineeEmail} onChange={handleChange} placeholder="nominee@email.com" />
              </div>
            </div>
          </div>

          {/* Nominee ID Proof Upload */}
          <FileDropzone label="Nominee ID Proof" />

          {/* Agent Portal Credentials Generation */}
          <div className="kfpl-form-section">
            <div className="kfpl-form-section-title">Agent Portal Access</div>
            <div className="kfpl-form-row">
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Email Address / Login ID</label>
                <input className="kfpl-input" name="portalEmail" value={portalEmail} onChange={(e) => setPortalEmail(e.target.value)} placeholder="agent@email.com" />
              </div>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Portal Password</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="kfpl-input" type="text" value={portalPassword} onChange={(e) => setPortalPassword(e.target.value)} placeholder="Click Generate or enter secure password" style={{ flex: 1 }} />
                  <button type="button" className="kfpl-btn kfpl-btn--ghost" onClick={generatePassword} style={{ whiteSpace: 'nowrap' }}>Generate</button>
                  <button type="button" className="kfpl-btn kfpl-btn--ghost" onClick={copyCredentials} disabled={!portalEmail || !portalPassword} style={{ whiteSpace: 'nowrap' }}>Copy</button>
                </div>
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
