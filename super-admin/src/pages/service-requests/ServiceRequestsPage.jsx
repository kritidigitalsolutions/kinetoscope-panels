/* ============================================================
   Page: ServiceRequestsPage.jsx
   Description: Centralized service requests dashboard for Clients and Agents
   ============================================================ */

import { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { investors, agents } from '../../data/mockData';

const DEFAULT_REQUESTS = [
  { id: 'SR-101', raisedBy: 'Rajesh Kumar', raiserType: 'Client', dateRaised: '2026-06-10', subject: 'Address Update Request', description: 'I want to update my address to Flat 202, Marina Apartments, Mumbai. Please verify.', status: 'Open', adminNote: '' },
  { id: 'SR-102', raisedBy: 'Neha Gupta', raiserType: 'Agent', dateRaised: '2026-06-12', subject: 'Commission Payout Enquiry', description: 'February commission payout of client Amit Joshi is not credited in my account. Please check why it is delayed.', status: 'In Progress', adminNote: 'Checking with finance department' },
  { id: 'SR-103', raisedBy: 'Suresh Patel', raiserType: 'Client', dateRaised: '2026-06-13', subject: 'ROI Payment Pending', description: 'My ROI payment for April 2025 is still showing pending in my dashboard. Please verify and credit.', status: 'Open', adminNote: '' },
  { id: 'SR-104', raisedBy: 'Arjun Singh', raiserType: 'Agent', dateRaised: '2026-06-14', subject: 'Add new segment request', description: 'Please assign Distribution segment to client Suresh Patel to capture high distribution ROI.', status: 'Resolved', adminNote: 'Assigned distribution segment successfully on 2026-06-15.' },
  { id: 'SR-105', raisedBy: 'Priya Sharma', raiserType: 'Client', dateRaised: '2026-06-15', subject: 'KYC document update', description: 'Need to re-upload PAN card copy as previous upload was blurry.', status: 'Closed', adminNote: 'KYC PAN re-uploaded and approved.' }
];

export default function ServiceRequestsPage() {
  const addToast = useToast();

  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter States
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form edit states
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');
  const [sendEmail, setSendEmail] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('kfpl_service_requests');
    if (data) {
      setRequests(JSON.parse(data));
    } else {
      setRequests(DEFAULT_REQUESTS);
      localStorage.setItem('kfpl_service_requests', JSON.stringify(DEFAULT_REQUESTS));
    }
  }, []);

  const saveRequests = (updatedList) => {
    setRequests(updatedList);
    localStorage.setItem('kfpl_service_requests', JSON.stringify(updatedList));
    
    // Dispatch custom event to notify Sidebar unresolved badge
    window.dispatchEvent(new Event('serviceRequestsUpdated'));
  };

  const handleOpenDetail = (req) => {
    setSelectedReq(req);
    setEditStatus(req.status);
    setEditNote(req.adminNote || '');
    setSendEmail(false);
    setShowDetailModal(true);
  };

  const handleSaveChanges = () => {
    if (!editStatus) {
      alert('Please select a status.');
      return;
    }

    const updated = requests.map(r => {
      if (r.id === selectedReq.id) {
        return {
          ...r,
          status: editStatus,
          adminNote: editNote
        };
      }
      return r;
    });

    saveRequests(updated);
    setShowDetailModal(false);
    
    // Simulate email notification if checked
    if (sendEmail) {
      let emailAddress = 'user@email.com';
      if (selectedReq.raiserType === 'Client') {
        const match = investors.find(i => i.name === selectedReq.raisedBy);
        if (match) emailAddress = match.email;
      } else if (selectedReq.raiserType === 'Agent') {
        const match = agents.find(a => a.name === selectedReq.raisedBy);
        if (match) emailAddress = match.email;
      }
      addToast(`Notification email sent to ${emailAddress}`, 'info', 'Email Sent');
    }

    setSelectedReq(null);
    addToast('Service Request updated successfully', 'success', 'Request Updated');
  };

  // Filter Logic
  const filteredRequests = requests.filter(req => {
    if (statusFilter !== 'All' && req.status !== statusFilter) return false;
    if (typeFilter !== 'All' && req.raiserType !== typeFilter) return false;
    if (startDate && req.dateRaised < startDate) return false;
    if (endDate && req.dateRaised > endDate) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    const map = {
      'Open': 'pending', // orange
      'In Progress': 'gold', // gold
      'Resolved': 'active', // green
      'Closed': 'inactive' // grey
    };
    return map[status] || 'inactive';
  };

  const unresolvedCount = requests.filter(r => r.status === 'Open' || r.status === 'In Progress').length;

  return (
    <div className="kfpl-page animate-fade-slide-up">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Service Requests</h2>
          <p className="kfpl-page-subtitle">
            Manage inquiries, update requests, and issues raised by clients and agents (Unresolved: <strong style={{ color: 'var(--color-gold-dark)' }}>{unresolvedCount}</strong>)
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="kfpl-card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div className="kfpl-form-row-3" style={{ gap: '16px', flexWrap: 'wrap' }}>
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Filter by Status</label>
            <select className="kfpl-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Filter by Raiser Type</label>
            <select className="kfpl-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="All">All Raisers</option>
              <option value="Client">Client</option>
              <option value="Agent">Agent</option>
            </select>
          </div>

          <div className="kfpl-input-group" style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label className="kfpl-input-label">Start Date</label>
              <input type="date" className="kfpl-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="kfpl-input-label">End Date</label>
              <input type="date" className="kfpl-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="kfpl-card">
        <div className="kfpl-table-scroll">
          <table className="kfpl-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Raised By</th>
                <th>Raiser Type</th>
                <th>Date Raised</th>
                <th>Subject</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                    No service requests found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} onClick={() => handleOpenDetail(req)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600 }}>{req.id}</td>
                    <td className="kfpl-table-cell-primary">{req.raisedBy}</td>
                    <td>
                      <Badge status={req.raiserType === 'Client' ? 'silver' : 'gold'}>
                        {req.raiserType}
                      </Badge>
                    </td>
                    <td>{req.dateRaised}</td>
                    <td>{req.subject}</td>
                    <td>
                      <Badge status={getStatusBadge(req.status)}>{req.status}</Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={(e) => { e.stopPropagation(); handleOpenDetail(req); }}>
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail & Response Modal */}
      {selectedReq && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`Review Service Request - ${selectedReq.id}`}
          footer={
            <>
              <button className="kfpl-btn kfpl-btn--ghost" onClick={() => setShowDetailModal(false)}>Cancel</button>
              <button className="kfpl-btn kfpl-btn--primary" onClick={handleSaveChanges}>Save Changes</button>
            </>
          }
        >
          <div className="kfpl-form" style={{ gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>RAISED BY</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--color-navy)' }}>{selectedReq.raisedBy} ({selectedReq.raiserType})</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>DATE RAISED</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--color-navy)' }}>{selectedReq.dateRaised}</strong>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>SUBJECT</span>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)' }}>{selectedReq.subject}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>DESCRIPTION</span>
              <div style={{ fontSize: '0.875rem', padding: '10px 14px', borderRadius: '8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap' }}>
                {selectedReq.description}
              </div>
            </div>

            <div className="kfpl-form-row" style={{ gap: '16px', alignItems: 'flex-end' }}>
              <div className="kfpl-input-group" style={{ flex: 1 }}>
                <label className="kfpl-input-label">Update Status</label>
                <select className="kfpl-select" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="kfpl-input-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '62px', justifyContent: 'flex-end' }}>
                <label className="kfpl-input-label" style={{ marginBottom: '6px' }}>Email Notification</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '38px' }}>
                  <button
                    type="button"
                    onClick={() => setSendEmail(!sendEmail)}
                    style={{
                      position: 'relative',
                      width: '46px',
                      height: '24px',
                      borderRadius: '12px',
                      background: sendEmail ? 'var(--color-success, #10b981)' : '#cbd5e1',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.25s ease',
                      padding: 0,
                      outline: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: sendEmail ? 'translateX(26px)' : 'translateX(4px)'
                      }}
                    />
                  </button>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: sendEmail ? 'var(--color-text)' : 'var(--color-text-muted)', transition: 'color 0.2s' }}>
                    {sendEmail ? 'Notify Raiser via Email' : 'Do Not Notify'}
                  </span>
                </div>
              </div>
            </div>

            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Internal Admin Response / Remarks</label>
              <textarea
                className="kfpl-textarea"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Write resolution steps, internal audit notes, or replies..."
                rows="3"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============ END: ServiceRequestsPage.jsx ============ */
