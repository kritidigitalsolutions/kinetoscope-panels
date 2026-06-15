/* ============================================================
   Page: InvestmentStatus.jsx
   Description: Project-wise segment-wise status updates
   ============================================================ */

import { useState } from 'react';
import Badge from '../../components/ui/Badge';
import { investors, INVESTMENT_SEGMENTS, formatCurrency } from '../../data/mockData';
import { useToast } from '../../components/ui/Toast';

const statusUpdates = [
  { id: 1, segment: 'Film Making', project: 'Project Astra', status: 'In Production', progress: 65, lastUpdate: '2025-04-10', note: 'Post-production phase begins next week' },
  { id: 2, segment: 'Distribution', project: 'Meridian Release', status: 'Active', progress: 80, lastUpdate: '2025-04-08', note: 'Distribution across 3 states confirmed' },
  { id: 3, segment: 'Music', project: 'Rhythm Series', status: 'Recording', progress: 40, lastUpdate: '2025-04-05', note: '4 tracks completed, 6 remaining' },
  { id: 4, segment: 'Trading & Syndication', project: 'Content Deal Q2', status: 'Negotiation', progress: 30, lastUpdate: '2025-04-12', note: 'Final terms under discussion' },
  { id: 5, segment: 'Content IP Bank', project: 'Archive Digitization', status: 'Ongoing', progress: 55, lastUpdate: '2025-04-09', note: '550 titles digitized so far' },
  { id: 6, segment: 'Film Exhibition', project: 'Screen Network', status: 'Planning', progress: 15, lastUpdate: '2025-04-11', note: '3 new screen locations identified' },
];

export default function InvestmentStatus() {
  const addToast = useToast();
  const [editId, setEditId] = useState(null);
  const [updateNote, setUpdateNote] = useState('');

  const handlePostUpdate = (item) => {
    addToast(`Status update posted for ${item.project}`, 'success', 'Update Posted');
    setEditId(null);
    setUpdateNote('');
  };

  return (
    <div className="kfpl-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Status of Investment</h2>
          <p className="kfpl-page-subtitle">Project-wise segment-wise investment status updates</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {statusUpdates.map(item => (
          <div className="kfpl-card" key={item.id} style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{item.project}</h4>
                  <Badge status={item.status === 'Active' || item.status === 'Ongoing' ? 'active' : 'pending'}>{item.status}</Badge>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <span className="kfpl-stat-pill">
                    <span className="kfpl-stat-pill-label">Segment:</span>
                    <span className="kfpl-stat-pill-value">{item.segment}</span>
                  </span>
                  <span className="kfpl-stat-pill">
                    <span className="kfpl-stat-pill-label">Last Update:</span>
                    <span className="kfpl-stat-pill-value">{item.lastUpdate}</span>
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>{item.note}</p>

                {/* Progress Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="kfpl-progress" style={{ flex: 1 }}>
                    <div className="kfpl-progress-fill" style={{ width: `${item.progress}%` }}></div>
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-gold-dark)', minWidth: '36px' }}>{item.progress}%</span>
                </div>
              </div>

              <button
                className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                onClick={() => { setEditId(editId === item.id ? null : item.id); setUpdateNote(''); }}
              >
                {editId === item.id ? 'Cancel' : 'Post Update'}
              </button>
            </div>

            {editId === item.id && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border-light)' }}>
                <div className="kfpl-input-group" style={{ marginBottom: '12px' }}>
                  <label className="kfpl-input-label">Status Update Message</label>
                  <textarea
                    className="kfpl-textarea"
                    value={updateNote}
                    onChange={(e) => setUpdateNote(e.target.value)}
                    placeholder="Write a status update for this project..."
                    rows="3"
                  />
                </div>
                <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" onClick={() => handlePostUpdate(item)} disabled={!updateNote.trim()}>
                  Publish Update
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ END: InvestmentStatus.jsx ============ */
