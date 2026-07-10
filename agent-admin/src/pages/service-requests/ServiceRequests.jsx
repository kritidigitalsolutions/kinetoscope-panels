import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { apiRequest } from '../../config/apiHelper';
import { useToast } from '../../components/ui/Toast';

const statusColors = {
  'Open': 'kfpl-badge--warning',
  'In Progress': 'kfpl-badge--emerald',
  'Resolved': 'kfpl-badge--success',
  'Closed': 'kfpl-badge--muted',
};

const categories = ['Profile Update', 'Nominee Update', 'Commission Query', 'Client Query', 'Reward Issue', 'Withdrawal Issue', 'Other'];

export default function ServiceRequests() {
  const toastHelper = useToast();
  const addToast = typeof toastHelper === 'function' ? toastHelper : (toastHelper?.addToast || (() => {}));
  const location = useLocation();
  const requestDraft = location.state || {};

  const [activeView, setActiveView] = useState(requestDraft.activeView || 'list');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newRequest, setNewRequest] = useState({
    category: requestDraft.category || '',
    subject: requestDraft.subject || '',
    description: '',
  });
  
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/agent/service-requests');
      // The API returns requests under `data.requests` or directly as an array.
      const list = data.requests || (Array.isArray(data) ? data : []);
      setRequests(list);
      setError(null);
    } catch (err) {
      console.error('Failed to load agent service requests:', err);
      setError('Failed to fetch service requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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
    if (!newRequest.category || !newRequest.subject || !newRequest.description) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('category', newRequest.category);
      formData.append('subject', newRequest.subject);
      formData.append('description', newRequest.description);
      if (attachment) {
        formData.append('attachment', attachment);
      }

      const res = await apiRequest('/api/agent/service-requests', {
        method: 'POST',
        body: formData,
      });

      addToast('Service request submitted successfully!', 'success', 'Success');
      setNewRequest({ category: '', subject: '', description: '' });
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Reload and return to list view
      await fetchRequests();
      setActiveView('list');
    } catch (err) {
      console.error('Failed to raise service request:', err);
      addToast(err.message || 'Failed to submit service request', 'danger', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate dynamic timeline fallback if not provided by backend
  const getTimeline = (sr) => {
    return sr.timeline || [
      { 
        date: sr.createdAt || sr.date ? new Date(sr.createdAt || sr.date).toLocaleDateString('en-IN') : 'N/A', 
        title: 'Request Submitted', 
        desc: 'Your request has been received by our support center.' 
      },
      ...(sr.status === 'In Progress' ? [
        { date: '—', title: 'In Progress', desc: 'Our administration team is reviewing this ticket.' }
      ] : []),
      ...(sr.status === 'Resolved' || sr.status === 'Closed' ? [
        { date: '—', title: sr.status, desc: sr.adminRemarks || sr.adminNote || 'Your ticket has been processed.' }
      ] : [])
    ];
  };

  return (
    <div className="kfpl-page" id="service-requests-page">
      {/* Tabs */}
      <div className="kfpl-tabs">
        <button className={`kfpl-tab ${activeView === 'list' ? 'active' : ''}`} onClick={() => { setActiveView('list'); setSelectedRequest(null); }}>My Requests</button>
        <button className={`kfpl-tab ${activeView === 'new' ? 'active' : ''}`} onClick={() => { setActiveView('new'); setSelectedRequest(null); }}>New Request</button>
      </div>

      {/* ═══ REQUEST LIST ═══ */}
      {activeView === 'list' && !selectedRequest && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
              Loading service requests...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-danger)' }}>
              {error}
            </div>
          ) : (
            <div className="kfpl-table-wrapper">
              <table className="kfpl-table">
                <thead>
                  <tr><th>Request ID</th><th>Category</th><th>Subject</th><th>Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                        No service requests raised yet.
                      </td>
                    </tr>
                  ) : (
                    requests.map(sr => (
                      <tr key={sr._id || sr.id} onClick={() => setSelectedRequest(sr)} style={{ cursor: 'pointer' }}>
                        <td className="cell-mono">{sr.id}</td>
                        <td><span className="kfpl-badge kfpl-badge--info">{sr.category}</span></td>
                        <td style={{ fontWeight: 600 }}>{sr.subject}</td>
                        <td>{sr.createdAt || sr.date ? new Date(sr.createdAt || sr.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</td>
                        <td><span className={`kfpl-badge ${statusColors[sr.status] || 'kfpl-badge--warning'}`}>{sr.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ═══ REQUEST DETAIL ═══ */}
      {activeView === 'list' && selectedRequest && (
        <div className="kfpl-card">
          <div className="kfpl-card-header">
            <div>
              <h3>{selectedRequest.subject}</h3>
              <span className="kfpl-mono" style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{selectedRequest.id}</span>
            </div>
            <button className="kfpl-btn kfpl-btn-ghost kfpl-btn-sm" onClick={() => setSelectedRequest(null)}>
              ← Back to List
            </button>
          </div>
          <div className="kfpl-card-body">
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <span className={`kfpl-badge ${statusColors[selectedRequest.status] || 'kfpl-badge--warning'}`}>{selectedRequest.status}</span>
              <span className="kfpl-badge kfpl-badge--info">{selectedRequest.category}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                {selectedRequest.createdAt || selectedRequest.date ? new Date(selectedRequest.createdAt || selectedRequest.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}
              </span>
            </div>

            <h4 style={{ fontSize: 14, marginBottom: 8 }}>Description</h4>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
              {selectedRequest.description}
            </p>

            {selectedRequest.attachmentUrl && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 14, marginBottom: 8 }}>Attachment</h4>
                <a 
                  href={selectedRequest.attachmentUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    color: 'var(--color-gold)', 
                    fontWeight: 600,
                    fontSize: '13px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  View Attached File
                </a>
              </div>
            )}

            {/* Status Timeline */}
            <h4 style={{ fontSize: 14, marginBottom: 16 }}>Status Timeline</h4>
            <div className="kfpl-sr-status-timeline">
              {getTimeline(selectedRequest).map((item, idx) => (
                <div key={idx} className="kfpl-sr-timeline-item completed">
                  <div className="kfpl-sr-timeline-date">{item.date}</div>
                  <div className="kfpl-sr-timeline-title">{item.title}</div>
                  <div className="kfpl-sr-timeline-desc">{item.desc}</div>
                </div>
              ))}
            </div>

            {(selectedRequest.adminRemarks || selectedRequest.adminNote) && (
              <div style={{ marginTop: 24, padding: 16, background: 'var(--color-gold-light)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-gold)' }}>
                <h4 style={{ fontSize: 13, color: 'var(--color-gold-dark)', marginBottom: 8 }}>Admin Response</h4>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{selectedRequest.adminRemarks || selectedRequest.adminNote}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ NEW REQUEST FORM ═══ */}
      {activeView === 'new' && (
        <div className="kfpl-card" style={{ maxWidth: 640 }}>
          <div className="kfpl-card-header">
            <h3>Raise New Service Request</h3>
          </div>
          <div className="kfpl-card-body">
            <form onSubmit={handleSubmit}>
              <div className="kfpl-form-group">
                <label className="kfpl-form-label">Category <span className="required">*</span></label>
                <select 
                  className="kfpl-form-select" 
                  value={newRequest.category} 
                  onChange={e => setNewRequest({ ...newRequest, category: e.target.value })} 
                  required
                  disabled={submitting}
                >
                  <option value="">Select a category...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="kfpl-form-group">
                <label className="kfpl-form-label">Subject <span className="required">*</span></label>
                <input 
                  className="kfpl-form-input" 
                  placeholder="Brief summary of your request" 
                  value={newRequest.subject} 
                  onChange={e => setNewRequest({ ...newRequest, subject: e.target.value })} 
                  required 
                  disabled={submitting}
                />
              </div>
              <div className="kfpl-form-group">
                <label className="kfpl-form-label">Description <span className="required">*</span></label>
                <textarea 
                  className="kfpl-form-textarea" 
                  placeholder="Describe your request in detail..." 
                  value={newRequest.description} 
                  onChange={e => setNewRequest({ ...newRequest, description: e.target.value })} 
                  required 
                  disabled={submitting}
                />
              </div>
              
              <div className="kfpl-form-group">
                <label className="kfpl-form-label">Attachment (Optional)</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <div 
                  className="kfpl-file-upload" 
                  onClick={() => !submitting && fileInputRef.current?.click()}
                  style={{ cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {attachment ? (
                    <div style={{ width: '100%' }}>
                      <div className="kfpl-file-upload-icon" style={{ color: 'var(--color-gold)' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 32, height: 32 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div className="kfpl-file-upload-text">
                        <strong>{attachment.name}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleRemoveAttachment}
                        style={{
                          marginTop: '8px',
                          background: 'rgba(239,68,68,0.1)',
                          color: '#ef4444',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="kfpl-file-upload-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 32, height: 32 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      </div>
                      <div className="kfpl-file-upload-text">
                        <strong>Click to upload</strong> or drag and drop
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                className="kfpl-btn kfpl-btn-primary kfpl-btn-lg" 
                style={{ width: '100%' }}
                disabled={submitting || !newRequest.category || !newRequest.subject || !newRequest.description}
              >
                {submitting ? 'Submitting Request...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ END: ServiceRequests.jsx ============ */
