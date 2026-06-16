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

  const agentClients = investors.filter(inv => agent.clients.includes(inv.id));

  const tabs = ['profile', 'clients', 'commission'];

  return (
    <div className="kfpl-page">
      <div className="kfpl-detail-header">
        <div className="kfpl-detail-profile">
          <div className="kfpl-detail-avatar">{agent.name.split(' ').map(n => n[0]).join('')}</div>
          <div>
            <h2 className="kfpl-detail-name">{agent.name}</h2>
            <div className="kfpl-detail-id">{agent.agentId}</div>
            <div className="kfpl-detail-meta">
              <Badge status={agent.status}>{agent.status}</Badge>
            </div>
          </div>
        </div>
        <div className="kfpl-detail-actions">
          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => navigate('/agents')}>← Back</button>
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
                <tr><th>Client</th><th>Client ID</th><th>Investment</th><th>Category</th><th>Status</th></tr>
              </thead>
              <tbody>
                {agentClients.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>No clients found</td></tr>
                ) : agentClients.map(client => (
                  <tr key={client.id} onClick={() => navigate(`/investors/${client.id}`)}>
                    <td className="kfpl-table-cell-primary">{client.name}</td>
                    <td>{client.clientId}</td>
                    <td className="font-semibold">{formatCurrency(client.totalInvestment)}</td>
                    <td><Badge status={client.category}>{client.category}</Badge></td>
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
