/* ============================================================
   Page: ROIList.jsx
   Description: All ROI records with filters
   ============================================================ */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import { investors, formatCurrency } from '../../data/mockData';
import { useToast } from '../../components/ui/Toast';

export default function ROIList() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [filter, setFilter] = useState('all');

  // Flatten all ROI records
  const allROI = investors.flatMap(inv =>
    inv.roiHistory.map(roi => ({
      ...roi,
      investorName: inv.name,
      clientId: inv.clientId,
      investorId: inv.id,
      roiPercentage: inv.roiPercentage,
    }))
  );

  const filteredROI = filter === 'all' ? allROI : allROI.filter(r => r.status === filter);

  return (
    <div className="kfpl-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">ROI Management</h2>
          <p className="kfpl-page-subtitle">Track and manage ROI payments for all clients & agents</p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="kfpl-filter-chips" style={{ marginBottom: '20px' }}>
        {['all', 'paid', 'pending'].map(f => (
          <span
            key={f}
            className={`kfpl-filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && ` (${allROI.filter(r => r.status === f).length})`}
          </span>
        ))}
      </div>

      <div className="kfpl-table-container">
        <div className="kfpl-table-scroll">
          <table className="kfpl-table">
            <thead>
              <tr>
                <th>Client / Agent</th>
                <th>Month</th>
                <th>ROI %</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Paid At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredROI.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>No ROI records found</td></tr>
              ) : filteredROI.map(roi => (
                <tr key={roi.id}>
                  <td>
                    <div className="kfpl-table-cell-primary">{roi.investorName}</div>
                    <div className="kfpl-table-cell-secondary">{roi.clientId}</div>
                  </td>
                  <td>{roi.month}</td>
                  <td>{roi.roiPercentage}%</td>
                  <td className="font-semibold">{formatCurrency(roi.amount)}</td>
                  <td><Badge status={roi.status}>{roi.status}</Badge></td>
                  <td>{roi.paidAt || '—'}</td>
                  <td>
                    {roi.status === 'pending' && (
                      <button
                        className="kfpl-btn kfpl-btn--success kfpl-btn--sm"
                        onClick={() => addToast(`ROI for ${roi.investorName} — ${roi.month} marked as paid`, 'success', 'ROI Paid')}
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============ END: ROIList.jsx ============ */
