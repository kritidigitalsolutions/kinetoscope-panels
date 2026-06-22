/* ============================================================
   Page: InvestmentStatus.jsx
   Description: Project-wise segment-wise status updates with full CRUD,
                segment management, and media upload capabilities.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { INVESTMENT_SEGMENTS, formatCurrency } from '../../data/mockData';
import { useToast } from '../../components/ui/Toast';

// ── Default status updates ──────────────────
const DEFAULT_STATUS_UPDATES = [
  {
    id: 1,
    segment: 'Film Making',
    project: 'Project Astra',
    status: 'In Production',
    progress: 65,
    lastUpdate: '2025-04-10',
    note: 'Post-production phase begins next week',
    media: [
      {
        id: 'mock-1',
        name: 'astra_poster.png',
        type: 'image/png',
        size: 154200,
        dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="100%" height="100%" fill="%230b3020"/><circle cx="150" cy="150" r="80" fill="%2310b981"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23061d13" font-family="sans-serif" font-weight="bold" font-size="24">PROJECT ASTRA</text></svg>',
        uploadedAt: '2025-04-10T12:00:00.000Z'
      },
      {
        id: 'mock-2',
        name: 'distribution_agreement.pdf',
        type: 'application/pdf',
        size: 2458000,
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6gogMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PiBlbmRvYmoKMiAwIG9iagogIDw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbIDMgMCBSIF0gL0NvdW50IDEgPj4gZW5kb2JqCjMgMCBvYmoKICA8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbIDAgMCA1OTUgODQyIF0gL1Jlc291cmNlcyA8PCA+PiA+PiBlbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNzAgMDAwMDAgbiAKMDAwMDAwMDEzNCAwMDAwMCBuIAp0cmFpbGVyCiAgPDwgL1NpemUgNCAvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKMjI4CiUlRU9GCg==',
        uploadedAt: '2025-04-10T12:05:00.000Z'
      }
    ]
  },
  { id: 2, segment: 'Distribution', project: 'Meridian Release', status: 'Active', progress: 80, lastUpdate: '2025-04-08', note: 'Distribution across 3 states confirmed', media: [] },
  { id: 3, segment: 'Music', project: 'Rhythm Series', status: 'Recording', progress: 40, lastUpdate: '2025-04-05', note: '4 tracks completed, 6 remaining', media: [] },
  { id: 4, segment: 'Trading & Syndication', project: 'Content Deal Q2', status: 'Negotiation', progress: 30, lastUpdate: '2025-04-12', note: 'Final terms under discussion', media: [] },
  { id: 5, segment: 'Content IP Bank', project: 'Archive Digitization', status: 'Ongoing', progress: 55, lastUpdate: '2025-04-09', note: '550 titles digitized so far', media: [] },
  { id: 6, segment: 'Film Exhibition', project: 'Screen Network', status: 'Planning', progress: 15, lastUpdate: '2025-04-11', note: '3 new screen locations identified', media: [] },
];

const SEGMENT_COLORS = {
  'Film Making': '#10B981', Distribution: '#1565C0', Music: '#7C3AED',
  'Trading & Syndication': '#F59E0B', 'Content IP Bank': '#0F766E', 'Film Exhibition': '#0891B2',
};

const LS_KEY = 'kfpl_investment_status';
const LS_CUSTOM_SEGMENTS_KEY = 'kfpl_custom_segments';

export default function InvestmentStatus() {
  const addToast = useToast();
  const fileInputRef = useRef(null);

  // ── State ──────────────────────────────
  const [statusUpdates, setStatusUpdates] = useState([]);
  const [customSegments, setCustomSegments] = useState([]);
  const [editId, setEditId] = useState(null);
  const [updateNote, setUpdateNote] = useState('');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    project: '', segment: '', status: 'Planning', progress: 0, note: '',
  });
  const [newSegmentName, setNewSegmentName] = useState('');

  // ── Load from localStorage ─────────────────
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      setStatusUpdates(JSON.parse(stored));
    } else {
      setStatusUpdates(DEFAULT_STATUS_UPDATES);
      localStorage.setItem(LS_KEY, JSON.stringify(DEFAULT_STATUS_UPDATES));
    }

    const storedSegs = localStorage.getItem(LS_CUSTOM_SEGMENTS_KEY);
    if (storedSegs) {
      setCustomSegments(JSON.parse(storedSegs));
    }
  }, []);

  const persist = (updated) => {
    setStatusUpdates(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  };

  const persistSegments = (segs) => {
    setCustomSegments(segs);
    localStorage.setItem(LS_CUSTOM_SEGMENTS_KEY, JSON.stringify(segs));
  };

  // ── All available segments ─────────────────
  const allSegments = [
    ...INVESTMENT_SEGMENTS.map(s => s.name),
    ...customSegments,
  ];

  // ── CRUD Handlers ─────────────────────────
  const resetForm = () => {
    setFormData({ project: '', segment: '', status: 'Planning', progress: 0, note: '' });
  };

  const openAddModal = () => {
    resetForm();
    setEditingItem(null);
    setShowAddModal(true);
  };

  const openEditModal = (item) => {
    setFormData({
      project: item.project,
      segment: item.segment,
      status: item.status,
      progress: item.progress,
      note: item.note,
    });
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleSaveProject = () => {
    if (!formData.project.trim() || !formData.segment) {
      addToast('Please fill in project name and segment', 'error', 'Validation Error');
      return;
    }

    if (editingItem) {
      const updated = statusUpdates.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData, progress: parseInt(formData.progress) || 0, lastUpdate: new Date().toISOString().split('T')[0] }
          : item
      );
      persist(updated);
      addToast(`${formData.project} updated successfully`, 'success', 'Project Updated');
    } else {
      const newItem = {
        id: Date.now(),
        ...formData,
        progress: parseInt(formData.progress) || 0,
        lastUpdate: new Date().toISOString().split('T')[0],
        media: [],
      };
      persist([...statusUpdates, newItem]);
      addToast(`${formData.project} added successfully`, 'success', 'Project Added');
    }

    setShowAddModal(false);
    setEditingItem(null);
    resetForm();
  };

  const handleDeleteProject = (id) => {
    const updated = statusUpdates.filter(item => item.id !== id);
    persist(updated);
    addToast('Project deleted', 'success', 'Deleted');
    setDeleteConfirm(null);
  };

  const handlePostUpdate = (item) => {
    const updated = statusUpdates.map(s =>
      s.id === item.id
        ? { ...s, note: updateNote || s.note, lastUpdate: new Date().toISOString().split('T')[0] }
        : s
    );
    persist(updated);
    addToast(`Status update posted for ${item.project}`, 'success', 'Update Posted');
    setEditId(null);
    setUpdateNote('');
  };

  // ── Segment Management ─────────────────────
  const handleAddSegment = () => {
    if (!newSegmentName.trim()) {
      addToast('Please enter a segment name', 'error', 'Validation Error');
      return;
    }
    if (allSegments.includes(newSegmentName.trim())) {
      addToast('Segment already exists', 'error', 'Duplicate');
      return;
    }
    const updated = [...customSegments, newSegmentName.trim()];
    persistSegments(updated);
    addToast(`Segment "${newSegmentName.trim()}" added`, 'success', 'Segment Added');
    setNewSegmentName('');
  };

  const handleRemoveSegment = (seg) => {
    const updated = customSegments.filter(s => s !== seg);
    persistSegments(updated);
    addToast(`Segment "${seg}" removed`, 'success', 'Segment Removed');
  };

  // ── Media Upload ──────────────────────────
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!uploadTarget || files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const mediaItem = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: ev.target.result,
          uploadedAt: new Date().toISOString(),
        };
        const updated = statusUpdates.map(item => {
          if (item.id === uploadTarget) {
            return { ...item, media: [...(item.media || []), mediaItem] };
          }
          return item;
        });
        persist(updated);
      };
      reader.readAsDataURL(file);
    });

    addToast(`${files.length} file(s) uploaded`, 'success', 'Upload Complete');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadTarget(null);
  };

  const handleRemoveMedia = (itemId, mediaId) => {
    const updated = statusUpdates.map(item => {
      if (item.id === itemId) {
        return { ...item, media: (item.media || []).filter(m => m.id !== mediaId) };
      }
      return item;
    });
    persist(updated);
    addToast('Media removed', 'success', 'Removed');
  };

  return (
    <div className="kfpl-page animate-fade-slide-up">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx" style={{ display: 'none' }} onChange={handleMediaUpload} />

      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Investment Status</h2>
          <p className="kfpl-page-subtitle">Project-wise segment-wise investment status updates</p>
        </div>
        <div className="kfpl-page-header-actions" style={{ display: 'flex', gap: '8px' }}>
          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => setShowSegmentModal(true)}>
            + Add Segment
          </button>
          <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" onClick={openAddModal}>
            + Add Project
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {statusUpdates.length === 0 ? (
          <div className="kfpl-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No projects found. Click "Add Project" to create one.
          </div>
        ) : statusUpdates.map(item => {
          const accent = SEGMENT_COLORS[item.segment] || '#10B981';
          return (
            <div
              className="kfpl-status-card animate-fade-slide-up"
              key={item.id}
              style={{ '--accent-color': accent, '--accent-color-dark': accent }}
            >
              {/* Header block with title, segment, and action buttons */}
              <div className="kfpl-status-card-header">
                <div className="kfpl-status-card-title-group">
                  <div className="kfpl-status-card-title-row">
                    <h3 className="kfpl-status-card-title">{item.project}</h3>
                    <Badge status={['Active', 'Ongoing', 'In Production'].includes(item.status) ? 'active' : 'pending'}>{item.status}</Badge>
                  </div>
                  
                  {/* Meta tag pills */}
                  <div className="kfpl-status-card-meta-row">
                    <span className="kfpl-stat-pill" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--color-surface)', borderRadius: '6px', border: '1px solid var(--color-border-light)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, color: accent }}>
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{item.segment}</span>
                    </span>
                    <span className="kfpl-stat-pill" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--color-surface)', borderRadius: '6px', border: '1px solid var(--color-border-light)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, color: 'var(--color-text-muted)' }}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Updated: {item.lastUpdate}</span>
                    </span>
                    {(item.media || []).length > 0 && (
                      <span className="kfpl-stat-pill" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--color-surface)', borderRadius: '6px', border: '1px solid var(--color-border-light)' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, color: 'var(--color-text-muted)' }}>
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{item.media.length} File(s)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions button list */}
                <div className="kfpl-status-card-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className="kfpl-status-card-btn"
                    onClick={() => { setEditId(editId === item.id ? null : item.id); setUpdateNote(''); }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    {editId === item.id ? 'Cancel' : 'Post Update'}
                  </button>
                  <button
                    className="kfpl-status-card-btn"
                    onClick={() => openEditModal(item)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                    Edit
                  </button>
                  <button
                    className="kfpl-status-card-btn danger"
                    onClick={() => setDeleteConfirm(item)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Delete
                  </button>
                  <button
                    className="kfpl-status-card-btn"
                    onClick={() => {
                      setUploadTarget(item.id);
                      setTimeout(() => fileInputRef.current?.click(), 50);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                    Upload
                  </button>
                </div>
              </div>

              {/* Card Body grid */}
              <div className="kfpl-status-card-grid">
                {/* Left Column: Note bubble */}
                <div className="kfpl-status-bubble" style={{ '--accent-color': accent }}>
                  <div className="kfpl-status-bubble-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Latest Project Status
                  </div>
                  <p className="kfpl-status-bubble-content">
                    "{item.note || 'No updates have been posted for this segment cycle.'}"
                  </p>
                </div>

                {/* Right Column: Progress tracker and Attached files */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Progress Tracker */}
                  <div className="kfpl-status-progress-block" style={{ '--accent-color': accent }}>
                    <div className="kfpl-status-progress-header">
                      <span className="kfpl-status-progress-label">Milestone Completion</span>
                      <span className="kfpl-status-progress-value">{item.progress}%</span>
                    </div>
                    <div className="kfpl-status-progress-bar">
                      <div className="kfpl-status-progress-bar-fill" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>

                  {/* Media gallery grid */}
                  {(item.media || []).length > 0 && (
                    <div className="kfpl-media-section">
                      <div className="kfpl-media-section-header">Attached Files ({item.media.length})</div>
                      <div className="kfpl-media-grid">
                        {item.media.map(m => (
                          <div
                            key={m.id}
                            className="kfpl-media-card"
                            style={{ '--accent-color': accent }}
                            onClick={() => setPreviewMedia(m)}
                          >
                            <button
                              className="kfpl-media-card-delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveMedia(item.id, m.id);
                              }}
                              aria-label="Remove media"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                            
                            {m.type?.startsWith('image/') ? (
                              <>
                                <img src={m.dataUrl} alt={m.name} />
                                <div className="kfpl-media-card-overlay">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                  </svg>
                                </div>
                              </>
                            ) : m.type?.startsWith('video/') ? (
                              <>
                                <div className="kfpl-media-card-placeholder">
                                  <span className="kfpl-media-card-ext">Video</span>
                                  <span className="kfpl-media-card-name">{m.name}</span>
                                </div>
                                <div className="kfpl-media-card-overlay">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="5 3 19 12 5 21 5 3"/>
                                  </svg>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="kfpl-media-card-placeholder">
                                  <span className="kfpl-media-card-ext">{m.name?.split('.').pop()?.toUpperCase() || 'FILE'}</span>
                                  <span className="kfpl-media-card-name">{m.name}</span>
                                </div>
                                <div className="kfpl-media-card-overlay">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                  </svg>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Inline note edit container */}
              {editId === item.id && (
                <div style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--color-border-light)', animation: 'fadeIn 0.2s' }}>
                  <div className="kfpl-input-group" style={{ marginBottom: '12px' }}>
                    <label className="kfpl-input-label">Post New Project Status Note</label>
                    <textarea
                      className="kfpl-textarea"
                      value={updateNote}
                      onChange={(e) => setUpdateNote(e.target.value)}
                      placeholder="Write a status update for this project..."
                      rows="3"
                      style={{ fontSize: '0.875rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="kfpl-btn kfpl-btn--primary kfpl-btn--sm"
                      onClick={() => handlePostUpdate(item)}
                      disabled={!updateNote.trim()}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Publish Update
                    </button>
                    <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => setEditId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══════ Add / Edit Project Modal ═══════ */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingItem(null); resetForm(); }}
        title={editingItem ? 'Edit Project' : 'Add New Project'}
        footer={
          <>
            <button className="kfpl-btn kfpl-btn--ghost" onClick={() => { setShowAddModal(false); setEditingItem(null); resetForm(); }}>Cancel</button>
            <button className="kfpl-btn kfpl-btn--primary" onClick={handleSaveProject}>{editingItem ? 'Update' : 'Add Project'}</button>
          </>
        }
      >
        <div className="kfpl-form" style={{ gap: '16px' }}>
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Project Name <span className="required">*</span></label>
            <input type="text" className="kfpl-input" value={formData.project} onChange={e => setFormData({ ...formData, project: e.target.value })} placeholder="Enter project name" />
          </div>
          <div className="kfpl-form-row">
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Segment <span className="required">*</span></label>
              <select className="kfpl-select" value={formData.segment} onChange={e => setFormData({ ...formData, segment: e.target.value })}>
                <option value="">Select segment</option>
                {allSegments.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Status</label>
              <select className="kfpl-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                {['Planning', 'In Production', 'Recording', 'Active', 'Ongoing', 'Negotiation', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Progress (%)</label>
            <input type="number" className="kfpl-input" min="0" max="100" value={formData.progress} onChange={e => setFormData({ ...formData, progress: e.target.value })} />
          </div>
          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Notes</label>
            <textarea className="kfpl-textarea" value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} placeholder="Brief project description or status note..." rows="3" />
          </div>
        </div>
      </Modal>

      {/* ═══════ Add Segment Modal ═══════ */}
      <Modal
        isOpen={showSegmentModal}
        onClose={() => { setShowSegmentModal(false); setNewSegmentName(''); }}
        title="Manage Segments"
        size="sm"
        footer={
          <button className="kfpl-btn kfpl-btn--ghost" onClick={() => { setShowSegmentModal(false); setNewSegmentName(''); }}>Close</button>
        }
      >
        <div style={{ marginBottom: '16px' }}>
          <div className="kfpl-input-group" style={{ marginBottom: '12px' }}>
            <label className="kfpl-input-label">New Segment Name</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" className="kfpl-input" value={newSegmentName} onChange={e => setNewSegmentName(e.target.value)} placeholder="e.g. OTT Platform" style={{ flex: 1 }} />
              <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" onClick={handleAddSegment}>Add</button>
            </div>
          </div>

          {/* Existing segments */}
          <div>
            <label className="kfpl-input-label" style={{ marginBottom: '8px', display: 'block' }}>Default Segments</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {INVESTMENT_SEGMENTS.map(s => (
                <span key={s.name} style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  {s.name}
                </span>
              ))}
            </div>

            {customSegments.length > 0 && (
              <>
                <label className="kfpl-input-label" style={{ marginBottom: '8px', display: 'block' }}>Custom Segments</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {customSegments.map(seg => (
                    <span key={seg} style={{
                      padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                      background: 'var(--color-gold-surface)', border: '1px solid var(--color-gold)',
                      color: 'var(--color-gold-dark)', display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                      {seg}
                      <button
                        style={{
                          background: 'none', border: 'none', color: 'var(--color-danger)',
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
                          justifyContent: 'center', padding: 0, marginLeft: '2px'
                        }}
                        onClick={() => handleRemoveSegment(seg)}
                        aria-label={`Remove segment ${seg}`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ width: 10, height: 10 }}>
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* ═══════ Delete Confirmation Modal ═══════ */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
        size="sm"
        footer={
          <>
            <button className="kfpl-btn kfpl-btn--ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="kfpl-btn kfpl-btn--primary" style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={() => handleDeleteProject(deleteConfirm.id)}>Delete</button>
          </>
        }
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Are you sure you want to delete <strong>{deleteConfirm?.project}</strong>? This action cannot be undone.
        </p>
      </Modal>

      {/* ═══════ Media Preview Modal ═══════ */}
      <Modal
        isOpen={!!previewMedia}
        onClose={() => setPreviewMedia(null)}
        title={previewMedia?.name || 'File Preview'}
        size={previewMedia?.type?.startsWith('image/') || previewMedia?.type?.startsWith('video/') ? 'lg' : 'md'}
        footer={
          <>
            <button className="kfpl-btn kfpl-btn--ghost" onClick={() => setPreviewMedia(null)}>Close</button>
            {previewMedia?.dataUrl && (
              <a
                href={previewMedia.dataUrl}
                download={previewMedia.name}
                className="kfpl-btn kfpl-btn--primary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download File
              </a>
            )}
          </>
        }
      >
        {previewMedia && (
          <div className="kfpl-media-preview-container">
            {previewMedia.type?.startsWith('image/') ? (
              <img
                src={previewMedia.dataUrl}
                alt={previewMedia.name}
                className="kfpl-media-preview-content"
              />
            ) : previewMedia.type?.startsWith('video/') ? (
              <video
                src={previewMedia.dataUrl}
                controls
                autoPlay
                className="kfpl-media-preview-content"
                style={{ outline: 'none' }}
              />
            ) : (
              <div className="kfpl-media-preview-doc">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="kfpl-media-preview-doc-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <div className="kfpl-media-preview-info">
                  <span className="kfpl-media-preview-filename">{previewMedia.name}</span>
                  <span className="kfpl-media-preview-filesize">
                    File Type: {previewMedia.type || 'Unknown'} • Size: {(previewMedia.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ============ END: InvestmentStatus.jsx ============ */
