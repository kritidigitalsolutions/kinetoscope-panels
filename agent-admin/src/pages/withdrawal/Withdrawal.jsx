/* ============================================================
   Page: Withdrawal.jsx
   Description: Withdrawal request form + history table
   PRD Section 9: W-01, W-02
   ============================================================ */

import { useState } from 'react';
import { dashboardStats, withdrawalHistory, agentProfile, formatCurrency } from '../../data/mockData';
import { useToast } from '../../components/ui/Toast';

export default function Withdrawal() {
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const pendingBalance = dashboardStats.commissionPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) {
      toast('Please enter a valid amount.', 'warning');
      return;
    }
    if (numAmount > pendingBalance) {
      toast('Amount exceeds your available balance.', 'danger');
      return;
    }
    toast(`Withdrawal request for ${formatCurrency(numAmount)} submitted!`, 'success');
    setAmount('');
    setNote('');
  };

  return (
    <div className="kfpl-page" id="withdrawal-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Withdrawals</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>Request commission payouts and monitor history.</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="kfpl-withdrawal-balance-card">
        <div className="kfpl-withdrawal-balance-label">Available for Withdrawal</div>
        <div className="kfpl-withdrawal-balance-value">{formatCurrency(pendingBalance)}</div>
        <div className="kfpl-withdrawal-balance-sub">Commission pending payout</div>
      </div>

      <div className="kfpl-withdrawal-grid" style={{ marginTop: 24 }}>
        {/* Withdrawal Form */}
        <div className="kfpl-card">
          <div className="kfpl-card-header">
            <h3>Raise Withdrawal Request</h3>
          </div>
          <div className="kfpl-card-body">
            <form onSubmit={handleSubmit}>
              <div className="kfpl-form-group">
                <label className="kfpl-form-label">Amount (₹) <span className="required">*</span></label>
                <input
                  className="kfpl-form-input"
                  type="text"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
                <span className="kfpl-form-help">Max: {formatCurrency(pendingBalance)}</span>
              </div>
              <div className="kfpl-form-group">
                <label className="kfpl-form-label">Bank Account</label>
                <input
                  className="kfpl-form-input"
                  type="text"
                  value={`${agentProfile.bankName} — ${agentProfile.bankAccount}`}
                  disabled
                />
              </div>
              <div className="kfpl-form-group">
                <label className="kfpl-form-label">Note (Optional)</label>
                <textarea
                  className="kfpl-form-textarea"
                  placeholder="Any additional notes..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  style={{ minHeight: 80 }}
                />
              </div>
              <button type="submit" className="kfpl-btn kfpl-btn--primary kfpl-btn--lg" style={{ width: '100%' }}>
                Submit Withdrawal Request
              </button>
            </form>
          </div>
        </div>

        {/* Request History */}
        <div className="kfpl-card">
          <div className="kfpl-card-header">
            <h3>Request History</h3>
          </div>
          <div className="kfpl-card-body" style={{ padding: 0 }}>
            <div className="kfpl-table-scroll">
              <table className="kfpl-table">
                <thead>
                  <tr><th>Date</th><th>Amount</th><th>Status</th><th>Note</th></tr>
                </thead>
                <tbody>
                  {withdrawalHistory.map(w => (
                    <tr key={w.id}>
                      <td>{new Date(w.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="cell-amount">{formatCurrency(w.amount)}</td>
                      <td>
                        <span className={`kfpl-badge ${w.status === 'Approved' ? 'kfpl-badge--success' : w.status === 'Pending' ? 'kfpl-badge--warning' : 'kfpl-badge--danger'}`}>
                          {w.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{w.adminNote || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ END: Withdrawal.jsx ============ */
