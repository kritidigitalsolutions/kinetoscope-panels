import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { REQUEST_CATEGORIES } from '../../constants';
import { apiRequest } from '../../config/apiHelper';
import { useToast } from '../../components/ui/Toast';

export default function NewServiceRequest() {
  const navigate = useNavigate();
  const toastHelper = useToast();
  const addToast = typeof toastHelper === 'function' ? toastHelper : (toastHelper?.addToast || (() => {}));

  const [form, setForm] = useState({ category: REQUEST_CATEGORIES[0], subject: '', description: '' });
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('File size must be less than 5MB', 'danger', 'File Too Large');
        return;
      }
      setAttachment(file);
    }
  };

  const handleRemoveAttachment = (e) => {
    e.stopPropagation();
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.description) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('category', form.category);
      formData.append('subject', form.subject);
      formData.append('description', form.description);
      if (attachment) {
        formData.append('attachment', attachment);
      }

      await apiRequest('/api/client/service-requests', {
        method: 'POST',
        body: formData,
      });

      addToast('Service request submitted successfully!', 'success', 'Request Created');
      navigate('/service-requests');
    } catch (err) {
      console.error('Failed to create service request:', err);
      addToast(err.message || 'Failed to submit service request', 'danger', 'Submission Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kfpl-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h1 className="kfpl-page-title">New Service Request</h1>
          <p className="kfpl-page-subtitle">Describe your issue or request and we'll respond promptly</p>
        </div>
      </div>

      <div className="kfpl-form-card" style={{ maxWidth: '640px' }}>
        <form className="kfpl-form" onSubmit={handleSubmit}>
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Category <span className="required">*</span></label>
            <select className="kfpl-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} disabled={loading}>
              {REQUEST_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Subject <span className="required">*</span></label>
            <input className="kfpl-input" placeholder="Brief summary of your request" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required disabled={loading} />
          </div>
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Description <span className="required">*</span></label>
            <textarea className="kfpl-textarea" rows={5} placeholder="Provide details about your request..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required disabled={loading}></textarea>
          </div>
          
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Attachment (Optional)</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            
            <div 
              className="kfpl-dropzone" 
              onClick={() => !loading && fileInputRef.current?.click()}
              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {attachment ? (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="kfpl-dropzone-icon" style={{ color: 'var(--color-gold)' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <p className="kfpl-dropzone-text" style={{ fontWeight: 600 }}>{attachment.name}</p>
                  <p className="kfpl-dropzone-hint">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button 
                    type="button" 
                    onClick={handleRemoveAttachment} 
                    style={{ 
                      marginTop: '8px', 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      color: '#ef4444', 
                      padding: '4px 12px', 
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="kfpl-dropzone-icon">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p className="kfpl-dropzone-text">Click to upload or drag & drop</p>
                  <p className="kfpl-dropzone-hint">PDF, DOC, JPG, PNG (max 5MB)</p>
                </>
              )}
            </div>
          </div>

          <div className="kfpl-form-actions">
            <button type="button" className="kfpl-btn kfpl-btn--ghost" onClick={() => navigate('/service-requests')} disabled={loading}>Cancel</button>
            <button type="submit" className="kfpl-btn kfpl-btn--primary" disabled={loading || !form.subject || !form.description}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============ END: NewServiceRequest.jsx ============ */
