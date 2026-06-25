/* ============================================================
   Page: ClientPortalMock.jsx
   Description: Client Portal Accounts & Credentials Listing
   ============================================================ */

import { useState } from 'react';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { investors } from '../../data/mockData';

export default function ClientPortalMock() {
  const addToast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [residencyFilter, setResidencyFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredInvestors = investors.filter(inv => {
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const email = (inv.portalEmail || inv.email || '').toLowerCase();
      const name = (inv.name || '').toLowerCase();
      const id = (inv.clientId || '').toLowerCase();
      if (!email.includes(q) && !name.includes(q) && !id.includes(q)) return false;
    }

    if (residencyFilter !== 'all') {
      const isInt = residencyFilter === 'international';
      const actualInt = inv.citizenship === 'International';
      if (isInt !== actualInt) return false;
    }

    if (tierFilter !== 'all') {
      if ((inv.category || 'silver').toLowerCase() !== tierFilter.toLowerCase()) return false;
    }

    if (statusFilter !== 'all') {
      if (inv.status !== statusFilter) return false;
    }

    return true;
  });

  const copyPassword = (email, password) => {
    const text = `Email: ${email}\nPassword: ${password}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => addToast('Credentials copied to clipboard!', 'success', 'Copied'))
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      addToast('Credentials copied to clipboard!', 'success', 'Copied');
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textarea);
  };

  return (
    <div className="kfpl-page">
      {/* Page Header */}
      <div className="kfpl-page-header" style={{ marginBottom: '20px' }}>
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">
            Client Portal Hub
            <span style={{ 
              background: 'var(--color-gold-glow)', 
              color: 'var(--color-gold)', 
              fontSize: '0.75rem', 
              fontWeight: '600',
              padding: '4px 10px', 
              borderRadius: '20px',
              marginLeft: '12px',
              border: '1px solid var(--color-gold)'
            }}>
              PORTAL CONFIG
            </span>
          </h2>
          <p className="kfpl-page-subtitle">Manage and copy client portal access credentials</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div className="kfpl-search" style={{ maxWidth: '400px', flex: 1, marginBottom: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="kfpl-search-icon">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by client ID, name, or email ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          value={residencyFilter}
          onChange={e => setResidencyFilter(e.target.value)}
          className="kfpl-select"
          style={{ width: '160px', padding: '8px 12px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <option value="all">All Residency</option>
          <option value="national">National</option>
          <option value="international">International</option>
        </select>

        <select
          value={tierFilter}
          onChange={e => setTierFilter(e.target.value)}
          className="kfpl-select"
          style={{ width: '150px', padding: '8px 12px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <option value="all">All Tiers</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
          <option value="diamond">Diamond</option>
          <option value="platinum">Platinum</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="kfpl-select"
          style={{ width: '140px', padding: '8px 12px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Credentials Table */}
      <div className="kfpl-table-container">
        <div className="kfpl-table-toolbar">
          <div className="kfpl-table-toolbar-left">
            <span className="kfpl-table-count">
              {searchQuery.trim() || residencyFilter !== 'all' || tierFilter !== 'all' || statusFilter !== 'all' ? (
                <>Showing <strong>{filteredInvestors.length}</strong> of <strong>{investors.length}</strong> clients</>
              ) : (
                <>Showing Portal Login Credentials for <strong>{investors.length}</strong> clients</>
              )}
            </span>
          </div>
        </div>
        <div className="kfpl-table-scroll">
          <table className="kfpl-table">
            <thead>
              <tr>
                <th>Client ID</th>
                <th>Client Name</th>
                <th>Portal Login ID (Email)</th>
                <th>Portal Password</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvestors.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                    No portal credentials found matching your search.
                  </td>
                </tr>
              ) : filteredInvestors.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600 }}>{inv.clientId}</td>
                  <td style={{ fontWeight: 600 }}>{inv.name}</td>
                  <td><span style={{ fontFamily: 'monospace' }}>{inv.portalEmail || inv.email}</span></td>
                  <td><span style={{ fontFamily: 'monospace', color: 'var(--color-navy-hover)', fontWeight: '600' }}>{inv.portalPassword || 'kfpl@123'}</span></td>
                  <td><Badge status={inv.status}>{inv.status}</Badge></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                        onClick={() => copyPassword(inv.portalEmail || inv.email, inv.portalPassword || 'kfpl@123')}
                        style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                      >
                        Copy Credentials
                      </button>
                    </div>
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

/* ============ END: ClientPortalMock.jsx ============ */
