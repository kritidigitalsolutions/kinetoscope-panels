/* ============================================================
   Page: InvestmentList.jsx
   Description: All investments across all clients
   ============================================================ */

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { investors, formatCurrency } from '../../data/mockData';
import { getApiUrl } from '../../config/apiUrl';
import { useToast } from '../../components/ui/Toast';

function formatDateDMY(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const mon = String(d.getMonth() + 1).padStart(2, '0');
  const yr = d.getFullYear();
  return `${day}/${mon}/${yr}`;
}

function getEndDateDMY(dateStr, periodMonths) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const months = parseInt(periodMonths, 10) || 24; // Default to 24 months
  d.setMonth(d.getMonth() + months);
  const day = String(d.getDate()).padStart(2, '0');
  const mon = String(d.getMonth() + 1).padStart(2, '0');
  const yr = d.getFullYear();
  return `${day}/${mon}/${yr}`;
}

function getEndDateYYYYMMDD(dateStr, periodMonths) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = parseInt(periodMonths, 10) || 24;
  d.setMonth(d.getMonth() + months);
  const yr = d.getFullYear();
  const mon = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mon}-${day}`;
}

export default function InvestmentList() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const [extendingInvestment, setExtendingInvestment] = useState(null);
  const [extensionEndDate, setExtensionEndDate] = useState('');

  useEffect(() => {
    const fetchInvestments = async () => {
      const authData = localStorage.getItem('kfpl_auth');
      const token = authData ? JSON.parse(authData)?.token : null;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(getApiUrl('/api/super-admin/investments'), {
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

  const handleExtendContractToDate = (investmentId, newEndDateStr) => {
    if (!newEndDateStr) return;
    const selectedEndDate = new Date(newEndDateStr);
    
    // Find the investment to get its start date
    let investment = null;
    if (investments.length > 0) {
      investment = investments.find(i => i.id === investmentId);
    } else {
      investment = mockInvestments.find(i => i.id === investmentId);
    }
    
    if (!investment) return;
    const startDate = new Date(investment.investmentDate || investment.date);
    
    const yearsDiff = selectedEndDate.getFullYear() - startDate.getFullYear();
    const monthsDiff = selectedEndDate.getMonth() - startDate.getMonth();
    const calculatedMonths = (yearsDiff * 12) + monthsDiff;
    const finalMonths = Math.max(1, calculatedMonths);

    // 1. Update in mock investors data
    for (const inv of investors) {
      const invInvestment = inv.investments.find(i => i.id === investmentId);
      if (invInvestment) {
        invInvestment.contractPeriod = finalMonths;
        break;
      }
    }

    // 2. Also update API investments state if loaded
    if (investments.length > 0) {
      setInvestments(prev => prev.map(inv => {
        if (inv.id === investmentId) {
          return { ...inv, contractPeriod: finalMonths };
        }
        return inv;
      }));
    } else {
      setRenderTrigger(prev => prev + 1);
    }

    addToast(`Contract successfully extended. New duration: ${finalMonths} Months.`, 'success', 'Contract Extended');
  };

  // Flatten mock investments for fallback
  const mockInvestments = useMemo(() => {
    return investors.flatMap(inv =>
      inv.investments.map(investment => ({
        ...investment,
        investorName: inv.name,
        clientId: inv.clientId,
        investorId: inv.id,
        investmentAmount: investment.amount,
        roiPercentage: investment.roi,
        riskPercentage: investment.risk,
        investmentDate: investment.date,
        contractPeriod: investment.contractPeriod || 24, // default 24 months
      }))
    );
  }, [renderTrigger]);

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
    { header: 'Contract Start', accessor: 'investmentDate', render: (row) => formatDateDMY(row.investmentDate || row.date) },
    {
      header: 'End Date',
      render: (row) => {
        const period = row.contractPeriod || 24;
        return (
          <div>
            <div>{getEndDateDMY(row.investmentDate || row.date, period)}</div>
            <div className="kfpl-table-cell-secondary">{period} Months</div>
          </div>
        );
      }
    },
    { header: 'Status', accessor: 'status', render: (row) => <Badge status={row.status || 'active'}>{row.status || 'active'}</Badge> },
    {
      header: 'Actions',
      render: (row) => (
        <button
          className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
          style={{ borderColor: 'var(--color-gold)', color: 'var(--color-gold-dark)', fontWeight: 600, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          onClick={(e) => {
            e.stopPropagation();
            setExtendingInvestment(row);
            const currentEndDate = getEndDateYYYYMMDD(row.investmentDate || row.date, row.contractPeriod || 24);
            setExtensionEndDate(currentEndDate);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="12" height="12">
            <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
          Extend
        </button>
      )
    }
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

      {extendingInvestment && createPortal(
        <div
          className="kfpl-modal-overlay"
          onClick={() => setExtendingInvestment(null)}
        >
          <div
            className="kfpl-modal"
            style={{ maxWidth: '440px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="kfpl-modal-header">
              <h3 className="kfpl-modal-title">Extend Contract</h3>
              <button className="kfpl-modal-close" onClick={() => setExtendingInvestment(null)} aria-label="Close modal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="kfpl-modal-body" style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                Extend contract for <strong>{extendingInvestment.investorName}</strong>'s investment in <strong>{extendingInvestment.segment}</strong>.
              </p>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Contract Start Date:</span>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                  {formatDateDMY(extendingInvestment.investmentDate || extendingInvestment.date)}
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Current End Date:</span>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                  {getEndDateDMY(extendingInvestment.investmentDate || extendingInvestment.date, extendingInvestment.contractPeriod || 24)} ({extendingInvestment.contractPeriod || 24} Months)
                </div>
              </div>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Select New End Date <span className="required">*</span></label>
                <input
                  type="date"
                  className="kfpl-input"
                  value={extensionEndDate}
                  onChange={(e) => setExtensionEndDate(e.target.value)}
                  min={getEndDateYYYYMMDD(extendingInvestment.investmentDate || extendingInvestment.date, 0)}
                  required
                />
              </div>
            </div>
            <div className="kfpl-modal-footer">
              <button
                className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                onClick={() => setExtendingInvestment(null)}
              >Cancel</button>
              <button
                className="kfpl-btn kfpl-btn--primary kfpl-btn--sm"
                onClick={() => {
                  handleExtendContractToDate(extendingInvestment.id, extensionEndDate);
                  setExtendingInvestment(null);
                }}
              >Confirm Extension</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ============ END: InvestmentList.jsx ============ */
