/* ============================================================
   Page: PortfolioManagement.jsx
   Description: Super-admin portfolio CRUD — add/edit/delete projects,
                manage segments, and attach project media.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { INVESTMENT_SEGMENTS, formatCurrency } from '../../data/mockData';
import { useToast } from '../../components/ui/Toast';

// ── Default project data ────────────────────────
const DEFAULT_PROJECTS = [
  { id: 1, name: 'Project Astra', segment: 'Film Making', status: 'In Production', value: '₹2.5 Cr', milestone: 65, summary: 'Flagship feature slate moving through production with cast-led marketing upside.', risk: 'Medium', horizon: 'Q4 2025', roi: '15%', health: 'On Track', media: [] },
  { id: 2, name: 'Rhythm Series', segment: 'Music', status: 'Recording', value: '₹1.8 Cr', milestone: 40, summary: 'Music catalogue and album pipeline with recurring streaming revenue potential.', risk: 'Low', horizon: 'Released catalogue', roi: '10%', health: 'On Track', media: [] },
  { id: 3, name: 'Meridian Release', segment: 'Distribution', status: 'Active', value: '₹3.2 Cr', milestone: 80, summary: 'Distribution portfolio across domestic and digital channels.', risk: 'Medium', horizon: '18 month cycle', roi: '12%', health: 'Performing', media: [] },
  { id: 4, name: 'Archive Digitization', segment: 'Content IP Bank', status: 'Ongoing', value: '₹1.4 Cr', milestone: 55, summary: 'Curated content IP vault focused on long-term licensing.', risk: 'Low', horizon: '24 month cycle', roi: '14%', health: 'Building', media: [] },
  { id: 5, name: 'Content Deal Q2', segment: 'Trading & Syndication', status: 'Negotiation', value: '₹2.1 Cr', milestone: 30, summary: 'Trade and syndication desk for packaging content deal flow.', risk: 'Medium', horizon: '12 month cycle', roi: '13%', health: 'Active', media: [] },
  { id: 6, name: 'Screen Network', segment: 'Film Exhibition', status: 'Planning', value: '₹4.0 Cr', milestone: 15, summary: 'Cinema exhibition rollout across priority micro-markets.', risk: 'Medium High', horizon: 'Planning phase', roi: '11%', health: 'Planned', media: [] },
];

const SEGMENT_ABBR = {
  'Film Making': 'FM', Distribution: 'DS', Music: 'MS',
  'Trading & Syndication': 'TS', 'Content IP Bank': 'IP', 'Film Exhibition': 'EX',
};

const SEGMENT_COLORS = {
  'Film Making': '#10B981', Distribution: '#1565C0', Music: '#7C3AED',
  'Trading & Syndication': '#F59E0B', 'Content IP Bank': '#0F766E', 'Film Exhibition': '#0891B2',
};

const LS_KEY = 'kfpl_portfolio_projects';

export default function PortfolioManagement() {
  const addToast = useToast();
  const fileInputRef = useRef(null);

  // ── State ──────────────────────────
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [drawerProject, setDrawerProject] = useState(null);
  const [uploadTarget, setUploadTarget] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '', segment: '', status: '', value: '', milestone: 0,
    summary: '', risk: 'Medium', horizon: '', roi: '', health: 'On Track', bannerImg: '',
  });

  // ── Load from localStorage ────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      setProjects(JSON.parse(stored));
    } else {
      setProjects(DEFAULT_PROJECTS);
      localStorage.setItem(LS_KEY, JSON.stringify(DEFAULT_PROJECTS));
    }
  }, []);

  const persist = (updated) => {
    setProjects(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  };

  // ── Segment list (from mockData + any custom ones) ──
  const segmentNames = [...new Set([
    ...INVESTMENT_SEGMENTS.map(s => s.name),
    ...projects.map(p => p.segment)
  ])];

  // ── CRUD handlers ─────────────────────────
  const resetForm = () => {
    setFormData({ name: '', segment: '', status: '', value: '', milestone: 0, summary: '', risk: 'Medium', horizon: '', roi: '', health: 'On Track', bannerImg: '' });
  };

  const openAddModal = () => {
    resetForm();
    setEditingProject(null);
    setShowAddModal(true);
  };

  const openEditModal = (project) => {
    setFormData({
      name: project.name,
      segment: project.segment,
      status: project.status,
      value: project.value,
      milestone: project.milestone,
      summary: project.summary,
      risk: project.risk || 'Medium',
      horizon: project.horizon || '',
      roi: project.roi || '',
      health: project.health || 'On Track',
      bannerImg: project.bannerImg || '',
    });
    setEditingProject(project);
    setShowAddModal(true);
  };

  const handleSaveProject = () => {
    if (!formData.name.trim() || !formData.segment) {
      addToast('Please fill in project name and segment', 'error', 'Validation Error');
      return;
    }

    if (editingProject) {
      // Update
      const updated = projects.map(p =>
        p.id === editingProject.id ? { ...p, ...formData } : p
      );
      persist(updated);
      addToast(`${formData.name} updated successfully`, 'success', 'Project Updated');
    } else {
      // Create
      const newProject = {
        ...formData,
        id: Date.now(),
        milestone: parseInt(formData.milestone) || 0,
        media: [],
      };
      const updated = [...projects, newProject];
      persist(updated);
      addToast(`${formData.name} added successfully`, 'success', 'Project Created');
    }

    setShowAddModal(false);
    setEditingProject(null);
    resetForm();
  };

  const handleDeleteProject = (id) => {
    const updated = projects.filter(p => p.id !== id);
    persist(updated);
    addToast('Project deleted', 'success', 'Deleted');
    setDeleteConfirm(null);
  };

  // ── Media upload ──────────────────────────
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
        const updated = projects.map(p => {
          if (p.id === uploadTarget) {
            return { ...p, media: [...(p.media || []), mediaItem] };
          }
          return p;
        });
        persist(updated);
        // Update drawer if open
        const updatedProject = updated.find(p => p.id === uploadTarget);
        if (drawerProject && drawerProject.id === uploadTarget) {
          setDrawerProject(updatedProject);
        }
      };
      reader.readAsDataURL(file);
    });

    addToast(`${files.length} file(s) uploaded`, 'success', 'Upload Complete');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadTarget(null);
  };

  const handleRemoveMedia = (projectId, mediaId) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        return { ...p, media: (p.media || []).filter(m => m.id !== mediaId) };
      }
      return p;
    });
    persist(updated);
    const updatedProject = updated.find(p => p.id === projectId);
    if (drawerProject && drawerProject.id === projectId) {
      setDrawerProject(updatedProject);
    }
    addToast('Media removed', 'success', 'Removed');
  };

  // ── Filtering ─────────────────────────────
  const filteredProjects = activeTab === 'All'
    ? projects
    : projects.filter(p => p.segment === activeTab);

  // ── Computed stats ────────────────────────
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => !['Completed', 'Planned'].includes(p.status)).length;
  const avgProgress = totalProjects > 0
    ? Math.round(projects.reduce((s, p) => s + (parseInt(p.milestone) || 0), 0) / totalProjects)
    : 0;

  // ── Lock body scroll when drawer is open ──
  useEffect(() => {
    if (!drawerProject) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, [drawerProject]);

  // ── Drawer Portal ─────────────────────────
  const drawer = drawerProject && createPortal(
    <>
      <div className="kfpl-portfolio-drawer-overlay" onClick={() => setDrawerProject(null)} />
      <aside className="kfpl-portfolio-drawer" style={{ '--portfolio-accent': SEGMENT_COLORS[drawerProject.segment] || 'var(--color-gold)' }}>
        {/* Header */}
        <div className="kfpl-drawer-header kfpl-portfolio-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '4px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{drawerProject.name}</h2>
            <span className="kfpl-portfolio-segment" style={{ marginTop: 0 }}>{drawerProject.segment}</span>
          </div>
          <button className="kfpl-modal-close" onClick={() => setDrawerProject(null)} aria-label="Close project details">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="kfpl-drawer-body kfpl-portfolio-drawer-body">
          <div className="kfpl-portfolio-drawer-visual" style={{
            backgroundImage: drawerProject.bannerImg ? `linear-gradient(rgba(6, 29, 19, 0.5), rgba(6, 29, 19, 0.8)), url(${drawerProject.bannerImg})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
            <span>{SEGMENT_ABBR[drawerProject.segment] || drawerProject.name.slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{drawerProject.value || '—'}</strong>
              <small>Portfolio value</small>
            </div>
          </div>

          <p className="kfpl-portfolio-drawer-summary">{drawerProject.summary}</p>

          {/* KPIs */}
          <div className="kfpl-portfolio-drawer-kpis">
            <div>
              <span>Status</span>
              <strong>{drawerProject.status}</strong>
            </div>
            <div>
              <span>Target ROI</span>
              <strong>{drawerProject.roi || '—'}</strong>
            </div>
            <div>
              <span>Risk</span>
              <strong>{drawerProject.risk || '—'}</strong>
            </div>
            <div>
              <span>Horizon</span>
              <strong>{drawerProject.horizon || '—'}</strong>
            </div>
            <div>
              <span>Segment</span>
              <strong>{drawerProject.segment}</strong>
            </div>
            <div>
              <span>Health</span>
              <strong>{drawerProject.health || '—'}</strong>
            </div>
          </div>

          {/* Progress */}
          <div className="kfpl-portfolio-drawer-section">
            <h3>Milestone Progress</h3>
            <div className="kfpl-portfolio-progress-row">
              <span>{drawerProject.health || 'On Track'}</span>
              <strong>{drawerProject.milestone}%</strong>
            </div>
            <div className="kfpl-progress kfpl-portfolio-drawer-progress">
              <div className="kfpl-progress-fill" style={{ width: `${drawerProject.milestone}%` }} />
            </div>
          </div>

          {/* Media Section */}
          <div className="kfpl-portfolio-drawer-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>Project Media & Files</h3>
              <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => {
                setUploadTarget(drawerProject.id);
                setTimeout(() => fileInputRef.current?.click(), 50);
              }}>+ Upload</button>
            </div>
            {(drawerProject.media || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', border: '2px dashed var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                No files uploaded yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(drawerProject.media || []).map(m => (
                  <div key={m.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                    background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)',
                  }}>
                    {m.type?.startsWith('image/') ? (
                      <img src={m.dataUrl} alt={m.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                        {m.name?.split('.').pop()?.toUpperCase() || 'FILE'}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{(m.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button
                      className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                      style={{
                        color: 'var(--color-danger)', padding: '4px 8px', minWidth: 'auto',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                      }}
                      onClick={() => handleRemoveMedia(drawerProject.id, m.id)}
                      aria-label={`Remove media ${m.name}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ width: 11, height: 11 }}>
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
            <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" onClick={() => { setDrawerProject(null); openEditModal(drawerProject); }}>
              Edit Project
            </button>
            <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ color: 'var(--color-danger)' }} onClick={() => { setDrawerProject(null); setDeleteConfirm(drawerProject); }}>
              Delete
            </button>
          </div>
        </div>
      </aside>
    </>,
    document.body
  );

  return (
    <div className="kfpl-page animate-fade-slide-up">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx" style={{ display: 'none' }} onChange={handleMediaUpload} />

      {/* Header */}
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Portfolio Management</h2>
          <p className="kfpl-page-subtitle">Manage projects, segments, and media across the KFPL portfolio</p>
        </div>
        <div className="kfpl-page-header-actions">
          <button className="kfpl-btn kfpl-btn--primary kfpl-btn--sm" onClick={openAddModal}>
            + Add Project
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="kfpl-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Projects</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalProjects}</div>
        </div>
        <div className="kfpl-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Active</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)' }}>{activeProjects}</div>
        </div>
        <div className="kfpl-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Segments</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-gold-dark)' }}>{segmentNames.length}</div>
        </div>
        <div className="kfpl-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Avg. Progress</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{avgProgress}%</div>
        </div>
      </div>

      {/* Segment Tabs */}
      <div className="kfpl-filter-chips" style={{ marginBottom: '20px', flexWrap: 'wrap' }}>
        {['All', ...segmentNames].map(tab => {
          const count = tab === 'All' ? projects.length : projects.filter(p => p.segment === tab).length;
          return (
            <span
              key={tab}
              className={`kfpl-filter-chip ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} ({count})
            </span>
          );
        })}
      </div>

      {/* Project Cards Grid */}
      <div className="kfpl-portfolio-grid">
        {filteredProjects.length === 0 ? (
          <div className="kfpl-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>
            No projects found in this segment
          </div>
        ) : filteredProjects.map(project => {
          const accent = SEGMENT_COLORS[project.segment] || '#10B981';
          const initials = SEGMENT_ABBR[project.segment] || project.name.slice(0, 2).toUpperCase();
          return (
            <div className="kfpl-portfolio-card" key={project.id} style={{ '--portfolio-accent': accent, cursor: 'pointer' }}
              onClick={() => setDrawerProject(project)}
            >
              <div className="kfpl-portfolio-card-media">
                <span className="kfpl-portfolio-card-initials">{initials}</span>
                <span className="kfpl-portfolio-card-status">{project.health || 'On Track'}</span>
              </div>

              <div className="kfpl-portfolio-card-body">
                <div className="kfpl-portfolio-card-topline">
                  <span className="kfpl-portfolio-segment">{project.segment}</span>
                  <strong>{project.value || '—'}</strong>
                </div>

                <h2>{project.name}</h2>
                <p>{project.summary}</p>

                <div className="kfpl-portfolio-metrics">
                  <div>
                    <span>Status</span>
                    <strong>{project.status}</strong>
                  </div>
                  <div>
                    <span>Target ROI</span>
                    <strong>{project.roi || '—'}</strong>
                  </div>
                  <div>
                    <span>Risk</span>
                    <strong>{project.risk || '—'}</strong>
                  </div>
                </div>

                <div className="kfpl-portfolio-progress-row">
                  <span>Milestone Progress</span>
                  <strong>{project.milestone}%</strong>
                </div>
                <div className="kfpl-progress">
                  <div className="kfpl-progress-fill" style={{ width: `${project.milestone}%` }} />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end', position: 'relative', zIndex: 10 }} onClick={e => e.stopPropagation()}>
                  <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => openEditModal(project)}>Edit</button>
                  <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ color: 'var(--color-danger)' }} onClick={() => setDeleteConfirm(project)}>Delete</button>
                  <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => {
                    setUploadTarget(project.id);
                    setTimeout(() => fileInputRef.current?.click(), 50);
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                    Upload
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════ Add / Edit Project Modal ═══════ */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingProject(null); resetForm(); }}
        title={editingProject ? 'Edit Project' : 'Add New Project'}
        size="lg"
        footer={
          <>
            <button className="kfpl-btn kfpl-btn--ghost" onClick={() => { setShowAddModal(false); setEditingProject(null); resetForm(); }}>Cancel</button>
            <button className="kfpl-btn kfpl-btn--primary" onClick={handleSaveProject}>{editingProject ? 'Update Project' : 'Add Project'}</button>
          </>
        }
      >
        <div className="kfpl-form" style={{ gap: '16px' }}>
          <div className="kfpl-form-row">
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Project Name <span className="required">*</span></label>
              <input type="text" className="kfpl-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Enter project name" />
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Segment <span className="required">*</span></label>
              <select className="kfpl-select" value={formData.segment} onChange={e => setFormData({ ...formData, segment: e.target.value })}>
                <option value="">Select segment</option>
                {segmentNames.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="kfpl-form-row">
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Status</label>
              <select className="kfpl-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="">Select status</option>
                {['Planning', 'In Production', 'Recording', 'Active', 'Ongoing', 'Negotiation', 'Completed', 'Released'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Portfolio Value</label>
              <input type="text" className="kfpl-input" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} placeholder="e.g. ₹2.5 Cr" />
            </div>
          </div>

          <div className="kfpl-form-row">
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Target ROI</label>
              <input type="text" className="kfpl-input" value={formData.roi} onChange={e => setFormData({ ...formData, roi: e.target.value })} placeholder="e.g. 15%" />
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Risk Level</label>
              <select className="kfpl-select" value={formData.risk} onChange={e => setFormData({ ...formData, risk: e.target.value })}>
                {['Low', 'Medium', 'Medium High', 'High'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="kfpl-form-row">
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Milestone Progress (%)</label>
              <input type="number" className="kfpl-input" min="0" max="100" value={formData.milestone} onChange={e => setFormData({ ...formData, milestone: e.target.value })} />
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Health</label>
              <select className="kfpl-select" value={formData.health} onChange={e => setFormData({ ...formData, health: e.target.value })}>
                {['On Track', 'Active', 'Performing', 'Building', 'Planned', 'At Risk', 'Completed'].map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <div className="kfpl-form-row">
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Project Banner Image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setFormData({ ...formData, bannerImg: ev.target.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="kfpl-input"
                  style={{ flex: 1 }}
                />
                {formData.bannerImg && (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={formData.bannerImg}
                      alt="Banner Preview"
                      style={{ width: 60, height: 40, borderRadius: 4, objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, bannerImg: '' })}
                      style={{
                        position: 'absolute', top: -6, right: -6, background: 'var(--color-danger)',
                        color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '10px', padding: 0
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="kfpl-input-group">
            <label className="kfpl-input-label">Summary</label>
            <textarea className="kfpl-textarea" value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} placeholder="Brief project description..." rows="3" />
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
            <button className="kfpl-btn kfpl-btn--primary" style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={() => handleDeleteProject(deleteConfirm.id)}>Delete Project</button>
          </>
        }
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>

      {drawer}
    </div>
  );
}

/* ============ END: PortfolioManagement.jsx ============ */
