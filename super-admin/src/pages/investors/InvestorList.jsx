/* ============================================================
   Page: InvestorList.jsx
   Description: Paginated, searchable table of all investors
   ============================================================ */

import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { investors, formatCurrency } from '../../data/mockData';

export default function InvestorList() {
  const navigate = useNavigate();

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
          <h2 className="kfpl-page-title">Clients</h2>
          <p className="kfpl-page-subtitle">Manage all client profiles — clients are brought in by agents</p>
        </div>
        <div className="kfpl-page-header-actions">
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
        data={investors}
        onRowClick={(row) => navigate(`/investors/${row.id}`)}
        searchPlaceholder="Search clients by name, email, ID..."
      />
    </div>
  );
}

/* ============ END: InvestorList.jsx ============ */
