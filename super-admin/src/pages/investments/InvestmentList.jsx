/* ============================================================
   Page: InvestmentList.jsx
   Description: All investments across all clients
   ============================================================ */

import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { investors, formatCurrency } from '../../data/mockData';

export default function InvestmentList() {
  const navigate = useNavigate();

  // Flatten all investments from all investors
  const allInvestments = investors.flatMap(inv =>
    inv.investments.map(investment => ({
      ...investment,
      investorName: inv.name,
      clientId: inv.clientId,
      investorId: inv.id,
    }))
  );

  const columns = [
    {
      header: 'Client',
      accessor: 'investorName',
      render: (row) => (
        <div>
          <div className="kfpl-table-cell-primary">{row.investorName}</div>
          <div className="kfpl-table-cell-secondary">{row.clientId}</div>
        </div>
      ),
    },
    { header: 'Segment', accessor: 'segment', render: (row) => <span className="font-medium">{row.segment}</span> },
    { header: 'Amount', accessor: 'amount', render: (row) => <span className="font-semibold">{formatCurrency(row.amount)}</span> },
    { header: 'ROI %', accessor: 'roi', render: (row) => `${row.roi}%` },
    { header: 'Risk %', accessor: 'risk', render: (row) => `${row.risk}%` },
    { header: 'Date', accessor: 'date' },
    { header: 'Status', accessor: 'status', render: (row) => <Badge status={row.status}>{row.status}</Badge> },
  ];

  return (
    <div className="kfpl-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Investments</h2>
          <p className="kfpl-page-subtitle">All investments across all clients & agents</p>
        </div>
        <div className="kfpl-page-header-actions">
          <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" onClick={() => navigate('/investments/assign')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Assign Investment
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={allInvestments}
        onRowClick={(row) => navigate(`/investors/${row.investorId}`)}
        searchPlaceholder="Search by investor, segment..."
      />
    </div>
  );
}

/* ============ END: InvestmentList.jsx ============ */
