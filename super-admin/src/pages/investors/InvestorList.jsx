/* ============================================================
   Page: InvestorList.jsx
   Description: Paginated, searchable table of all investors
   ============================================================ */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { investors, agents, formatCurrency } from '../../data/mockData';

export default function InvestorList() {
  const navigate = useNavigate();
  const [agentFilter, setAgentFilter] = useState('all');

  const getPerkTier = (amount) => {
    if (amount >= 10000000) return 'diamond';
    if (amount >= 5000000) return 'platinum';
    if (amount >= 1000000) return 'gold';
    return 'silver';
  };

  // Calculate contract end date (joinDate + longest contract period, default 24 months)
  const getContractEndDate = (row) => {
    if (row.contractEndDate) return row.contractEndDate;
    if (row.joinDate) {
      const d = new Date(row.joinDate);
      d.setMonth(d.getMonth() + 24);
      const day = String(d.getDate()).padStart(2, '0');
      const mon = String(d.getMonth() + 1).padStart(2, '0');
      return `${day}/${mon}/${d.getFullYear()}`;
    }
    return '—';
  };

  // Filter investors based on agentFilter
  const filteredInvestors = investors.filter(inv => {
    const hasAgent = agents.some(agent => agent.clients.includes(inv.id));
    if (agentFilter === 'with-agent') return hasAgent;
    if (agentFilter === 'non-agent') return !hasAgent;
    return true;
  });

  const columns = [
    { header: 'Client ID', accessor: 'clientId' },
    { header: 'Join Date', accessor: 'joinDate' },
    {
      header: 'Contract End',
      render: (row) => <span>{getContractEndDate(row)}</span>,
    },
    {
      header: 'Client Name',
      accessor: 'name',
      render: (row) => <span style={{ fontWeight: 600 }}>{row.name}</span>,
    },
    { header: 'Email Address', accessor: 'email' },
    {
      header: 'Total Investment',
      accessor: 'totalInvestment',
      render: (row) => <span className="font-semibold">{formatCurrency(row.totalInvestment)}</span>,
    },
    {
      header: 'ROI % Allocated',
      accessor: 'roiPercentage',
      render: (row) => `${row.roiPercentage}%`,
    },
    {
      header: 'Perks',
      accessor: 'totalInvestment',
      render: (row) => {
        const perk = getPerkTier(row.totalInvestment);
        return <Badge status={perk}>{perk.toUpperCase()}</Badge>;
      },
    },
    {
      header: 'Agent',
      render: (row) => {
        const agent = agents.find(a => a.clients.includes(row.id));
        return agent ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/agents/${agent.id}`);
            }}
            style={{
              background: 'none', border: 'none', padding: 0,
              fontWeight: 600, color: 'var(--color-gold-dark)',
              textDecoration: 'underline', textUnderlineOffset: '3px',
              cursor: 'pointer', fontSize: '0.875rem',
            }}
          >
            {agent.name}
          </button>
        ) : (
          <Badge status="inactive">Non Agent Client</Badge>
        );
      }
    },
    {
      header: 'Agent Commission',
      render: (row) => {
        const agent = agents.find(a => a.clients.includes(row.id));
        if (!agent) return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
        return (
          <span className="font-semibold" style={{ color: 'var(--color-success)' }}>
            {agent.commissionMonthly}% monthly
          </span>
        );
      }
    },
    {
      header: 'Risk Profile',
      render: (row) => {
        const risk = row.riskProfile || 'Conservative';
        const statusMap = {
          'Conservative': 'active', // green
          'Moderate': 'gold',       // gold
          'Aggressive': 'rejected'   // red
        };
        return <Badge status={statusMap[risk]}>{risk}</Badge>;
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
  ];

  return (
    <div className="kfpl-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Clients</h2>
          <p className="kfpl-page-subtitle">Manage all client profiles — clients are brought in by agents</p>
        </div>
        <div className="kfpl-page-header-actions">
          {/* Agent Filter Dropdown */}
          <select
            className="kfpl-select"
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            style={{ width: '180px', padding: '8px 12px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
          >
            <option value="all">All Clients</option>
            <option value="with-agent">With Agent</option>
            <option value="non-agent">Non Agent Client</option>
          </select>

          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export CSV
          </button>
          <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" onClick={() => navigate('/investors/add')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Client
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredInvestors}
        onRowClick={(row) => navigate(`/investors/${row.id}`)}
        searchPlaceholder="Search clients by name, email, ID..."
      />
    </div>
  );
}

/* ============ END: InvestorList.jsx ============ */
