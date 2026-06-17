/* ============================================================
   Page: AgentClientsView.jsx
   Description: Lists clients pre-filtered by specific agent
   ============================================================ */

import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { investors, agents, formatCurrency } from '../../data/mockData';

export default function AgentClientsView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Find agent in database/mock to get the latest info
  const agent = agents.find(a => String(a.id) === String(id));
  const agentName = agent?.name || location.state?.agentName || 'Agent';
  const clientIds = agent?.clients || [];

  // Filter global investors list
  const agentClients = investors.filter(inv => clientIds.includes(inv.id));

  const columns = [
    {
      header: 'Client',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="kfpl-table-cell-primary">{row.name}</div>
          <div className="kfpl-table-cell-secondary">{row.email}</div>
        </div>
      ),
    },
    { header: 'Client ID', accessor: 'clientId' },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <Badge status={row.category}>{row.category}</Badge>,
    },
    {
      header: 'Total Investment',
      accessor: 'totalInvestment',
      render: (row) => <span className="font-semibold">{formatCurrency(row.totalInvestment)}</span>,
    },
    {
      header: 'ROI %',
      accessor: 'roiPercentage',
      render: (row) => `${row.roiPercentage}%`,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Join Date',
      accessor: 'joinDate',
    },
  ];

  return (
    <div className="kfpl-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <div className="kfpl-header-breadcrumb" style={{ cursor: 'pointer', marginBottom: '8px' }} onClick={() => navigate('/agents')}>
            <span>Agents</span> / {agentName} / Clients
          </div>
          <h2 className="kfpl-page-title">Clients of {agentName}</h2>
          <p className="kfpl-page-subtitle">Clients brought to the platform by {agentName}</p>
        </div>
        <div className="kfpl-page-header-actions">
          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => navigate('/agents')}>
            Back to Agents
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={agentClients}
        onRowClick={(row) => navigate(`/investors/${row.id}`)}
        searchPlaceholder="Search clients..."
      />
    </div>
  );
}

/* ============ END: AgentClientsView.jsx ============ */
