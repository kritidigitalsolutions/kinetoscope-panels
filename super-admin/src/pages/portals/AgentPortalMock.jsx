/* ============================================================
   Page: AgentPortalMock.jsx
   Description: Agent Portal Accounts & Credentials Listing
   ============================================================ */

import { useState } from 'react';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { agents } from '../../data/mockData';

export default function AgentPortalMock() {
  const addToast = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = agents.filter(agt => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const email = (agt.portalEmail || agt.email || '').toLowerCase();
    const name = (agt.name || '').toLowerCase();
    const id = (agt.agentId || '').toLowerCase();
    return email.includes(q) || name.includes(q) || id.includes(q);
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
            Agent Portal Hub
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
          <p className="kfpl-page-subtitle">Manage and copy agent portal access credentials</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="kfpl-search" style={{ marginBottom: '20px', maxWidth: '400px' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="kfpl-search-icon">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search by agent ID, name, or email ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Credentials Table */}
      <div className="kfpl-table-container">
        <div className="kfpl-table-toolbar">
          <div className="kfpl-table-toolbar-left">
            <span className="kfpl-table-count">
              {searchQuery.trim() ? (
                <>Showing <strong>{filteredAgents.length}</strong> of <strong>{agents.length}</strong> agents</>
              ) : (
                <>Showing Portal Login Credentials for <strong>{agents.length}</strong> agents</>
              )}
            </span>
          </div>
        </div>
        <div className="kfpl-table-scroll">
          <table className="kfpl-table">
            <thead>
              <tr>
                <th>Agent ID</th>
                <th>Agent Name</th>
                <th>Portal Login ID (Email)</th>
                <th>Portal Password</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                    No portal credentials found matching your search.
                  </td>
                </tr>
              ) : filteredAgents.map((agt) => (
                <tr key={agt.id}>
                  <td style={{ fontWeight: 600 }}>{agt.agentId}</td>
                  <td style={{ fontWeight: 600 }}>{agt.name}</td>
                  <td><span style={{ fontFamily: 'monospace' }}>{agt.portalEmail || agt.email}</span></td>
                  <td><span style={{ fontFamily: 'monospace', color: 'var(--color-navy-hover)', fontWeight: '600' }}>{agt.portalPassword || 'kfpl@123'}</span></td>
                  <td><Badge status={agt.status}>{agt.status}</Badge></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                        onClick={() => copyPassword(agt.portalEmail || agt.email, agt.portalPassword || 'kfpl@123')}
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

/* ============ END: AgentPortalMock.jsx ============ */
