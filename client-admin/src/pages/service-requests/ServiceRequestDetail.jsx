import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../../config/apiHelper';

export default function ServiceRequestDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/api/client/service-requests');
        const list = data.requests || (Array.isArray(data) ? data : []);
        const found = list.find(r => r._id === id || r.id === id);
        if (found) {
          setReq(found);
          setError(null);
        } else {
          setError('Service request not found.');
        }
      } catch (err) {
        console.error('Failed to load request detail:', err);
        setError('Failed to load service request detail.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="kfpl-page">
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--color-text-muted)' }}>
          Loading service request details...
        </div>
      </div>
    );
  }

  if (error || !req) {
    return (
      <div className="kfpl-page">
        <div className="kfpl-page-header">
          <div className="kfpl-page-header-actions">
            <button className="kfpl-btn kfpl-btn--ghost" onClick={() => navigate('/service-requests')}>← Back to Requests</button>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-danger)' }}>
          {error || 'Request details could not be found.'}
        </div>
      </div>
    );
  }

  // Generate dynamic timeline fallback if not provided by backend
  const displayTimeline = req.timeline || [
    { 
      date: req.createdAt || req.date ? new Date(req.createdAt || req.date).toLocaleDateString('en-IN') : 'N/A', 
      text: 'Request raised and submitted.', 
      type: 'RAISED' 
    },
    ...(req.status === 'In Progress' ? [
      { date: '—', text: 'Our administration team is reviewing this ticket.', type: 'IN PROGRESS' }
    ] : []),
    ...(req.status === 'Resolved' || req.status === 'Closed' ? [
      { date: '—', text: req.adminRemarks || req.adminNote || 'This ticket has been resolved.', type: req.status.toUpperCase() }
    ] : [])
  ];

  return (
    <div className="kfpl-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h1 className="kfpl-page-title">Request {req.id}</h1>
          <p className="kfpl-page-subtitle">{req.category} — {req.subject}</p>
        </div>
        <div className="kfpl-page-header-actions">
          <button className="kfpl-btn kfpl-btn--ghost" onClick={() => navigate('/service-requests')}>← Back to Requests</button>
        </div>
      </div>

      <div className="kfpl-grid-2col">
        {/* Request Details */}
        <div className="kfpl-card">
          <h3 style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid var(--color-gold)' }}>Request Details</h3>
          <div className="kfpl-profile-info-row"><span className="kfpl-profile-info-label">Request ID</span><span className="kfpl-profile-info-value mono">{req.id}</span></div>
          <div className="kfpl-profile-info-row"><span className="kfpl-profile-info-label">Category</span><span className="kfpl-profile-info-value">{req.category}</span></div>
          <div className="kfpl-profile-info-row"><span className="kfpl-profile-info-label">Subject</span><span className="kfpl-profile-info-value">{req.subject}</span></div>
          <div className="kfpl-profile-info-row"><span className="kfpl-profile-info-label">Status</span><span className="kfpl-profile-info-value"><span className={`kfpl-request-status ${req.status.toLowerCase().replace(' ', '-')}`}>{req.status}</span></span></div>
          <div className="kfpl-profile-info-row"><span className="kfpl-profile-info-label">Date Raised</span><span className="kfpl-profile-info-value">{req.createdAt || req.date ? new Date(req.createdAt || req.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</span></div>
          
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{req.description}</p>
          </div>

          {req.attachmentUrl && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Attachment</h4>
              <a 
                href={req.attachmentUrl} 
                target="_blank" 
                rel="noreferrer" 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  color: 'var(--color-gold)', 
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                View Attached File
              </a>
            </div>
          )}

          {(req.adminRemarks || req.adminNote) && (
            <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--color-gold-light)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-gold)' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gold-dark)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin Response</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{req.adminRemarks || req.adminNote}</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="kfpl-card">
          <h3 style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid var(--color-gold)' }}>Status Timeline</h3>
          <div className="kfpl-timeline">
            {displayTimeline.map((item, i) => (
              <div key={i} className="kfpl-timeline-item">
                <div className={`kfpl-timeline-dot ${i > 0 ? 'muted' : ''}`}></div>
                <div className="kfpl-timeline-content">
                  <div className="kfpl-timeline-date">{item.date}</div>
                  <div className="kfpl-timeline-text">{item.text}</div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{item.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ END: ServiceRequestDetail.jsx ============ */
