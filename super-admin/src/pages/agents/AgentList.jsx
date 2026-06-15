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
    {
      header: 'Agent',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="kfpl-table-cell-primary">{row.name}</div>
          <div className="kfpl-table-cell-secondary">{row.email}</div>
        </div>
      ),
    },
    { header: 'Agent ID', accessor: 'agentId' },
    { header: 'Clients', accessor: 'totalClients' },
    {
      header: 'Total Investment',
      accessor: 'totalInvestment',
      render: (row) => <span className="font-semibold">{formatCurrency(row.totalInvestment)}</span>,
    },
    {
      header: 'Commission',
      accessor: 'commissionMonthly',
      render: (row) => `${row.commissionMonthly}% monthly`,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    { header: 'Join Date', accessor: 'joinDate' },
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
