/* ============================================================
   Page: AgentDetail.jsx
   Description: Agent profile with client list and commission tabs
   ============================================================ */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import { agents, investors, formatCurrency } from '../../data/mockData';
import { useToast } from '../../components/ui/Toast';

export default function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  const agent = agents.find(a => a.id === Number(id));

  const [localStatus, setLocalStatus] = useState(agent ? agent.status : 'active');

  if (!agent) {
    return (
      <div className="kfpl-page">
        <div className="kfpl-empty">
          <div className="kfpl-empty-title">Agent not found</div>
          <button className="kfpl-btn kfpl-btn--primary mt-4" onClick={() => navigate('/agents')}>Back to List</button>
        </div>
      </div>
    );
  }

  const handleBlockAgent = () => {
    const newStatus = localStatus === 'suspended' ? 'active' : 'suspended';
    agent.status = newStatus;
    setLocalStatus(newStatus);
    addToast(`Agent status set to ${newStatus.toUpperCase()}`, 'info', 'Status Changed');
  };

  const handleHoldAgent = () => {
    const newStatus = localStatus === 'inactive' ? 'active' : 'inactive';
    agent.status = newStatus;
    setLocalStatus(newStatus);
    addToast(`Agent status set to ${newStatus.toUpperCase()}`, 'info', 'Status Changed');
  };

  const handleDeleteAgent = () => {
    if (window.confirm(`Are you sure you want to completely delete agent profile "${agent.name}"?`)) {
      const idx = agents.findIndex(a => a.id === agent.id);
      if (idx !== -1) {
        agents.splice(idx, 1);
      }
      addToast('Agent profile deleted successfully!', 'success', 'Agent Deleted');
      navigate('/agents');
    }
  };

  const agentClients = investors.filter(inv => agent.clients.includes(inv.id));

  const tabs = ['profile', 'clients', 'commission'];

  return (
    <div className="kfpl-page">
      <div className="kfpl-detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div className="kfpl-detail-profile">
          <div className="kfpl-detail-avatar">{agent.name.split(' ').map(n => n[0]).join('')}</div>
          <div>
            <h2 className="kfpl-detail-name">{agent.name}</h2>
            <div className="kfpl-detail-id">{agent.agentId}</div>
            <div className="kfpl-detail-meta">
              <Badge status={localStatus}>{localStatus}</Badge>
            </div>
          </div>
        </div>
        <div className="kfpl-detail-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => navigate('/agents')}>← Back</button>
          <button type="button" className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ color: 'var(--color-navy)', borderColor: 'var(--color-border)', background: localStatus === 'suspended' ? '#EF4444' : 'var(--color-surface)', color: localStatus === 'suspended' ? 'var(--color-white)' : 'var(--color-text-primary)' }} onClick={handleBlockAgent}>
            {localStatus === 'suspended' ? 'Unblock Agent' : 'Block Agent'}
          </button>
          <button type="button" className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ color: 'var(--color-navy)', borderColor: 'var(--color-border)', background: localStatus === 'inactive' ? '#F59E0B' : 'var(--color-surface)', color: localStatus === 'inactive' ? 'var(--color-white)' : 'var(--color-text-primary)' }} onClick={handleHoldAgent}>
            {localStatus === 'inactive' ? 'Resume Agent' : 'Hold Agent'}
          </button>
          <button type="button" className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ color: '#EF4444', borderColor: '#EF4444', background: 'rgba(239, 68, 68, 0.05)' }} onClick={handleDeleteAgent}>
            Delete Agent
          </button>
          <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" onClick={() => navigate(`/agents/${id}/edit`)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
        </div>
      </div>

      <div className="kfpl-tabs">
        {tabs.map(tab => (
          <div key={tab} className={`kfpl-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="kfpl-detail-grid">
          <div className="kfpl-detail-info-card">
            <div className="kfpl-detail-info-title">Agent Information</div>
            <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Full Name</span><span className="kfpl-detail-info-value">{agent.name}</span></div>
            <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Email</span><span className="kfpl-detail-info-value">{agent.email}</span></div>
            <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Phone</span><span className="kfpl-detail-info-value">{agent.phone}</span></div>
            <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">PAN</span><span className="kfpl-detail-info-value">{agent.pan}</span></div>
            <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Join Date</span><span className="kfpl-detail-info-value">{agent.joinDate}</span></div>
            <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Total Clients</span><span className="kfpl-detail-info-value">{agent.totalClients}</span></div>
            <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Total Investment</span><span className="kfpl-detail-info-value" style={{ color: 'var(--color-gold-dark)', fontWeight: 700 }}>{formatCurrency(agent.totalInvestment)}</span></div>
          </div>
          <div className="kfpl-detail-info-card">
            <div className="kfpl-detail-info-title">Bank & Commission</div>
            <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Bank</span><span className="kfpl-detail-info-value">{agent.bankName}</span></div>
            <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Account No.</span><span className="kfpl-detail-info-value">{agent.accountNo}</span></div>
            <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">IFSC</span><span className="kfpl-detail-info-value">{agent.ifsc}</span></div>
            <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">One-Time %</span><span className="kfpl-detail-info-value">{agent.commissionOneTime}%</span></div>
            <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Monthly Slab %</span><span className="kfpl-detail-info-value">{agent.commissionMonthly}%</span></div>
            <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Special %</span><span className="kfpl-detail-info-value">{agent.commissionSpecial}%</span></div>
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="kfpl-table-container">
          <div className="kfpl-table-scroll">
            <table className="kfpl-table">
              <thead>
                <tr>
                  <th>Client ID</th>
                  <th>Date of Joining</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th style={{ textAlign: 'right' }}>Total Investment</th>
                  <th style={{ textAlign: 'right' }}>ROI %</th>
                  <th style={{ textAlign: 'right' }}>Commission Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {agentClients.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>No clients found</td></tr>
                ) : agentClients.map(client => (
                  <tr key={client.id} onClick={() => navigate(`/investors/${client.id}`)} style={{ cursor: 'pointer' }}>
                    <td>{client.clientId}</td>
                    <td>{client.joinDate}</td>
                    <td className="kfpl-table-cell-primary">{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td className="font-semibold" style={{ textAlign: 'right' }}>{formatCurrency(client.totalInvestment)}</td>
                    <td style={{ textAlign: 'right' }}>{client.roiPercentage || 12}%</td>
                    <td className="font-semibold" style={{ textAlign: 'right', color: 'var(--color-success)' }}>
                      {formatCurrency(client.totalInvestment * ((agent.commissionOneTime || 2) / 100))}
                    </td>
                    <td><Badge status={client.status}>{client.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'commission' && (
        <div className="kfpl-table-container">
          <div className="kfpl-table-scroll">
            <table className="kfpl-table">
              <thead>
                <tr><th>Period</th><th>Type</th><th>Amount</th><th>Status</th><th>Paid At</th><th>Action</th></tr>
              </thead>
              <tbody>
                {agent.commissionHistory.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>No commission records</td></tr>
                ) : agent.commissionHistory.map(com => (
                  <tr key={com.id}>
                    <td className="kfpl-table-cell-primary">{com.month}</td>
                    <td><Badge status={com.type === 'one-time' ? 'gold' : 'active'}>{com.type}</Badge></td>
                    <td className="font-semibold">{formatCurrency(com.amount)}</td>
                    <td><Badge status={com.status}>{com.status}</Badge></td>
                    <td>{com.paidAt || '—'}</td>
                    <td>
                      {com.status === 'pending' && (
                        <button className="kfpl-btn kfpl-btn--success kfpl-btn--sm" onClick={() => addToast(`Commission marked as paid`, 'success', 'Commission Paid')}>
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
      )}
    </div>
  );
}

/* ============ END: AgentDetail.jsx ============ */
