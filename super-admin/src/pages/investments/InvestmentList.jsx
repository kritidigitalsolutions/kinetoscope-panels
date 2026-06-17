/* ============================================================
   Page: InvestmentList.jsx
   Description: All investments across all clients
   ============================================================ */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { investors, formatCurrency } from '../../data/mockData';

export default function InvestmentList() {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      const authData = localStorage.getItem('kfpl_auth');
      const token = authData ? JSON.parse(authData)?.token : null;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/super-admin/investments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setInvestments(Array.isArray(data) ? data : (data.investments || []));
        }
      } catch (err) {
        console.error('Failed to fetch investments from API', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, []);

  // Flatten mock investments for fallback
  const mockInvestments = investors.flatMap(inv =>
    inv.investments.map(investment => ({
      ...investment,
      investorName: inv.name,
      clientId: inv.clientId,
      investorId: inv.id,
      investmentAmount: investment.amount,
      roiPercentage: investment.roi,
      riskPercentage: investment.risk,
      investmentDate: investment.date,
    }))
  );

  const displayData = investments.length > 0 ? investments : mockInvestments;

  const columns = [
    {
      header: 'Client',
      accessor: 'clientId',
      render: (row) => (
        <div>
          <div className="kfpl-table-cell-primary">{row.investorName || row.clientId || 'N/A'}</div>
          <div className="kfpl-table-cell-secondary">{row.clientId}</div>
        </div>
      ),
    },
    { header: 'Segment', accessor: 'segment', render: (row) => <span className="font-medium">{row.segment}</span> },
    { header: 'Amount', accessor: 'investmentAmount', render: (row) => <span className="font-semibold">{formatCurrency(row.investmentAmount || row.amount || 0)}</span> },
    { header: 'ROI %', accessor: 'roiPercentage', render: (row) => `${row.roiPercentage || row.roi || 0}%` },
    { header: 'Risk %', accessor: 'riskPercentage', render: (row) => `${row.riskPercentage || row.risk || 0}%` },
    { header: 'Date', accessor: 'investmentDate', render: (row) => row.investmentDate || row.date || 'N/A' },
    { header: 'Status', accessor: 'status', render: (row) => <Badge status={row.status || 'active'}>{row.status || 'active'}</Badge> },
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
        data={displayData}
        onRowClick={(row) => row.investorId ? navigate(`/investors/${row.investorId}`) : null}
        searchPlaceholder="Search by investor, segment..."
      />
    </div>
  );
}

/* ============ END: InvestmentList.jsx ============ */
