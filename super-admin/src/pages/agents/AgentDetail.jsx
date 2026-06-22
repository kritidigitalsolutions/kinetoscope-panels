/* ============================================================
   Page: AgentDetail.jsx
   Description: Agent profile with client list and commission tabs
   ============================================================ */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import { agents, investors, formatCurrency } from '../../data/mockData';
import { useToast } from '../../components/ui/Toast';

/* ── helpers ─────────────────────── */
function formatDateDMY(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const mon = String(d.getMonth() + 1).padStart(2, '0');
  const yr = d.getFullYear();
  return `${day}/${mon}/${yr}`;
}

function getPeriodInvestmentDate(investor, com) {
  if (!investor || !com) return '';
  const monthName = com.month.split(' ')[0];
  const monthsMap = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  let targetMonth = monthsMap[monthName];
  if (targetMonth === undefined) {
    const comDate = com.date || com.paidAt;
    if (comDate) {
      targetMonth = new Date(comDate).getMonth();
    }
  }
  if (targetMonth === undefined) return '';

  if (investor.investments && investor.investments.length > 0) {
    const matchingInv = investor.investments.find(inv => {
      const d = new Date(inv.date);
      return d.getMonth() === targetMonth;
    });
    if (matchingInv) return formatDateDMY(matchingInv.date);
  }
  if (investor.joinDate) {
    const d = new Date(investor.joinDate);
    if (d.getMonth() === targetMonth) return formatDateDMY(investor.joinDate);
  }
  return '';
}

function downloadStatementCSV(com, agentName) {
  const rows = [
    ['Commission Statement'],
    ['Agent', agentName],
    ['Period', com.month],
    ['Date', formatDateDMY(com.date || com.paidAt)],
    ['Total Amount', com.amount],
    ['Status', com.status],
    [''],
    ['Client Name', 'Client ID', 'Investment', 'Rate %', 'Commission'],
  ];
  if (com.breakdown) {
    com.breakdown.forEach(b => {
      rows.push([b.clientName, b.clientId, b.investment, b.rate, b.amount]);
    });
  }
  const csvContent = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `commission_${com.month.replace(/\s/g, '_')}_${agentName.replace(/\s/g, '_')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadStatementPDF(com, agentName) {
  const dateStr = formatDateDMY(com.date || com.paidAt);
  const filteredBreakdown = com.breakdown
    ? com.breakdown.filter(b => {
        const inv = investors.find(invObj => invObj.clientId === b.clientId);
        return inv ? getPeriodInvestmentDate(inv, com) !== '' : false;
      })
    : [];

  const filteredTotal = filteredBreakdown.reduce((sum, b) => sum + b.amount, 0);

  const rowsHtml = filteredBreakdown.map(b => {
    const inv = investors.find(invObj => invObj.clientId === b.clientId);
    const invDateStr = inv ? getPeriodInvestmentDate(inv, com) : '';
    return `
      <tr>
        <td style="border: 1px solid #CFDDD5; padding: 10px; font-weight: 500;">${b.clientName}</td>
        <td style="border: 1px solid #CFDDD5; padding: 10px; font-family: monospace;">${b.clientId}</td>
        <td style="border: 1px solid #CFDDD5; padding: 10px; text-align: center;">${invDateStr}</td>
        <td style="border: 1px solid #CFDDD5; padding: 10px; text-align: right; font-weight: 600;">${formatCurrency(b.investment)}</td>
        <td style="border: 1px solid #CFDDD5; padding: 10px; text-align: right;">${b.rate}%</td>
        <td style="border: 1px solid #CFDDD5; padding: 10px; text-align: right; font-weight: bold; color: #059669;">${formatCurrency(b.amount)}</td>
      </tr>
    `;
  }).join('');

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  printWindow.document.write(`
    <html>
    <head>
      <title>Commission Statement - ${com.month} - ${agentName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #11221A; background-color: #FFFFFF; padding: 40px; margin: 0; }
        .header { margin-bottom: 30px; border-bottom: 3px solid #10B981; padding-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
        .title { font-size: 28px; font-weight: 800; color: #061D13; margin: 0; text-transform: uppercase; letter-spacing: -0.5px; }
        .meta-info { margin-bottom: 30px; background-color: #F3F7F5; border: 1px solid #CFDDD5; border-radius: 12px; padding: 20px; }
        .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .meta-item { display: flex; justify-content: space-between; border-bottom: 1px solid #E2ECE7; padding-bottom: 6px; font-size: 14px; }
        .meta-label { font-weight: 600; color: #6D7E75; }
        .meta-val { font-weight: 700; color: #11221A; }
        .section-title { font-size: 18px; font-weight: 700; color: #061D13; margin-top: 40px; margin-bottom: 14px; border-bottom: 1.5px solid #CFDDD5; padding-bottom: 6px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        .table th { background-color: #E5ECE8; border: 1px solid #CFDDD5; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; font-weight: 800; color: #2E3E36; letter-spacing: 0.5px; }
        .table td { border: 1px solid #CFDDD5; padding: 10px 12px; color: #11221A; }
        .total-row { background-color: #F3F7F5; font-weight: bold; }
        .success { color: #059669; }
        @media print {
          body { padding: 0; }
          .print-btn-bar { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="print-btn-bar" style="display: flex; justify-content: flex-end; margin-bottom: 20px; gap: 10px;">
        <button onclick="window.print();" style="background: #059669; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 13px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);">Print / Save PDF</button>
        <button onclick="window.close();" style="background: #e2ece7; color: #2e3e36; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 13px;">Close Window</button>
      </div>

      <div class="header">
        <div>
          <div class="title">Commission Statement</div>
          <div style="font-size: 12px; color: #6D7E75; margin-top: 4px; font-weight: 500;">KINETOSCOPE CAPITAL PARTNERS LTD</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 13px; font-weight: 600; color: #2E3E36;">Date Generated:</div>
          <div style="font-size: 14px; font-weight: 700; color: #11221A;">${new Date().toLocaleDateString('en-GB')}</div>
        </div>
      </div>
      
      <div class="meta-info">
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Agent Name:</span>
            <span class="meta-val">${agentName}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Period:</span>
            <span class="meta-val">${com.month}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Payout Date:</span>
            <span class="meta-val">${dateStr}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Status:</span>
            <span class="meta-val" style="color: #059669;">${com.status.toUpperCase()}</span>
          </div>
          <div class="meta-item" style="grid-column: span 2; border-bottom: none; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #CFDDD5;">
            <span class="meta-label" style="font-size: 16px; color: #061D13;">Total Commission Payout:</span>
            <span class="meta-val" style="font-size: 20px; color: #059669;">${formatCurrency(filteredTotal)}</span>
          </div>
        </div>
      </div>
      
      <div class="section-title">Client-wise Breakdown</div>
      <table class="table">
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Client ID</th>
            <th style="text-align: center;">Investment Date</th>
            <th style="text-align: right;">Investment</th>
            <th style="text-align: right;">Rate %</th>
            <th style="text-align: right;">Commission</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr class="total-row">
            <td colspan="5" style="text-align: right; font-weight: 800; font-size: 14px; padding: 12px;">Total Payout</td>
            <td style="text-align: right; font-weight: 800; color: #059669; font-size: 14px; padding: 12px;">${formatCurrency(filteredTotal)}</td>
          </tr>
        </tbody>
      </table>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

export default function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [clientSearch, setClientSearch] = useState('');
  const [commissionSearch, setCommissionSearch] = useState('');
  const [viewingDoc, setViewingDoc] = useState(null);

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

  /* ── filtered clients ─── */
  const filteredClients = agentClients.filter(client => {
    if (!clientSearch.trim()) return true;
    const term = clientSearch.toLowerCase();
    return (
      client.name.toLowerCase().includes(term) ||
      client.clientId.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.phone.includes(term)
    );
  });

  /* ── filtered commission ─── */
  const filteredCommission = agent.commissionHistory.filter(com => {
    if (!commissionSearch.trim()) return true;
    const term = commissionSearch.toLowerCase();
    return (
      com.month.toLowerCase().includes(term) ||
      com.status.toLowerCase().includes(term) ||
      formatDateDMY(com.date || com.paidAt).includes(term) ||
      String(com.amount).includes(term)
    );
  });

  const tabs = ['profile', 'clients', 'commission', 'documents'];

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
          <button type="button" className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ borderColor: 'var(--color-border)', background: localStatus === 'suspended' ? '#EF4444' : 'var(--color-surface)', color: localStatus === 'suspended' ? 'var(--color-white)' : 'var(--color-text-primary)' }} onClick={handleBlockAgent}>
            {localStatus === 'suspended' ? 'Unblock Agent' : 'Block Agent'}
          </button>
          <button type="button" className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ borderColor: 'var(--color-border)', background: localStatus === 'inactive' ? '#F59E0B' : 'var(--color-surface)', color: localStatus === 'inactive' ? 'var(--color-white)' : 'var(--color-text-primary)' }} onClick={handleHoldAgent}>
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
            <div className="kfpl-detail-info-row"><span className="kfpl-detail-info-label">Monthly Slab %</span><span className="kfpl-detail-info-value">{agent.commissionMonthly}%</span></div>
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="kfpl-table-container">
          {/* Search bar for clients */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <div className="kfpl-search" style={{ maxWidth: '360px' }}>
              <svg className="kfpl-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search clients by name, ID, email..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
            </div>
          </div>
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
                {filteredClients.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>No clients found</td></tr>
                ) : filteredClients.map(client => (
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Commission History</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Click on any period to view detailed breakdown</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* Search bar */}
              <div className="kfpl-search" style={{ maxWidth: '260px' }}>
                <svg className="kfpl-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search commission..."
                  value={commissionSearch}
                  onChange={(e) => setCommissionSearch(e.target.value)}
                />
              </div>
              <button
                className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                onClick={() => {
                  agent.commissionHistory.forEach(com => downloadStatementCSV(com, agent.name));
                  addToast('All CSV statements downloaded', 'success', 'Download Complete');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                CSV (All)
              </button>
              <button
                className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                onClick={() => {
                  agent.commissionHistory.forEach(com => downloadStatementPDF(com, agent.name));
                  addToast('All PDF statements generated', 'success', 'Download Complete');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                PDF (All)
              </button>
            </div>
          </div>
          <div className="kfpl-table-scroll">
            <table className="kfpl-table">
              <thead>
                <tr><th>Period</th><th>Date</th><th>Amount</th><th>Status</th><th style={{ textAlign: 'center' }}>Download Statement</th></tr>
              </thead>
              <tbody>
                {filteredCommission.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>No commission records found</td></tr>
                ) : filteredCommission.map(com => (
                  <tr key={com.id}>
                    <td>
                      <button
                        onClick={() => setSelectedCommission(com)}
                        style={{
                          background: 'none', border: 'none', padding: '4px 8px',
                          borderRadius: '6px', color: 'var(--color-gold-dark)',
                          fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
                          textUnderlineOffset: '3px', fontSize: '0.875rem',
                        }}
                        title="Click to view details"
                      >
                        {com.month}
                      </button>
                    </td>
                    <td>{formatDateDMY(com.date || com.paidAt)}</td>
                    <td className="font-semibold">{formatCurrency(com.amount)}</td>
                    <td><Badge status={com.status}>{com.status}</Badge></td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                          onClick={() => {
                            downloadStatementCSV(com, agent.name);
                            addToast(`Statement CSV downloaded for ${com.month}`, 'success', 'Downloaded');
                          }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', padding: '4px 8px' }}
                          title="Download CSV"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
                          </svg>
                          CSV
                        </button>
                        <button
                          className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                          onClick={() => {
                            downloadStatementPDF(com, agent.name);
                            addToast(`Statement PDF generated for ${com.month}`, 'success', 'Downloaded');
                          }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', padding: '4px 8px' }}
                          title="Download PDF"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
                          </svg>
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Commission Detail Modal (light blur like perks) ─── */}
      {(() => {
        if (!selectedCommission) return null;
        const filteredBreakdown = selectedCommission.breakdown
          ? selectedCommission.breakdown.filter(b => {
              const inv = investors.find(invObj => invObj.clientId === b.clientId);
              return inv ? getPeriodInvestmentDate(inv, selectedCommission) !== '' : false;
            })
          : [];
        const filteredTotal = filteredBreakdown.reduce((sum, b) => sum + b.amount, 0);

        return createPortal(
          <div
            className="kfpl-modal-overlay"
            onClick={() => setSelectedCommission(null)}
          >
            <div
              className="kfpl-modal"
              style={{ maxWidth: '640px' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="kfpl-modal-header">
                <h3 className="kfpl-modal-title">Commission Statement</h3>
                <button className="kfpl-modal-close" onClick={() => setSelectedCommission(null)} aria-label="Close modal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="kfpl-modal-body">
                <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {selectedCommission.month} — {agent.name} ({agent.agentId})
                </p>

                {/* Summary Cards */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
                  marginBottom: '20px',
                }}>
                  <div style={{
                    background: 'var(--color-surface-alt, #f8fafc)', borderRadius: '12px',
                    padding: '16px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Total Amount</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-gold-dark)' }}>{formatCurrency(filteredTotal)}</div>
                  </div>
                  <div style={{
                    background: 'var(--color-surface-alt, #f8fafc)', borderRadius: '12px',
                    padding: '16px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Date</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formatDateDMY(selectedCommission.date || selectedCommission.paidAt)}</div>
                  </div>
                  <div style={{
                    background: 'var(--color-surface-alt, #f8fafc)', borderRadius: '12px',
                    padding: '16px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Status</div>
                    <div><Badge status={selectedCommission.status}>{selectedCommission.status}</Badge></div>
                  </div>
                </div>

                {/* Client Breakdown */}
                {filteredBreakdown.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 12px', color: 'var(--color-text-primary)' }}>
                      Client-wise Breakdown
                    </h4>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="kfpl-table" style={{ fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th>Client</th>
                            <th>Client ID</th>
                            <th style={{ textAlign: 'center' }}>Investment Date</th>
                            <th style={{ textAlign: 'right' }}>Investment</th>
                            <th style={{ textAlign: 'right' }}>Rate</th>
                            <th style={{ textAlign: 'right' }}>Commission</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBreakdown.map((b, i) => {
                            const inv = investors.find(invObj => invObj.clientId === b.clientId);
                            const invDateStr = inv ? getPeriodInvestmentDate(inv, selectedCommission) : '';
                            return (
                              <tr key={i}>
                                <td className="kfpl-table-cell-primary">{b.clientName}</td>
                                <td>{b.clientId}</td>
                                <td style={{ textAlign: 'center' }}>{invDateStr}</td>
                                <td style={{ textAlign: 'right' }}>{formatCurrency(b.investment)}</td>
                                <td style={{ textAlign: 'right' }}>{b.rate}%</td>
                                <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>{formatCurrency(b.amount)}</td>
                              </tr>
                            );
                          })}
                          <tr style={{ background: 'var(--color-surface-alt, #f8fafc)', fontWeight: 700 }}>
                            <td colSpan={5} style={{ textAlign: 'right' }}>Total</td>
                            <td style={{ textAlign: 'right', color: 'var(--color-gold-dark)' }}>{formatCurrency(filteredTotal)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="kfpl-modal-footer">
                <button
                  className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                  onClick={() => setSelectedCommission(null)}
                >Close</button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                    onClick={() => {
                      downloadStatementCSV(selectedCommission, agent.name);
                      addToast('Statement CSV downloaded', 'success', 'Downloaded');
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
                    </svg>
                    Download CSV
                  </button>
                  <button
                    className="kfpl-btn kfpl-btn--primary kfpl-btn--sm"
                    onClick={() => {
                      downloadStatementPDF(selectedCommission, agent.name);
                      addToast('Statement PDF generated', 'success', 'Downloaded');
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {activeTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="kfpl-page-header" style={{ marginBottom: '4px' }}>
            <div>
              <h3 className="kfpl-form-card-title" style={{ margin: 0 }}>Onboarded Documents</h3>
              <p className="kfpl-page-subtitle" style={{ margin: '2px 0 0 0' }}>KYC, bank verification, and nominee documents</p>
            </div>
          </div>

          <div className="kfpl-detail-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {[
              { id: 'pan', label: 'PAN Card Upload', desc: 'Proof of PAN Card Identification', filename: `${agent.name.replace(/\s/g, '_')}_PAN.pdf`, size: '1.1 MB' },
              { id: 'idproof', label: 'ID Proof Upload', desc: 'Proof of Identity (Aadhaar / Passport / DL)', filename: `${agent.name.replace(/\s/g, '_')}_IDProof.pdf`, size: '2.2 MB' },
              { id: 'bank', label: 'Bank Details Document', desc: 'Cancelled Cheque or Bank Statement', filename: `${agent.name.replace(/\s/g, '_')}_BankProof.pdf`, size: '1.7 MB' },
              {
                id: 'nominee',
                label: 'Nominee ID Proof',
                desc: `ID Proof for Nominee (${agent.nominee?.name || 'Assigned Nominee'})`,
                filename: `${(agent.nominee?.name || 'Nominee').replace(/\s/g, '_')}_ID.pdf`,
                size: '1.4 MB'
              }
            ].map((doc, idx) => (
              <div key={idx} className="kfpl-detail-info-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', minHeight: '160px', position: 'relative' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ background: 'var(--color-gold-glow, #fef3c7)', color: 'var(--color-gold-dark, #b38600)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{doc.label}</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>PDF Document • {doc.size}</span>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                    {doc.desc}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--color-border-light)', paddingTop: '12px', marginTop: '12px' }}>
                  <button 
                    className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" 
                    style={{ flex: 1, fontSize: '0.78rem', padding: '6px 0' }}
                    onClick={() => setViewingDoc({ ...doc, agentName: agent.name, status: 'Verified', uploadedAt: agent.joinDate || '2024-01-10' })}
                  >
                    View Document
                  </button>
                  <button 
                    className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" 
                    style={{ padding: '6px 10px' }}
                    onClick={() => {
                      const blob = new Blob([`Dummy file content for ${doc.label} of ${agent.name}`], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = doc.filename;
                      link.click();
                      URL.revokeObjectURL(url);
                      addToast(`${doc.label} downloaded`, 'success', 'Downloaded');
                    }}
                    title="Download File"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Document Viewer Modal ─── */}
      {viewingDoc && createPortal(
        <div
          className="kfpl-modal-overlay"
          onClick={() => setViewingDoc(null)}
        >
          <div
            className="kfpl-modal"
            style={{ maxWidth: '680px', width: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="kfpl-modal-header">
              <h3 className="kfpl-modal-title">{viewingDoc.label}</h3>
              <button className="kfpl-modal-close" onClick={() => setViewingDoc(null)} aria-label="Close modal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="kfpl-modal-body" style={{ background: '#f8fafc', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px' }}>
              <div style={{
                background: '#ffffff', width: '100%', maxWidth: '480px', borderRadius: '12px',
                border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)', padding: '24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, var(--color-gold) 0%, #0F766E 100%)' }} />
                
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-dark, #b38600)" strokeWidth="1.5" strokeLinecap="round" width="64" height="64" style={{ marginBottom: '16px', opacity: 0.85 }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
                
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800 }}>{viewingDoc.label}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>{viewingDoc.filename}</span>
                
                <div style={{
                  width: '100%', background: '#f1f5f9', borderRadius: '8px', border: '1px dashed #cbd5e1',
                  padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>Holder:</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{viewingDoc.agentName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>Status:</span>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>{viewingDoc.status}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>Verification:</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>Digital Signatures Valid</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>Uploaded:</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{viewingDoc.uploadedAt}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px', color: '#64748b', fontSize: '0.75rem' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span>Secured PDF Document. Download to view raw scan.</span>
                </div>
              </div>
            </div>
            <div className="kfpl-modal-footer">
              <button
                className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                onClick={() => setViewingDoc(null)}
              >Close</button>
              <button
                className="kfpl-btn kfpl-btn--primary kfpl-btn--sm"
                onClick={() => {
                  const blob = new Blob([`Dummy file content for ${viewingDoc.label} of ${viewingDoc.agentName}`], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = viewingDoc.filename;
                  link.click();
                  URL.revokeObjectURL(url);
                  addToast(`${viewingDoc.label} downloaded`, 'success', 'Downloaded');
                  setViewingDoc(null);
                }}
              >Download Original File</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ============ END: AgentDetail.jsx ============ */
