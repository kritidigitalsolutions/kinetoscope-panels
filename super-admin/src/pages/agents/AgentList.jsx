/* ============================================================
   Page: AgentList.jsx
   Description: Paginated table of all agents
   ============================================================ */

import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { agents, formatCurrency } from '../../data/mockData';

export default function AgentList() {
  const navigate = useNavigate();

  const columns = [
    { header: 'Agent ID', accessor: 'agentId' },
    { header: 'Join Date', accessor: 'joinDate' },
    {
      header: 'Agent Name',
      accessor: 'name',
      render: (row) => <span style={{ fontWeight: 600 }}>{row.name}</span>,
    },
    { header: 'Email Address', accessor: 'email' },
    {
      header: 'Clients',
      accessor: 'totalClients',
      render: (row) => {
        if (row.totalClients > 0) {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent navigation to agent details page
                navigate(`/agents/${row.id}/clients`, { state: { agentName: row.name, agentId: row.agentId } });
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'var(--color-gold-dark)',
                textDecoration: 'underline',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {row.totalClients}
            </button>
          );
        }
        return <span>0</span>;
      }
    },
    {
      header: 'Total Investment',
      accessor: 'totalInvestment',
      render: (row) => <span className="font-semibold">{formatCurrency(row.totalInvestment)}</span>,
    },
    {
      header: 'Commission Paid',
      accessor: 'commissionPaidTotal',
      render: (row) => {
        const totalPaid = row.commissionHistory
          ? row.commissionHistory
              .filter(c => c.status === 'paid')
              .reduce((sum, c) => sum + c.amount, 0)
          : (row.commissionPaidTotal || 0);
        return <span className="font-semibold">{formatCurrency(totalPaid)}</span>;
      },
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
          <h2 className="kfpl-page-title">Agents</h2>
          <p className="kfpl-page-subtitle">Agents invest and bring clients — manage profiles & commissions</p>
        </div>
        <div className="kfpl-page-header-actions">
          <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" onClick={() => navigate('/agents/add')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Agent
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={agents}
        onRowClick={(row) => navigate(`/agents/${row.id}`)}
        searchPlaceholder="Search agents by name, ID..."
      />
    </div>
  );
}

/* ============ END: AgentList.jsx ============ */
