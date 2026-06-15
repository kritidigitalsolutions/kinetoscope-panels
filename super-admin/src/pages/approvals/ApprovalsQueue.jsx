/* ============================================================
   Page: ApprovalsQueue.jsx
   Description: Deposit and Withdrawal approval queue — card view
   ============================================================ */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { approvals, formatCurrency } from '../../data/mockData';
import { useToast } from '../../components/ui/Toast';

// Icons
const icons = {
  deposit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  withdrawal: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
};

export default function ApprovalsQueue() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [activeTab, setActiveTab] = useState('deposits');
  const [modal, setModal] = useState({ open: false, type: '', item: null });
  const [rejectReason, setRejectReason] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const currentItems = activeTab === 'deposits' ? approvals.deposits : approvals.withdrawals;
  const pendingDeposits = approvals.deposits.filter(i => i.status === 'pending').length;
  const pendingWithdrawals = approvals.withdrawals.filter(i => i.status === 'pending').length;
  const totalPending = pendingDeposits + pendingWithdrawals;

  const handleApprove = (item) => {
    setModal({ open: true, type: 'approve', item });
  };

  const handleReject = (item) => {
    setModal({ open: true, type: 'reject', item });
  };

  const confirmApprove = () => {
    addToast(`${modal.item.type} of ${formatCurrency(modal.item.amount)} approved for ${modal.item.investorName}`, 'success', 'Approved');
    setModal({ open: false, type: '', item: null });
    setAdminNote('');
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) return;
    addToast(`${modal.item.type} of ${formatCurrency(modal.item.amount)} rejected for ${modal.item.investorName}`, 'error', 'Rejected');
    setModal({ open: false, type: '', item: null });
    setRejectReason('');
  };

  return (
    <div className="kfpl-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Approvals Queue</h2>
          <p className="kfpl-page-subtitle">Manage deposit and withdrawal requests</p>
        </div>
        <div className="kfpl-page-header-actions">
          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => navigate('/approvals/history')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            View History
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="kfpl-perks-stats" style={{ marginBottom: '20px' }}>
        <div className="kfpl-perks-stat">
          <span className="kfpl-perks-stat-num" style={{ color: 'var(--color-danger)' }}>{totalPending}</span>
          <span className="kfpl-perks-stat-label">Pending</span>
        </div>
        <div className="kfpl-perks-stat">
          <span className="kfpl-perks-stat-num" style={{ color: 'var(--color-success)' }}>{pendingDeposits}</span>
          <span className="kfpl-perks-stat-label">Deposits</span>
        </div>
        <div className="kfpl-perks-stat">
          <span className="kfpl-perks-stat-num" style={{ color: 'var(--color-warning)' }}>{pendingWithdrawals}</span>
          <span className="kfpl-perks-stat-label">Withdrawals</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="kfpl-tabs">
        <div className={`kfpl-tab ${activeTab === 'deposits' ? 'active' : ''}`} onClick={() => setActiveTab('deposits')}>
          Deposits ({pendingDeposits})
        </div>
        <div className={`kfpl-tab ${activeTab === 'withdrawals' ? 'active' : ''}`} onClick={() => setActiveTab('withdrawals')}>
          Withdrawals ({pendingWithdrawals})
        </div>
      </div>

      {/* Approval Cards */}
      {currentItems.length === 0 ? (
        <div className="kfpl-empty">
          <div className="kfpl-empty-icon">{icons.check}</div>
          <div className="kfpl-empty-title">All caught up!</div>
          <div className="kfpl-empty-text">No {activeTab} requests at the moment.</div>
        </div>
      ) : (
        <div className="kfpl-approval-cards">
          {currentItems.map(item => (
            <div className={`kfpl-approval-card ${item.type}`} key={item.id}>
              {/* Type Icon */}
              <div className={`kfpl-approval-type-icon ${item.type}`}>
                {item.type === 'deposit' ? icons.deposit : icons.withdrawal}
              </div>

              {/* Client Info */}
              <div className="kfpl-approval-info">
                <div className="kfpl-approval-name">{item.investorName}</div>
                <div className="kfpl-approval-meta">
                  <span>{item.clientId}</span>
                  <span>•</span>
                  <span>{item.date}</span>
                  <span>•</span>
                  <Badge status={item.type === 'deposit' ? 'active' : 'pending'}>{item.type}</Badge>
                </div>
              </div>

              {/* Amount */}
              <div className="kfpl-approval-amount">
                {item.type === 'deposit' ? '+' : '−'}{formatCurrency(item.amount)}
              </div>

              {/* Status & Actions */}
              <Badge status={item.status}>{item.status}</Badge>

              {item.status === 'pending' ? (
                <div className="kfpl-approval-actions">
                  <button className="kfpl-btn kfpl-btn--success kfpl-btn--sm" onClick={() => handleApprove(item)} title="Approve">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                    Approve
                  </button>
                  <button className="kfpl-btn kfpl-btn--danger kfpl-btn--sm" onClick={() => handleReject(item)} title="Reject">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Reject
                  </button>
                </div>
              ) : (
                <span className="text-muted text-sm" style={{ marginLeft: '8px' }}>—</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      <Modal
        isOpen={modal.open && modal.type === 'approve'}
        onClose={() => setModal({ open: false, type: '', item: null })}
        title="Approve Request"
        footer={
          <>
            <button className="kfpl-btn kfpl-btn--ghost" onClick={() => setModal({ open: false, type: '', item: null })}>Cancel</button>
            <button className="kfpl-btn kfpl-btn--success" onClick={confirmApprove}>Confirm Approve</button>
          </>
        }
      >
        {modal.item && (
          <div>
            <div className="kfpl-approval-card" style={{ marginBottom: '16px', border: '1.5px solid var(--color-success)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
              <div className={`kfpl-approval-type-icon ${modal.item.type}`}>
                {modal.item.type === 'deposit' ? icons.deposit : icons.withdrawal}
              </div>
              <div className="kfpl-approval-info">
                <div className="kfpl-approval-name">{modal.item.investorName}</div>
                <div className="kfpl-approval-meta">
                  <span>{modal.item.clientId}</span>
                  <span>•</span>
                  <span>{modal.item.date}</span>
                </div>
              </div>
              <div className="kfpl-approval-amount">{formatCurrency(modal.item.amount)}</div>
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Admin Note (optional)</label>
              <textarea className="kfpl-textarea" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Add a note..." rows="3" />
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={modal.open && modal.type === 'reject'}
        onClose={() => setModal({ open: false, type: '', item: null })}
        title="Reject Request"
        footer={
          <>
            <button className="kfpl-btn kfpl-btn--ghost" onClick={() => setModal({ open: false, type: '', item: null })}>Cancel</button>
            <button className="kfpl-btn kfpl-btn--danger" onClick={confirmReject} disabled={!rejectReason.trim()}>Confirm Reject</button>
          </>
        }
      >
        {modal.item && (
          <div>
            <div className="kfpl-approval-card" style={{ marginBottom: '16px', border: '1.5px solid var(--color-danger)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
              <div className={`kfpl-approval-type-icon ${modal.item.type}`}>
                {modal.item.type === 'deposit' ? icons.deposit : icons.withdrawal}
              </div>
              <div className="kfpl-approval-info">
                <div className="kfpl-approval-name">{modal.item.investorName}</div>
                <div className="kfpl-approval-meta">
                  <span>{modal.item.clientId}</span>
                  <span>•</span>
                  <span>{modal.item.date}</span>
                </div>
              </div>
              <div className="kfpl-approval-amount">{formatCurrency(modal.item.amount)}</div>
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Rejection Reason <span className="required">*</span></label>
              <textarea className="kfpl-textarea" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter reason for rejection..." rows="3" required />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ============ END: ApprovalsQueue.jsx ============ */
