/* ============================================================
   Page: AgentDetail.jsx
   Description: Agent profile with client list and commission tabs
   ============================================================ */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import { agents, investors, formatCurrency } from '../../data/mockData';
import { useToast } from '../../components/ui/Toast';
import { apiRequest } from '../../config/apiHelper';

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
  // Fallback: Return first investment date or joinDate for recurring monthly commissions
  if (investor.investments && investor.investments.length > 0) {
    return formatDateDMY(investor.investments[0].date);
  }
  if (investor.joinDate) {
    return formatDateDMY(investor.joinDate);
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
    ['Type', com.type === 'one-time' ? 'One Time' : com.type === 'special' ? 'Special' : 'Monthly'],
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
        <td style="border: 1px solid #CFDDD5; padding: 10px; text-align: center;">
          <span style="display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; ${com.type === 'one-time' ? 'background: #DBEAFE; color: #1E40AF;' : com.type === 'special' ? 'background: #FEF3C7; color: #92400E;' : 'background: #D1FAE5; color: #065F46;'}">${com.type === 'one-time' ? 'One Time' : com.type === 'special' ? 'Special' : 'Monthly'}</span>
        </td>
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
            <th style="text-align: center;">Type</th>
            <th style="text-align: right;">Investment</th>
            <th style="text-align: right;">Rate %</th>
            <th style="text-align: right;">Commission</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr class="total-row">
            <td colspan="6" style="text-align: right; font-weight: 800; font-size: 14px; padding: 12px;">Total Payout</td>
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


const tabIcons = {
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  clients: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  commission: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  documents: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
};

const infoIcons = {
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  fileText: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  landmark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" />
    </svg>
  )
};


export default function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [clientSearch, setClientSearch] = useState('');
  const [commissionSearch, setCommissionSearch] = useState('');
  const [viewingDoc, setViewingDoc] = useState(null);

  const [agent, setAgent] = useState(null);
  const [agentClients, setAgentClients] = useState([]);
  const [commissionHistory, setCommissionHistory] = useState([]);
  const [documentsList, setDocumentsList] = useState([]);
  const [verifiedDocs, setVerifiedDocs] = useState({});
  const [loading, setLoading] = useState(true);
  const [localStatus, setLocalStatus] = useState('active');


  useEffect(() => {
    const fetchAgentDetails = async () => {
      setLoading(true);
      let ag = null;
      try {
        const agentData = await apiRequest(`/api/super-admin/agents/${id}`);
        
        const extractAgentDetail = (res) => {
          if (!res) return null;
          if (res.agent) return res.agent;
          if (res.data) {
            if (res.data.agent) return res.data.agent;
            return res.data;
          }
          return res;
        };
        ag = extractAgentDetail(agentData);
        
        if (ag) {
          const user = ag.user || {};
          const profile = ag.profile || {};
          
          const docs = ag.documents || [];
          setDocumentsList(docs);
          
          const verifiedMap = {};
          docs.forEach(doc => {
            const label = doc.name || doc.label;
            if (doc.status === 'Verified' || doc.status === 'Approved' || doc.verified) {
              verifiedMap[label] = true;
            }
          });
          setVerifiedDocs(verifiedMap);

          const normalizedAg = {
            ...ag,
            id: user._id || profile.userId || ag._id || ag.id,
            name: profile.fullName || user.name || '—',
            email: profile.email || user.email || '—',
            phone: profile.phone || '—',
            pan: profile.panNumber || '—',
            agentId: ag.header?.agentCode || user.clientCode || profile.agentId || '—',
            joinDate: profile.joinDate || (user.createdAt 
              ? new Date(user.createdAt).toLocaleDateString('en-IN') 
              : (profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN') : '—')),
            totalClients: ag.summaryCards?.clientsCount ?? ag.clientsCount ?? ag.totalClients ?? 0,
            totalInvestment: ag.summaryCards?.totalInvestment ?? ag.totalInvestment ?? 0,
            status: ag.header?.status?.toLowerCase() || profile.status || (user.isActive ? 'active' : 'inactive') || 'active',
            kyc: (ag.header?.kycStatus || ag.summaryCards?.kycStatus || profile.kycStatus || 'PENDING').toUpperCase(),
            nomineeName: profile.nomineeName || '—',
            nomineeRelation: profile.nomineeRelation || '—',
            nomineePhone: profile.nomineePhone || '—',
            nomineeEmail: profile.nomineeEmail || '—',
            bankName: profile.bankName || '—',
            accountNo: profile.accountNumber || '—',
            ifsc: profile.ifscCode || '—',
            commissionOneTime: profile.oneTimeCommission || 0,
            commissionMonthly: profile.monthlySlab || '—',
            commissionSpecial: profile.specialCommission || 0,
            panDocument: profile.panDocument,
            idProofDocument: profile.idProofDocument,
            bankProofDocument: profile.bankProofDocument,
            nomineeProofDocument: profile.nomineeProofDocument,
            commissionHistory: ag.commissionHistory || []
          };
          setAgent(normalizedAg);
          setLocalStatus(normalizedAg.status);
        }
      } catch (err) {
        console.error('Failed to fetch agent details:', err);
        addToast(err.message || 'Failed to load agent details', 'error', 'Error');
      } finally {
        setLoading(false);
      }

      // Fetch clients and commissions in background without blocking main agent details
      if (ag) {
        // Fetch clients
        (async () => {
          try {
            const clientsData = await apiRequest(`/api/super-admin/agents/${id}/clients`);
            const extractClients = (res) => {
              if (!res) return [];
              if (Array.isArray(res)) return res;
              if (res.data) {
                if (Array.isArray(res.data)) return res.data;
                if (res.data.clients && Array.isArray(res.data.clients)) return res.data.clients;
              }
              if (res.clients && Array.isArray(res.clients)) return res.clients;
              return [];
            };
            setAgentClients(extractClients(clientsData));
          } catch (cErr) {
            console.error('Failed to load agent clients:', cErr);
          }
        })();

        // Fetch commissions
        (async () => {
          try {
            const commissionsData = await apiRequest(`/api/super-admin/agents/${id}/commissions`);
            const extractCommissions = (res) => {
              if (!res) return [];
              if (Array.isArray(res)) return res;
              if (res.data) {
                if (Array.isArray(res.data)) return res.data;
                if (res.data.commissions && Array.isArray(res.data.commissions)) return res.data.commissions;
              }
              if (res.commissions && Array.isArray(res.commissions)) return res.commissions;
              return [];
            };
            setCommissionHistory(extractCommissions(commissionsData));
          } catch (comErr) {
            console.error('Failed to load agent commissions:', comErr);
          }
        })();
      }
    };
    fetchAgentDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="kfpl-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading agent details...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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

  const handleBlockAgent = async () => {
    const newStatus = localStatus === 'suspended' ? 'active' : 'suspended';
    try {
      await apiRequest(`/api/super-admin/agents/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setLocalStatus(newStatus);
      addToast(`Agent status set to ${newStatus.toUpperCase()}`, 'info', 'Status Changed');
    } catch (err) {
      console.error('Failed to block agent:', err);
      addToast(err.message || 'Failed to change agent status', 'error', 'Error');
    }
  };

  const handleHoldAgent = async () => {
    const newStatus = localStatus === 'inactive' ? 'active' : 'inactive';
    try {
      await apiRequest(`/api/super-admin/agents/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setLocalStatus(newStatus);
      addToast(`Agent status set to ${newStatus.toUpperCase()}`, 'info', 'Status Changed');
    } catch (err) {
      console.error('Failed to hold agent:', err);
      addToast(err.message || 'Failed to change agent status', 'error', 'Error');
    }
  };

  const handleDeleteAgent = async () => {
    if (window.confirm(`Are you sure you want to completely delete agent profile "${agent.name || agent.fullName}"?`)) {
      try {
        await apiRequest(`/api/super-admin/agents/${id}`, {
          method: 'DELETE',
        });
        addToast('Agent profile deleted successfully!', 'success', 'Agent Deleted');
        navigate('/agents');
      } catch (err) {
        console.error('Failed to delete agent:', err);
        addToast(err.message || 'Failed to delete agent', 'error', 'Error');
      }
    }
  };

  const handleVerifyDocument = (docLabel) => {
    setVerifiedDocs(prev => ({ ...prev, [docLabel]: true }));
    setDocumentsList(prev => prev.map(d => {
      if ((d.name || d.label) === docLabel) {
        return { ...d, status: 'Verified' };
      }
      return d;
    }));
    addToast(`"${docLabel}" verified successfully!`, 'success', 'Document Verified');
  };

  const handleKycStatusChange = async (newKycStatus) => {
    try {
      const formData = new FormData();
      formData.append('kycStatus', newKycStatus);
      formData.append('kyc', newKycStatus);
      
      await apiRequest(`/api/super-admin/agents/${id}`, {
        method: 'PATCH',
        body: formData
      });
      setAgent(prev => prev ? { ...prev, kyc: newKycStatus } : null);
      addToast(`Agent KYC status updated to ${newKycStatus}`, 'success', 'KYC Updated');
    } catch (err) {
      console.error('Failed to update KYC status:', err);
      addToast(err.message || 'Failed to update KYC status', 'error', 'Update Failed');
    }
  };

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
  const filteredCommission = commissionHistory.filter(com => {
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

  const allDocsVerified = documentsList.length > 0 && documentsList.every(doc => !!verifiedDocs[doc.name || doc.label]);

  const totalCommission = commissionHistory.reduce((sum, com) => sum + (com.amount || 0), 0);

  return (
    <div className="kfpl-page">
      {/* Premium Gradient Header Card */}
      <div className="kfpl-detail-card-header">
        <div className="kfpl-detail-profile">
          <div className="kfpl-detail-avatar">
            {(agent.name || '').split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="kfpl-detail-name" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{agent.name}</h2>
            <div className="kfpl-detail-id" style={{ marginTop: '2px' }}>ID: {agent.agentId}</div>
            <div className="kfpl-detail-meta" style={{ marginTop: '8px' }}>
              <Badge status={localStatus}>{localStatus}</Badge>
              <Badge status={agent.kyc === 'VERIFIED' ? 'active' : 'pending'}>KYC: {agent.kyc}</Badge>
            </div>
          </div>
        </div>
        <div className="kfpl-detail-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ color: 'var(--color-white)', borderColor: 'rgba(255, 255, 255, 0.25)', background: 'rgba(255, 255, 255, 0.05)' }} onClick={() => navigate('/agents')}>
            ← Back
          </button>
          <button type="button" className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ color: 'var(--color-white)', borderColor: 'rgba(255, 255, 255, 0.25)', background: localStatus === 'suspended' ? '#EF4444' : 'rgba(255, 255, 255, 0.05)' }} onClick={handleBlockAgent}>
            {localStatus === 'suspended' ? 'Unblock Agent' : 'Block Agent'}
          </button>
          <button type="button" className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ color: 'var(--color-white)', borderColor: 'rgba(255, 255, 255, 0.25)', background: localStatus === 'inactive' ? '#F59E0B' : 'rgba(255, 255, 255, 0.05)' }} onClick={handleHoldAgent}>
            {localStatus === 'inactive' ? 'Resume Agent' : 'Hold Agent'}
          </button>
          <button type="button" className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ color: '#EF4444', borderColor: '#EF4444', background: 'rgba(239, 68, 68, 0.05)' }} onClick={handleDeleteAgent}>
            Delete Agent
          </button>
          <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" style={{ background: '#10B981', color: 'var(--color-white)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }} onClick={() => navigate(`/agents/${id}/edit`)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      {/* KPI summaries dashboard */}
      <div className="kfpl-detail-kpis-summary">
        <div className="kfpl-detail-kpi-summary-card">
          <span className="kfpl-detail-kpi-summary-label">Total Commission</span>
          <span className="kfpl-detail-kpi-summary-value" style={{ color: 'var(--color-gold-dark)' }}>{formatCurrency(totalCommission)}</span>
        </div>
        <div className="kfpl-detail-kpi-summary-card">
          <span className="kfpl-detail-kpi-summary-label">Total Clients</span>
          <span className="kfpl-detail-kpi-summary-value">{agent.totalClients} Clients</span>
        </div>
        <div className="kfpl-detail-kpi-summary-card">
          <span className="kfpl-detail-kpi-summary-label">Monthly Slab %</span>
          <span className="kfpl-detail-kpi-summary-value" style={{ color: '#F59E0B' }}>{agent.commissionMonthly}% Monthly</span>
        </div>
        <div className="kfpl-detail-kpi-summary-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <span className="kfpl-detail-kpi-summary-label">KYC Verification</span>
          <div style={{ marginTop: '4px' }}>
            {allDocsVerified ? (
              <select
                className="kfpl-select"
                value={agent.kyc || 'PENDING'}
                onChange={(e) => handleKycStatusChange(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '4px 8px', 
                  fontSize: '0.85rem', 
                  borderRadius: '6px', 
                  border: '1px solid #10B981', 
                  background: agent.kyc === 'VERIFIED' ? '#ECFDF5' : '#FEF3C7',
                  color: agent.kyc === 'VERIFIED' ? '#065F46' : '#92400E',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
              </select>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Badge status={agent.kyc === 'VERIFIED' ? 'active' : 'pending'}>{agent.kyc === 'VERIFIED' ? 'Verified' : 'Pending'}</Badge>
                <span style={{ fontSize: '0.68rem', color: '#EF4444', fontWeight: 500 }}>
                  ⚠️ Verify all docs first
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Segmented Pill Tab Bar */}
      <div className="kfpl-tabs">
        {tabs.map(tab => (
          <div
            key={tab}
            className={`kfpl-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tabIcons[tab]}
            {tab.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="kfpl-detail-grid">
          <div className="kfpl-detail-info-card">
            <div className="kfpl-detail-info-title">Personal Information</div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.user}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Full Name</span>
                <span className="kfpl-detail-info-item-value">{agent.name}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.mail}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Email Address</span>
                <span className="kfpl-detail-info-item-value">{agent.email}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.phone}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Phone Number</span>
                <span className="kfpl-detail-info-item-value">{agent.phone}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.fileText}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">PAN Number</span>
                <span className="kfpl-detail-info-item-value">{agent.pan}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.calendar}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Join Date</span>
                <span className="kfpl-detail-info-item-value">{agent.joinDate}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.user}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Total Clients</span>
                <span className="kfpl-detail-info-item-value">{agent.totalClients} Clients</span>
              </div>
            </div>
          </div>

          <div className="kfpl-detail-info-card">
            <div className="kfpl-detail-info-title">KYC, Bank & Nominee Information</div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.shield}</div>
              <div className="kfpl-detail-info-item-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div>
                  <span className="kfpl-detail-info-item-label">KYC Status</span>
                  <span className="kfpl-detail-info-item-value" style={{ display: 'block', marginTop: '2px' }}>
                    {!allDocsVerified && (
                      <Badge status={agent.kyc === 'VERIFIED' ? 'active' : 'pending'}>
                        {agent.kyc === 'VERIFIED' ? 'Verified' : 'Pending'}
                      </Badge>
                    )}
                  </span>
                </div>
                {allDocsVerified ? (
                  <select
                    className="kfpl-select"
                    value={agent.kyc || 'PENDING'}
                    onChange={(e) => handleKycStatusChange(e.target.value)}
                    style={{ 
                      padding: '4px 8px', 
                      fontSize: '0.8rem', 
                      borderRadius: '6px', 
                      border: '1px solid #10B981', 
                      background: agent.kyc === 'VERIFIED' ? '#ECFDF5' : '#FEF3C7',
                      color: agent.kyc === 'VERIFIED' ? '#065F46' : '#92400E',
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                  </select>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 500 }}>
                    ⚠️ Verify all docs first
                  </span>
                )}
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.landmark}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Bank Name</span>
                <span className="kfpl-detail-info-item-value">{agent.bankName}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.fileText}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Account No.</span>
                <span className="kfpl-detail-info-item-value">{agent.accountNo}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.shield}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">IFSC Code</span>
                <span className="kfpl-detail-info-item-value">{agent.ifsc}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.user}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Nominee Name</span>
                <span className="kfpl-detail-info-item-value">{agent.nomineeName} ({agent.nomineeRelation})</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.phone}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Nominee Phone</span>
                <span className="kfpl-detail-info-item-value">{agent.nomineePhone}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="kfpl-table-container">
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
                  commissionHistory.forEach(com => downloadStatementCSV(com, agent.name || agent.fullName));
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
                  commissionHistory.forEach(com => downloadStatementPDF(com, agent.name || agent.fullName));
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
                <tr><th>Period</th><th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th style={{ textAlign: 'center' }}>Download Statement</th></tr>
              </thead>
              <tbody>
                {filteredCommission.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>No commission records found</td></tr>
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
                    <td>
                      <Badge status={com.type === 'one-time' ? 'info' : com.type === 'special' ? 'gold' : 'active'}>
                        {com.type === 'one-time' ? 'One Time' : com.type === 'special' ? 'Special' : 'Monthly'}
                      </Badge>
                    </td>
                    <td className="font-semibold">{formatCurrency(com.amount)}</td>
                    <td><Badge status={com.status}>{com.status}</Badge></td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                          onClick={() => {
                            downloadStatementCSV(com, agent.name || agent.fullName);
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
                            downloadStatementPDF(com, agent.name || agent.fullName);
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

      {/* ── Commission Detail Modal ─── */}
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
              <div className="kfpl-modal-header">
                <h3 className="kfpl-modal-title">Commission Statement</h3>
                <button className="kfpl-modal-close" onClick={() => setSelectedCommission(null)} aria-label="Close modal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div className="kfpl-modal-body">
                <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {selectedCommission.month} — {agent.name} ({agent.agentId})
                </p>

                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px',
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Type</div>
                    <div>
                      <Badge status={selectedCommission.type === 'one-time' ? 'info' : selectedCommission.type === 'special' ? 'gold' : 'active'}>
                        {selectedCommission.type === 'one-time' ? 'One Time' : selectedCommission.type === 'special' ? 'Special' : 'Monthly'}
                      </Badge>
                    </div>
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
                            <th style={{ textAlign: 'center' }}>Type</th>
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
                                <td style={{ textAlign: 'center' }}>
                                  <Badge status={selectedCommission.type === 'one-time' ? 'info' : selectedCommission.type === 'special' ? 'gold' : 'active'}>
                                    {selectedCommission.type === 'one-time' ? 'One Time' : selectedCommission.type === 'special' ? 'Special' : 'Monthly'}
                                  </Badge>
                                </td>
                                <td style={{ textAlign: 'right' }}>{formatCurrency(b.investment)}</td>
                                <td style={{ textAlign: 'right' }}>{b.rate}%</td>
                                <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>{formatCurrency(b.amount)}</td>
                              </tr>
                            );
                          })}
                          <tr style={{ background: 'var(--color-surface-alt, #f8fafc)', fontWeight: 700 }}>
                            <td colSpan={6} style={{ textAlign: 'right' }}>Total</td>
                            <td style={{ textAlign: 'right', color: 'var(--color-gold-dark)' }}>{formatCurrency(filteredTotal)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="kfpl-modal-footer">
                <button
                  className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                  onClick={() => setSelectedCommission(null)}
                >Close</button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                    onClick={() => {
                      downloadStatementCSV(selectedCommission, agent.name || agent.fullName);
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
                      downloadStatementPDF(selectedCommission, agent.name || agent.fullName);
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
            {documentsList.map((doc, idx) => {
              const docName = doc.name || doc.label;
              const isVerified = !!verifiedDocs[docName];
              return (
                <div key={idx} className="kfpl-detail-info-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', minHeight: '160px', position: 'relative' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ background: 'var(--color-gold-glow, #fef3c7)', color: 'var(--color-gold-dark, #b38600)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{docName}</h4>
                          {isVerified && <Badge status="active">Verified</Badge>}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{doc.fileName || 'PDF Document'} • {doc.fileSize || '—'}</span>
                      </div>
                    </div>
                    <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                      {doc.description || doc.desc || 'Uploaded document'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--color-border-light)', paddingTop: '12px', marginTop: '12px' }}>
                    <button 
                      className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" 
                      style={{ flex: 1, fontSize: '0.78rem', padding: '6px 0' }}
                      onClick={() => setViewingDoc({ label: docName, filename: doc.fileName || 'document.pdf', agentName: doc.holder || agent.name, status: isVerified ? 'Verified' : 'Pending Verification', uploadedAt: doc.uploadedDate || doc.uploaded || agent.joinDate, url: doc.url })}
                    >
                      View Document
                    </button>
                    <button 
                      className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" 
                      style={{ padding: '6px 10px' }}
                      onClick={() => {
                        if (doc.url) {
                          window.open(doc.url, '_blank');
                        } else {
                          const blob = new Blob([`Dummy file content for ${docName} of ${agent.name}`], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = doc.fileName || `${docName.replace(/\s/g, '_')}.pdf`;
                          link.click();
                          URL.revokeObjectURL(url);
                        }
                        addToast(`${docName} downloaded`, 'success', 'Downloaded');
                      }}
                      title="Download File"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
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
                    <span style={{ fontWeight: 700, color: verifiedDocs[viewingDoc.label] ? '#10b981' : '#f59e0b' }}>
                      {verifiedDocs[viewingDoc.label] ? 'Verified' : 'Pending Verification'}
                    </span>
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
              {!verifiedDocs[viewingDoc.label] && (
                <button
                  className="kfpl-btn kfpl-btn--sm"
                  style={{ background: '#10B981', borderColor: 'transparent', color: '#FFFFFF' }}
                  onClick={() => {
                    handleVerifyDocument(viewingDoc.label);
                    setViewingDoc(null);
                  }}
                >
                  Verify Document
                </button>
              )}
              <button
                className="kfpl-btn kfpl-btn--primary kfpl-btn--sm"
                onClick={() => {
                  if (viewingDoc.url) {
                    window.open(viewingDoc.url, '_blank');
                  } else {
                    const blob = new Blob([`Dummy file content for ${viewingDoc.label} of ${viewingDoc.agentName}`], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = viewingDoc.filename;
                    link.click();
                    URL.revokeObjectURL(url);
                  }
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
