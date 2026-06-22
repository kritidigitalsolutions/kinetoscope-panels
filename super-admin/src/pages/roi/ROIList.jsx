/* ============================================================
   Page: ROIList.jsx
   Description: Return on Investment & Commission Payout Management
   ============================================================ */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { investors, agents, formatCurrency } from '../../data/mockData';
import { useToast } from '../../components/ui/Toast';

export default function ROIList() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ROI / Commission records state
  const [clientROI, setClientROI] = useState([]);
  const [agentCommissions, setAgentCommissions] = useState([]);

  // Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [recipientType, setRecipientType] = useState('client'); // 'client' | 'agent'
  
  // Form fields
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [commissionType, setCommissionType] = useState('Monthly');
  const [relatedClientId, setRelatedClientId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [transactionRef, setTransactionRef] = useState('');
  const [payoutDate, setPayoutDate] = useState(new Date().toISOString().split('T')[0]);

  // Load from local storage or defaults on mount
  useEffect(() => {
    const localROI = localStorage.getItem('kfpl_client_roi');
    const localComm = localStorage.getItem('kfpl_agent_commissions');

    if (localROI) {
      setClientROI(JSON.parse(localROI));
    } else {
      // Flatten defaults from mockData investors
      const initialROI = investors.flatMap(inv =>
        inv.roiHistory.map(roi => ({
          ...roi,
          investorName: inv.name,
          clientId: inv.clientId,
          investorId: inv.id,
          roiPercentage: inv.roiPercentage,
          paymentMode: 'Bank Transfer',
          transactionRef: `TXN-ROI-${roi.id}`
        }))
      );
      setClientROI(initialROI);
      localStorage.setItem('kfpl_client_roi', JSON.stringify(initialROI));
    }

    if (localComm) {
      setAgentCommissions(JSON.parse(localComm));
    } else {
      // Flatten defaults from mockData agents
      const initialComm = agents.flatMap(agt =>
        agt.commissionHistory.map(comm => ({
          ...comm,
          agentName: agt.name,
          agentId: agt.agentId,
          idInternal: agt.id,
          paymentMode: 'Bank Transfer',
          transactionRef: `TXN-COMM-${comm.id}`
        }))
      );
      setAgentCommissions(initialComm);
      localStorage.setItem('kfpl_agent_commissions', JSON.stringify(initialComm));
    }
  }, []);

  const handleRecipientTypeChange = (type) => {
    setRecipientType(type);
    setSelectedClientId('');
    setSelectedAgentId('');
    setCommissionType('Monthly');
    setRelatedClientId('');
    setAmountPaid('');
    setTransactionRef('');
  };

  const handleClientChange = (id) => {
    setSelectedClientId(id);
    const client = investors.find(c => String(c.id) === String(id));
    if (client) {
      // Monthly ROI = (totalInvestment * roiPercentage) / 100 / 12
      const monthlyReturn = Math.round((client.totalInvestment * (client.roiPercentage || 12)) / 1200);
      setAmountPaid(monthlyReturn);
    } else {
      setAmountPaid('');
    }
  };

  const handleAgentChange = (id) => {
    setSelectedAgentId(id);
    setAmountPaid('');
  };

  const handleMarkPaid = (roiId, type = 'client') => {
    if (type === 'client') {
      const updated = clientROI.map(r => {
        if (r.id === roiId) {
          addToast(`ROI payout for ${r.investorName} marked as paid`, 'success', 'ROI Paid');
          return { ...r, status: 'paid', paidAt: new Date().toISOString().split('T')[0] };
        }
        return r;
      });
      setClientROI(updated);
      localStorage.setItem('kfpl_client_roi', JSON.stringify(updated));
    } else {
      const updated = agentCommissions.map(c => {
        if (c.id === roiId) {
          addToast(`Commission payout for ${c.agentName} marked as paid`, 'success', 'Commission Paid');
          return { ...c, status: 'paid', paidAt: new Date().toISOString().split('T')[0] };
        }
        return c;
      });
      setAgentCommissions(updated);
      localStorage.setItem('kfpl_agent_commissions', JSON.stringify(updated));
    }
  };

  const handleRecordPayout = () => {
    // Validation
    const amt = parseFloat(amountPaid);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid payout amount.');
      return;
    }
    if (!paymentMode) {
      alert('Please select a payment mode.');
      return;
    }
    if (!transactionRef.trim()) {
      alert('Please enter a transaction reference.');
      return;
    }

    // Uniqueness check for Transaction Reference
    const isClientRefUsed = clientROI.some(r => r.transactionRef?.toUpperCase() === transactionRef.trim().toUpperCase());
    const isAgentRefUsed = agentCommissions.some(c => c.transactionRef?.toUpperCase() === transactionRef.trim().toUpperCase());

    if (isClientRefUsed || isAgentRefUsed) {
      alert('Transaction reference must be unique. This reference has already been used.');
      return;
    }

    if (recipientType === 'client') {
      if (!selectedClientId) {
        alert('Please select a client.');
        return;
      }
      const client = investors.find(c => String(c.id) === String(selectedClientId));
      const newRecord = {
        id: Date.now(),
        investorId: client.id,
        investorName: client.name,
        clientId: client.clientId,
        roiPercentage: client.roiPercentage,
        month: new Date(payoutDate).toLocaleString('default', { month: 'short', year: 'numeric' }),
        amount: amt,
        status: 'paid',
        paidAt: payoutDate,
        paymentMode,
        transactionRef: transactionRef.trim()
      };
      const updated = [newRecord, ...clientROI];
      setClientROI(updated);
      localStorage.setItem('kfpl_client_roi', JSON.stringify(updated));
      addToast('Client ROI payout recorded successfully!', 'success', 'Payout Recorded');
    } else {
      if (!selectedAgentId) {
        alert('Please select an agent.');
        return;
      }
      const agent = agents.find(a => String(a.id) === String(selectedAgentId) || a.agentId === selectedAgentId);
      const client = investors.find(c => String(c.id) === String(relatedClientId));
      
      const newRecord = {
        id: Date.now(),
        agentName: agent.name,
        agentId: agent.agentId,
        idInternal: agent.id,
        type: commissionType.toLowerCase(),
        month: new Date(payoutDate).toLocaleString('default', { month: 'short', year: 'numeric' }),
        amount: amt,
        status: 'paid',
        paidAt: payoutDate,
        paymentMode,
        transactionRef: transactionRef.trim(),
        remarks: client ? `Related to client: ${client.name} (${client.clientId})` : ''
      };
      const updated = [newRecord, ...agentCommissions];
      setAgentCommissions(updated);
      localStorage.setItem('kfpl_agent_commissions', JSON.stringify(updated));
      addToast('Agent commission payout recorded successfully!', 'success', 'Payout Recorded');
    }

    setShowPayoutModal(false);
    // Reset form
    setSelectedClientId('');
    setSelectedAgentId('');
    setRelatedClientId('');
    setAmountPaid('');
    setTransactionRef('');
  };

  // Combine lists for unified viewing
  const unifiedRecords = [
    ...clientROI.map(r => ({
      ...r,
      recordType: 'Client',
      name: r.investorName,
      subText: r.clientId,
      payoutDetail: `ROI (${r.roiPercentage}%)`
    })),
    ...agentCommissions.map(c => ({
      ...c,
      recordType: 'Agent',
      name: c.agentName,
      subText: c.agentId,
      payoutDetail: `Comm (${c.type})`
    }))
  ].sort((a, b) => b.id - a.id);

  const filteredRecords = unifiedRecords.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const haystack = [
        r.name, r.subText, r.month, r.payoutDetail,
        r.paymentMode, r.transactionRef
      ].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="kfpl-page animate-fade-slide-up">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Complete Transaction Details</h2>
          <p className="kfpl-page-subtitle">Track and record ROI returns and agent commission payouts</p>
        </div>
        <div className="kfpl-page-header-actions">
          <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" onClick={() => setShowPayoutModal(true)}>
            + Record Payout
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="kfpl-filter-chips" style={{ marginBottom: '20px' }}>
        {['all', 'paid', 'pending'].map(f => (
          <span
            key={f}
            className={`kfpl-filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && ` (${unifiedRecords.filter(r => r.status === f).length})`}
          </span>
        ))}
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--color-text-muted)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="kfpl-input"
            placeholder="Search by name, ID, month, reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="kfpl-table-container">
        <div className="kfpl-table-scroll">
          <table className="kfpl-table">
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Type</th>
                <th>Month / Period</th>
                <th>Payout Detail</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th>Payment Mode / Ref</th>
                <th>Status</th>
                <th>Paid At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>No records found</td></tr>
              ) : filteredRecords.map(rec => (
                <tr key={`${rec.recordType}-${rec.id}`}>
                  <td>
                    <div className="kfpl-table-cell-primary">{rec.name}</div>
                    <div className="kfpl-table-cell-secondary">{rec.subText}</div>
                  </td>
                  <td>
                    <Badge status={rec.recordType === 'Client' ? 'silver' : 'gold'}>
                      {rec.recordType}
                    </Badge>
                  </td>
                  <td>{rec.month}</td>
                  <td>{rec.payoutDetail}</td>
                  <td className="font-semibold" style={{ textAlign: 'right' }}>{formatCurrency(rec.amount)}</td>
                  <td>
                    {rec.paymentMode ? (
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{rec.paymentMode}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{rec.transactionRef || '—'}</div>
                      </div>
                    ) : '—'}
                  </td>
                  <td><Badge status={rec.status}>{rec.status}</Badge></td>
                  <td>{rec.paidAt || '—'}</td>
                  <td>
                    {rec.status === 'pending' && (
                      <button
                        className="kfpl-btn kfpl-btn--success kfpl-btn--sm"
                        onClick={() => handleMarkPaid(rec.id, rec.recordType.toLowerCase())}
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payout Modal */}
      <Modal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        title="Record Payout Details"
        footer={
          <>
            <button className="kfpl-btn kfpl-btn--ghost" onClick={() => setShowPayoutModal(false)}>Cancel</button>
            <button className="kfpl-btn kfpl-btn--primary" onClick={handleRecordPayout}>Submit Payout</button>
          </>
        }
      >
        <div className="kfpl-form" style={{ gap: '16px' }}>
          
          {/* Recipient Type */}
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Recipient Type <span className="required">*</span></label>
            <select
              className="kfpl-select"
              value={recipientType}
              onChange={(e) => handleRecipientTypeChange(e.target.value)}
            >
              <option value="client">Client Return (ROI)</option>
              <option value="agent">Agent Commission</option>
            </select>
          </div>

          {/* Conditional Fields: CLIENT */}
          {recipientType === 'client' && (
            <>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Select Client <span className="required">*</span></label>
                <select
                  className="kfpl-select"
                  value={selectedClientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                >
                  <option value="">Choose client</option>
                  {investors.filter(i => i.status === 'active').map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.name} ({inv.clientId})</option>
                  ))}
                </select>
              </div>

              {selectedClientId && (
                (() => {
                  const client = investors.find(c => String(c.id) === String(selectedClientId));
                  return client ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--color-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Investment Amount</span>
                        <strong style={{ fontSize: '0.875rem' }}>{formatCurrency(client.totalInvestment)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Allocated ROI %</span>
                        <strong style={{ fontSize: '0.875rem' }}>{client.roiPercentage || 12}%</strong>
                      </div>
                    </div>
                  ) : null;
                })()
              )}
            </>
          )}

          {/* Conditional Fields: AGENT */}
          {recipientType === 'agent' && (
            <>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Select Agent <span className="required">*</span></label>
                <select
                  className="kfpl-select"
                  value={selectedAgentId}
                  onChange={(e) => handleAgentChange(e.target.value)}
                >
                  <option value="">Choose agent</option>
                  {agents.filter(a => a.status === 'active').map(agt => (
                    <option key={agt.id} value={agt.id}>{agt.name} ({agt.agentId})</option>
                  ))}
                </select>
              </div>

              {selectedAgentId && (
                <div className="kfpl-form-row">
                  <div className="kfpl-input-group">
                    <label className="kfpl-input-label">Commission Type <span className="required">*</span></label>
                    <select
                      className="kfpl-select"
                      value={commissionType}
                      onChange={(e) => setCommissionType(e.target.value)}
                    >
                      <option value="Monthly">Monthly Recurring</option>
                      <option value="One-Time">One-Time Onboarding</option>
                      <option value="Special">Special Override</option>
                    </select>
                  </div>
                  <div className="kfpl-input-group">
                    <label className="kfpl-input-label">Related Client <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>(Optional)</span></label>
                    <select
                      className="kfpl-select"
                      value={relatedClientId}
                      onChange={(e) => setRelatedClientId(e.target.value)}
                    >
                      <option value="">Choose client</option>
                      {investors.map(inv => (
                        <option key={inv.id} value={inv.id}>{inv.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Common Payment Fields */}
          <div className="kfpl-form-row">
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Amount Paid (₹) <span className="required">*</span></label>
              <input
                type="number"
                className="kfpl-input"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="Enter payout amount"
                required
              />
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Payout Date <span className="required">*</span></label>
              <input
                type="date"
                className="kfpl-input"
                value={payoutDate}
                onChange={(e) => setPayoutDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="kfpl-form-row">
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Payment Mode <span className="required">*</span></label>
              <select
                className="kfpl-select"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                required
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Transaction Reference ID <span className="required">*</span></label>
              <input
                type="text"
                className="kfpl-input"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. TXN10293847"
                required
              />
            </div>
          </div>

        </div>
      </Modal>
    </div>
  );
}

/* ============ END: ROIList.jsx ============ */
