/* ============================================================
   Page: EmailNotifications.jsx
   Description: Premium Notification Management System with native dashboard
                KPI cards, collapsible selection accordions, HTML file uploader,
                dynamic global blur on active overlays, advanced timezone
                and 12-hour AM/PM calendar scheduling selectors.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import { useToast } from '../../components/ui/Toast';
import { apiRequest } from '../../config/apiHelper';

// Helper to format Agent and Client IDs
const formatAgentID = (rawId) => {
  if (!rawId || rawId === '—') return '—';
  if (rawId.startsWith('KFPL-AGT-')) return rawId;
  const digits = rawId.match(/\d+/);
  if (digits) {
    let val = parseInt(digits[0], 10);
    if (val < 1000) val = 1000 + val;
    return `KFPL-AGT-${val}`;
  }
  return 'KFPL-AGT-1001';
};

const formatClientID = (rawId) => {
  if (!rawId || rawId === '—') return '—';
  if (rawId.startsWith('KFPL-CL-')) return rawId;
  const digits = rawId.match(/\d+/);
  if (digits) {
    let val = parseInt(digits[0], 10);
    if (val < 1000) val = 1000 + val;
    return `KFPL-CL-${val}`;
  }
  return 'KFPL-CL-1001';
};

// Preset Templates Definition
const PRESET_TEMPLATES = [
  {
    id: 'custom',
    name: 'Custom Email (Blank)',
    subject: '',
    body: ''
  },
  {
    id: 'welcome',
    name: 'Welcome Investor Kit',
    subject: 'Welcome to KFPL Family - Investor Onboarding',
    body: `<h3>Welcome to Kross Film Productions Ltd (KFPL)</h3>
<p>Dear {ClientName},</p>
<p>We are thrilled to welcome you as an esteemed partner in our premium film investment catalog. Your account has been verified and registered under Client ID: <strong>{ClientID}</strong>.</p>
<p>You can now log in to the Client Portal using your registered email address to check your monthly ROI allocation, active portfolio value, and download certificate statements.</p>
<p>If you have any questions, feel free to reach out to your assigned representative or raise a ticket in the support center.</p>
<br/>
<p>Warm Regards,<br/><strong>KFPL Admin Desk</strong></p>`
  },
  {
    id: 'reward',
    name: 'Reward / Perk Announcement',
    subject: 'Congratulations! You have unlocked a new Perk Tier',
    body: `<h3>New Milestone Achieved! 🎉</h3>
<p>Dear {ClientName},</p>
<p>Based on your latest portfolio expansion, we are delighted to inform you that your profile has been promoted to a higher Perks tier. You have unlocked exclusive privileges including higher priority project allocations, invitation to private screening events, and direct access to production advisory panels.</p>
<p>Please log in to your portal and visit the "Perks & Recognition" tab to view your active benefits.</p>
<br/>
<p>Cheers,<br/><strong>KFPL Investor Relations Team</strong></p>`
  },
  {
    id: 'statement',
    name: 'Quarterly Statement Notice',
    subject: 'KFPL Quarterly Investment Statement Available',
    body: `<h3>Quarterly Investment Statement Released</h3>
<p>Dear Partner,</p>
<p>This is to inform you that the quarterly ROI statements and investment audit reports for the period ended June 2026 have been generated. You can download the authenticated PDF/CSV statement ledger directly from the documents vault under your account details.</p>
<p>All active movie project segments have yielded competitive returns aligned with the monthly slab projections.</p>
<br/>
<p>Regards,<br/><strong>KFPL Operations Desk</strong></p>`
  },
  {
    id: 'alert',
    name: 'Account Security Alert',
    subject: 'Important: Complete your KYC Verification',
    body: `<h3>KYC Action Required</h3>
<p>Dear User,</p>
<p>This is an automated reminder regarding your pending KYC documentation. To keep your movie portfolio active and receive uninterrupted monthly payouts, please verify your identity details. Upload your PAN card, Aadhaar card, and bank proof documents through your portal profile section at your earliest convenience.</p>
<p>Security and compliance are crucial for our investment cycles.</p>
<br/>
<p>Best Regards,<br/><strong>KFPL Compliance Department</strong></p>`
  }
];

// Initial mock logs of manually sent notifications
const INITIAL_SENT_LOGS = [
  {
    id: 'msg-101',
    dateTime: '2026-07-03 14:20',
    subject: 'Quarterly Dividend & Return Summary Q2',
    recipientType: 'Bulk Group',
    recipientSummary: 'All Active Clients and Agents (4 recipients total)',
    templateName: 'Quarterly Statement Notice',
    attachmentsCount: 1,
    attachments: [{ name: 'Q2_returns_summary.pdf', size: '2.4 MB' }],
    body: '<p>Statements are ready for download...</p>',
    status: 'Delivered',
    scheduledFor: null
  },
  {
    id: 'msg-102',
    dateTime: '2026-07-02 11:05',
    subject: 'Welcome to the Diamond Tier Club',
    recipientType: 'Individual',
    recipientSummary: 'Tushar Bhatnagar (KFPL-CL-1001)',
    templateName: 'Reward / Perk Announcement',
    attachmentsCount: 0,
    attachments: [],
    body: '<p>Milestone achieved Tushar...</p>',
    status: 'Delivered',
    scheduledFor: null
  },
  {
    id: 'msg-103',
    dateTime: '2026-06-28 09:15',
    subject: 'Updates on production schedule for Project Alpha',
    recipientType: 'Bulk Group',
    recipientSummary: 'All Registered Agents (1 recipient total)',
    templateName: 'Custom Email (Blank)',
    attachmentsCount: 2,
    attachments: [{ name: 'Project_Alpha_Trailer.mp4', size: '15.8 MB' }, { name: 'agent_guide_v2.pdf', size: '1.2 MB' }],
    body: '<p>Please brief your investors on the delay...</p>',
    status: 'Delivered',
    scheduledFor: null
  }
];

// SVG Icons Definition
const svgIcons = {
  send: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  history: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  paperclip: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  calendar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  clock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  ),
  upload: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  chevronDown: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  globe: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
};

export default function EmailNotifications() {
  const addToast = useToast();
  
  // Tabs: 'compose', 'logs', 'auto'
  const [activeTab, setActiveTab] = useState('compose');

  // Load clients and agents data from APIs (with fallback mock structures)
  const [clients, setClients] = useState([
    { id: '6a178eea1bfaaa856cac2115', name: 'Tushar Bhatnagar', code: 'KFPL-CL-1001', email: 'tushar@kritidigital.com', role: 'client' },
    { id: '6a178eea1bfaaa856cac2116', name: 'Milind Ratan Saugat', code: 'KFPL-CL-1002', email: 'milindsaugat1122@gmail.com', role: 'client' },
    { id: '6a178eea1bfaaa856cac2117', name: 'Garima Agrawal', code: 'KFPL-CL-1003', email: 'agrawalgarima53@gmail.com', role: 'client' }
  ]);
  const [agents, setAgents] = useState([
    { id: '6a175c3add213cf692b9fd6e', name: 'Rishika Chaudhary', code: 'KFPL-AGT-1001', email: 'rishikakds@gmail.com', role: 'agent' }
  ]);

  // Combined recipient list for selection states
  const [recipientsList, setRecipientsList] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]); // List of selected IDs
  
  // Accordion Expand/Collapse States
  const [clientsExpanded, setClientsExpanded] = useState(true);
  const [agentsExpanded, setAgentsExpanded] = useState(false);

  // Individual search strings for accordions
  const [clientSearch, setClientSearch] = useState('');
  const [agentSearch, setAgentSearch] = useState('');

  // Custom Templates State
  const [templates, setTemplates] = useState(PRESET_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);

  // New template form state
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateSubject, setNewTemplateSubject] = useState('');
  const [newTemplateBody, setNewTemplateBody] = useState('');

  // Mail form states
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const htmlUploadRef = useRef(null);
  const textareaRef = useRef(null);

  // Scheduling states
  const [sendMode, setSendMode] = useState('now'); // now, schedule
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleHour, setScheduleHour] = useState('10');
  const [scheduleMinute, setScheduleMinute] = useState('00');
  const [schedulePeriod, setSchedulePeriod] = useState('AM');
  const [scheduleTimezone, setScheduleTimezone] = useState('IST (UTC+05:30)');

  // History logs state
  const [sentLogs, setSentLogs] = useState(INITIAL_SENT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState(null); // Modal detail view log

  // Auto trigger templates state
  const [autoTriggers, setAutoTriggers] = useState([
    { id: 1, event: 'New Investor Onboarded', recipient: 'Client', status: 'active', lastSent: '2026-07-03 14:30', count: 247 },
    { id: 2, event: 'Agreement Uploaded', recipient: 'Client', status: 'active', lastSent: '2026-07-03 16:45', count: 189 },
    { id: 3, event: 'Investment Assigned / Modified', recipient: 'Client', status: 'active', lastSent: '2026-07-03 10:15', count: 312 },
    { id: 4, event: 'ROI Marked as Paid', recipient: 'Client', status: 'active', lastSent: '2026-07-02 11:00', count: 856 },
    { id: 5, event: 'Deposit Approved', recipient: 'Client / Agent', status: 'active', lastSent: '2026-07-01 09:30', count: 124 },
    { id: 6, event: 'Deposit Rejected', recipient: 'Client / Agent', status: 'active', lastSent: '2026-06-29 14:00', count: 18 },
    { id: 7, event: 'Withdrawal Approved', recipient: 'Client / Agent', status: 'active', lastSent: '2026-06-28 15:20', count: 67 },
    { id: 8, event: 'Withdrawal Rejected', recipient: 'Client / Agent', status: 'active', lastSent: '2026-06-27 10:45', count: 9 },
    { id: 9, event: 'Commission Marked as Paid', recipient: 'Agent', status: 'active', lastSent: '2026-07-03 12:00', count: 45 },
    { id: 10, event: 'Perk Assigned', recipient: 'Client', status: 'active', lastSent: '2026-07-01 16:30', count: 38 },
  ]);

  // Handle global modal blur class toggling
  useEffect(() => {
    const isOverlayOpen = showAddTemplateModal || !!selectedLog;
    if (isOverlayOpen) {
      document.body.classList.add('global-modal-blur');
    } else {
      document.body.classList.remove('global-modal-blur');
    }
    return () => {
      document.body.classList.remove('global-modal-blur');
    };
  }, [showAddTemplateModal, selectedLog]);

  // Fetch real clients and agents on load
  useEffect(() => {
    const loadData = async () => {
      let loadedClients = [];
      let loadedAgents = [];

      try {
        const cRes = await apiRequest('/api/super-admin/clients');
        const list = cRes.data?.clients || cRes.clients || (Array.isArray(cRes.data) ? cRes.data : (Array.isArray(cRes) ? cRes : []));
        if (list && list.length > 0) {
          loadedClients = list.map((c, index) => {
            const user = c.user || c.userId || {};
            const profile = c.profile || {};
            const padIndex = String(index + 1).padStart(3, '0');
            const fallbackCode = `C-${padIndex}`;
            return {
              id: c._id || user._id || profile.userId || c.id,
              name: profile.fullName || user.name || c.fullName || c.name || '—',
              code: formatClientID(user.clientCode || c.clientCode || profile.clientCode || fallbackCode),
              email: profile.email || user.email || c.email || '',
              role: 'client'
            };
          });
        }
      } catch (err) {
        console.error('Failed to load real clients in EmailNotifications:', err);
      }

      try {
        const aRes = await apiRequest('/api/super-admin/agents');
        const list = aRes.data?.agents || aRes.agents || (Array.isArray(aRes.data) ? aRes.data : (Array.isArray(aRes) ? aRes : []));
        if (list && list.length > 0) {
          loadedAgents = list.map((a, index) => {
            const user = a.user || a.userId || {};
            const profile = a.profile || {};
            const padIndex = String(index + 1).padStart(3, '0');
            const fallbackCode = `A-${padIndex}`;
            return {
              id: a._id || user._id || profile.userId || a.id,
              name: profile.fullName || user.name || a.name || '—',
              code: formatAgentID(user.agentCode || a.agentCode || profile.agentCode || fallbackCode),
              email: profile.email || user.email || a.email || '',
              role: 'agent'
            };
          });
        }
      } catch (err) {
        console.error('Failed to load real agents in EmailNotifications:', err);
      }

      // Fallbacks if lists are empty
      if (loadedClients.length === 0) {
        loadedClients = [
          { id: '6a178eea1bfaaa856cac2115', name: 'Tushar Bhatnagar', code: 'KFPL-CL-1001', email: 'tushar@kritidigital.com', role: 'client' },
          { id: '6a178eea1bfaaa856cac2116', name: 'Milind Ratan Saugat', code: 'KFPL-CL-1002', email: 'milindsaugat1122@gmail.com', role: 'client' },
          { id: '6a178eea1bfaaa856cac2117', name: 'Garima Agrawal', code: 'KFPL-CL-1003', email: 'agrawalgarima53@gmail.com', role: 'client' }
        ];
      }
      if (loadedAgents.length === 0) {
        loadedAgents = [
          { id: '6a175c3add213cf692b9fd6e', name: 'Rishika Chaudhary', code: 'KFPL-AGT-1001', email: 'rishikakds@gmail.com', role: 'agent' }
        ];
      }

      setClients(loadedClients);
      setAgents(loadedAgents);

      const combined = [
        ...loadedClients.map(c => ({ ...c, role: 'client' })),
        ...loadedAgents.map(a => ({ ...a, role: 'agent' }))
      ];
      setRecipientsList(combined);
    };

    loadData();
  }, []);

  // Pre-fill fields when template changes
  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    const tmpl = templates.find(t => t.id === templateId);
    if (tmpl) {
      setSubject(tmpl.subject);
      setBodyText(tmpl.body);
    }
  };

  // Create new custom template
  const handleAddTemplate = (e) => {
    e.preventDefault();
    if (!newTemplateName.trim()) {
      addToast('Template name is required', 'error', 'Validation Failed');
      return;
    }
    if (!newTemplateSubject.trim()) {
      addToast('Template subject is required', 'error', 'Validation Failed');
      return;
    }
    if (!newTemplateBody.trim()) {
      addToast('Template body content is required', 'error', 'Validation Failed');
      return;
    }

    const newTmpl = {
      id: 'custom-' + Date.now(),
      name: newTemplateName,
      subject: newTemplateSubject,
      body: newTemplateBody
    };

    setTemplates(prev => [...prev, newTmpl]);
    setSelectedTemplate(newTmpl.id);
    setSubject(newTemplateSubject);
    setBodyText(newTemplateBody);
    
    // Clear and close modal
    setNewTemplateName('');
    setNewTemplateSubject('');
    setNewTemplateBody('');
    setShowAddTemplateModal(false);
    
    addToast(`Template "${newTemplateName}" saved successfully`, 'success', 'Template Created');
  };

  // Upload HTML template file and read contents
  const handleHtmlTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      addToast('Please upload a valid .html template file', 'error', 'File Type Error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const htmlContent = event.target.result;
      setBodyText(htmlContent);
      const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
      const title = doc.querySelector('title')?.innerText || '';
      if (title) {
        setSubject(title);
      }
      addToast(`HTML template "${file.name}" loaded successfully!`, 'success', 'Template Imported');
    };
    reader.onerror = () => {
      addToast('Failed to read the HTML template file', 'error', 'Upload Error');
    };
    reader.readAsText(file);
  };

  // Add personalization tags at cursor position
  const insertTag = (tag) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + tag + after;
      setBodyText(newText);
      
      // Focus back and place cursor after inserted tag
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + tag.length;
      }, 0);
    } else {
      setBodyText(prev => prev + ` ${tag} `);
    }
    addToast(`Tag ${tag} inserted`, 'info', 'Tag Added');
  };

  // Define columns for Sent History Logs DataTable
  const logColumns = [
    {
      header: 'Sent Date & Time',
      accessor: 'dateTime',
      render: (row) => <span className="text-muted text-sm" style={{ whiteSpace: 'nowrap' }}>{row.dateTime}</span>
    },
    {
      header: 'Subject',
      accessor: 'subject',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '180px' }}>
          <span className="kfpl-table-cell-primary" style={{ fontWeight: 600 }}>{row.subject}</span>
          {row.scheduledFor && (
            <span style={{ fontSize: '0.72rem', color: 'var(--color-gold-dark)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500 }}>
              ⏰ Scheduled: {row.scheduledFor}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Recipient Group',
      accessor: 'recipientType',
      render: (row) => (
        <span className="kfpl-stat-pill" style={{ background: row.recipientType === 'Individual' ? '#EFF6FF' : '#F1F5F9', color: row.recipientType === 'Individual' ? '#1D4ED8' : '#475569', fontWeight: 600, fontSize: '0.75rem', padding: '4px 8px', borderRadius: '12px', display: 'inline-block' }}>
          {row.recipientType}
        </span>
      )
    },
    {
      header: 'Target Summary',
      accessor: 'recipientSummary',
      render: (row) => <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{row.recipientSummary}</span>
    },
    {
      header: 'Template',
      accessor: 'templateName',
      render: (row) => <span style={{ fontSize: '0.8125rem', fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>{row.templateName}</span>
    },
    {
      header: 'Attachments',
      accessor: 'attachmentsCount',
      render: (row) => (
        row.attachmentsCount > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-gold-dark)', fontWeight: 600, fontSize: '0.8rem' }}>
            {svgIcons.paperclip}
            {row.attachmentsCount} File(s)
          </div>
        ) : (
          <span style={{ color: 'var(--color-text-muted)' }}>—</span>
        )
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge status={row.status === 'Scheduled' ? 'pending' : (row.status === 'Delivered' ? 'active' : 'inactive')}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            type="button"
            className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
              setSelectedLog(row);
            }}
            style={{ padding: '4px 12px', fontSize: '0.75rem', height: 'auto', border: '1px solid var(--color-border)', borderRadius: '6px' }}
          >
            View Mail
          </button>
        </div>
      )
    }
  ];

  // Simulate file uploads
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const formattedFiles = files.map(file => ({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      rawFile: file
    }));
    
    setAttachments(prev => [...prev, ...formattedFiles]);
    addToast(`${files.length} file(s) attached`, 'success', 'Attached Successfully');
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    addToast('Attachment removed', 'info', 'Removed');
  };

  // Select / Deselect individual
  const handleToggleRecipient = (id) => {
    setSelectedRecipients(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Accordion 1: Filter clients
  const filteredClients = clients.filter(c => {
    const term = clientSearch.toLowerCase();
    return !term.trim() || c.name.toLowerCase().includes(term) || c.code.toLowerCase().includes(term) || c.email.toLowerCase().includes(term);
  });

  // Accordion 2: Filter agents
  const filteredAgents = agents.filter(a => {
    const term = agentSearch.toLowerCase();
    return !term.trim() || a.name.toLowerCase().includes(term) || a.code.toLowerCase().includes(term) || a.email.toLowerCase().includes(term);
  });

  // Bulk selectors inside accordion 1 (Clients)
  const isAllClientsSelected = filteredClients.length > 0 && filteredClients.every(c => selectedRecipients.includes(c.id));
  
  const handleToggleAllClients = () => {
    if (isAllClientsSelected) {
      const clientIds = filteredClients.map(c => c.id);
      setSelectedRecipients(prev => prev.filter(id => !clientIds.includes(id)));
      addToast('Cleared client selections', 'info', 'Clients Reset');
    } else {
      const clientIds = filteredClients.map(c => c.id);
      setSelectedRecipients(prev => Array.from(new Set([...prev, ...clientIds])));
      addToast(`Selected all ${filteredClients.length} clients`, 'success', 'Clients Selected');
    }
  };

  // Bulk selectors inside accordion 2 (Agents)
  const isAllAgentsSelected = filteredAgents.length > 0 && filteredAgents.every(a => selectedRecipients.includes(a.id));

  const handleToggleAllAgents = () => {
    if (isAllAgentsSelected) {
      const agentIds = filteredAgents.map(a => a.id);
      setSelectedRecipients(prev => prev.filter(id => !agentIds.includes(id)));
      addToast('Cleared agent selections', 'info', 'Agents Reset');
    } else {
      const agentIds = filteredAgents.map(a => a.id);
      setSelectedRecipients(prev => Array.from(new Set([...prev, ...agentIds])));
      addToast(`Selected all ${filteredAgents.length} agents`, 'success', 'Agents Selected');
    }
  };

  // Dynamic Day of the Week calculation helper
  const getDayOfWeek = (dateStr) => {
    if (!dateStr) return '';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return days[d.getDay()];
  };

  // Submit email notification (supports immediate or scheduled)
  const handleSendNotification = (e) => {
    e.preventDefault();
    if (selectedRecipients.length === 0) {
      addToast('Please select at least one recipient from the Client or Agent accordions below', 'error', 'Validation Failed');
      return;
    }
    if (!subject.trim()) {
      addToast('Subject line is required', 'error', 'Validation Failed');
      return;
    }
    if (!bodyText.trim()) {
      addToast('Email message content cannot be empty', 'error', 'Validation Failed');
      return;
    }
    if (sendMode === 'schedule' && (!scheduleDate || !scheduleHour || !scheduleMinute || !schedulePeriod)) {
      addToast('Please specify full date and time parameters for scheduling', 'error', 'Validation Failed');
      return;
    }

    setIsSending(true);

    // Simulate sending progress (looks premium!)
    setTimeout(() => {
      const now = new Date();
      const formatTime = now.getFullYear() + '-' + 
                         String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(now.getDate()).padStart(2, '0') + ' ' + 
                         String(now.getHours()).padStart(2, '0') + ':' + 
                         String(now.getMinutes()).padStart(2, '0');
      
      const isBulk = selectedRecipients.length > 1;
      let labelType = isBulk ? 'Bulk Group' : 'Individual';
      
      let summaryText = '';
      if (selectedRecipients.length === 1) {
        const target = recipientsList.find(r => r.id === selectedRecipients[0]);
        summaryText = target ? `${target.name} (${target.code})` : '1 Recipient';
      } else {
        const clientsCount = recipientsList.filter(r => selectedRecipients.includes(r.id) && r.role === 'client').length;
        const agentsCount = recipientsList.filter(r => selectedRecipients.includes(r.id) && r.role === 'agent').length;
        summaryText = `${selectedRecipients.length} Recipients (${clientsCount} Clients, ${agentsCount} Agents)`;
      }

      const selectedDay = getDayOfWeek(scheduleDate);
      const scheduledString = sendMode === 'schedule' 
        ? `${scheduleDate} (${selectedDay}) at ${scheduleHour}:${scheduleMinute} ${schedulePeriod}` 
        : null;

      // Normalize square brackets to curly braces before saving/sending
      const normalizedBody = bodyText
        .replace(/\[ClientName\]/g, '{ClientName}')
        .replace(/\[ClientID\]/g, '{ClientID}')
        .replace(/\[AgentName\]/g, '{AgentName}')
        .replace(/\[AgentID\]/g, '{AgentID}');

      const newLog = {
        id: `msg-${Date.now().toString().slice(-4)}`,
        dateTime: formatTime,
        subject: subject,
        recipientType: labelType,
        recipientSummary: summaryText,
        templateName: templates.find(t => t.id === selectedTemplate)?.name || 'Custom Email (Blank)',
        attachmentsCount: attachments.length,
        attachments: attachments.map(att => ({ name: att.name, size: att.size })),
        body: normalizedBody,
        status: scheduledString ? 'Scheduled' : 'Delivered',
        scheduledFor: scheduledString
      };

      setSentLogs(prev => [newLog, ...prev]);
      setIsSending(false);
      
      if (scheduledString) {
        addToast(`Email notification successfully scheduled for ${scheduledString}!`, 'success', 'Mail Scheduled');
      } else {
        addToast('Notification emails have been dispatched successfully!', 'success', 'Mail Sent');
      }
      
      // Reset form
      setSubject('');
      setBodyText('');
      setAttachments([]);
      setSelectedTemplate('custom');
      setSelectedRecipients([]);
      setSendMode('now');
      setScheduleDate('');
      setScheduleHour('10');
      setScheduleMinute('00');
      setSchedulePeriod('AM');
    }, 1800);
  };

  // Toggle automated system trigger configuration
  const handleToggleAutoTrigger = (triggerId, triggerName) => {
    setAutoTriggers(prev => prev.map(t => {
      if (t.id === triggerId) {
        const nextStatus = t.status === 'active' ? 'inactive' : 'active';
        addToast(`Trigger '${triggerName}' has been ${nextStatus === 'active' ? 'enabled' : 'disabled'}`, 'info', 'Configuration Updated');
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  // Filter sent logs
  const filteredLogs = sentLogs.filter(log => {
    const term = searchTerm.toLowerCase();
    return (
      log.subject.toLowerCase().includes(term) ||
      log.recipientSummary.toLowerCase().includes(term) ||
      log.recipientType.toLowerCase().includes(term) ||
      log.templateName.toLowerCase().includes(term)
    );
  });

  // Calculate dynamic stats
  const totalSentCount = sentLogs.filter(l => l.status === 'Delivered').length * 28 + 1284;
  const scheduledCount = sentLogs.filter(l => l.status === 'Scheduled').length;
  const activeTriggersCount = autoTriggers.filter(t => t.status === 'active').length;

  // Selected Clients and Agents count for display in accordions
  const selectedClientsCount = selectedRecipients.filter(id => clients.some(c => c.id === id)).length;
  const selectedAgentsCount = selectedRecipients.filter(id => agents.some(a => a.id === id)).length;

  // Hour options (1 to 12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  // Minute options (00 to 55 by steps of 5)
  const minuteOptions = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  return (
    <div className="kfpl-page">
      <style>{`
        body.global-modal-blur .kfpl-sidebar,
        body.global-modal-blur .kfpl-header,
        body.global-modal-blur .kfpl-page > *:not(.kfpl-modal-overlay) {
          filter: blur(8px) grayscale(15%);
          opacity: 0.65;
          pointer-events: none;
          transition: filter 0.3s ease, opacity 0.3s ease;
        }
        body.global-modal-blur .kfpl-modal-overlay {
          backdrop-filter: blur(25px) !important;
          -webkit-backdrop-filter: blur(25px) !important;
          background: rgba(255, 255, 255, 0.45) !important;
        }
        .kfpl-custom-dotted-dropzone {
          border: 3px dotted #94A3B8 !important;
          border-radius: 12px !important;
          padding: 24px !important;
          text-align: center !important;
          cursor: pointer !important;
          background: #FAFAFA !important;
          transition: border-color 0.2s ease, background-color 0.2s ease !important;
        }
        .kfpl-custom-dotted-dropzone:hover {
          border-color: var(--color-gold) !important;
          background: var(--color-gold-glow) !important;
        }
      `}</style>

      {/* Page Header */}
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Notification & Mail Console</h2>
          <p className="kfpl-page-subtitle">Send bulk/individual updates to clients & agents, attach assets, and configure automated system notifications.</p>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="kfpl-dashboard-kpis" style={{ marginBottom: '24px' }}>
        
        {/* Card 1 */}
        <div className="kfpl-card kfpl-kpi-card visible">
          <div className="kfpl-kpi-info">
            <span className="kfpl-kpi-label">Total Emails Sent</span>
            <h3 className="kfpl-kpi-value">{totalSentCount.toLocaleString()}</h3>
          </div>
          <div className="kfpl-kpi-icon gold">
            {svgIcons.send}
          </div>
        </div>

        {/* Card 2 */}
        <div className="kfpl-card kfpl-kpi-card visible">
          <div className="kfpl-kpi-info">
            <span className="kfpl-kpi-label">Scheduled Deliveries</span>
            <h3 className="kfpl-kpi-value">{scheduledCount}</h3>
          </div>
          <div className="kfpl-kpi-icon navy">
            {svgIcons.calendar}
          </div>
        </div>

        {/* Card 3 */}
        <div className="kfpl-card kfpl-kpi-card visible">
          <div className="kfpl-kpi-info">
            <span className="kfpl-kpi-label">Registered Recipients</span>
            <h3 className="kfpl-kpi-value">{recipientsList.length}</h3>
          </div>
          <div className="kfpl-kpi-icon success">
            {svgIcons.history}
          </div>
        </div>

        {/* Card 4 */}
        <div className="kfpl-card kfpl-kpi-card visible">
          <div className="kfpl-kpi-info">
            <span className="kfpl-kpi-label">System Automations</span>
            <h3 className="kfpl-kpi-value">{activeTriggersCount}</h3>
          </div>
          <div className="kfpl-kpi-icon warning">
            {svgIcons.settings}
          </div>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="kfpl-tabs" style={{ marginBottom: '24px' }}>
        <button 
          className={`kfpl-tab ${activeTab === 'compose' ? 'active' : ''}`}
          onClick={() => setActiveTab('compose')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {svgIcons.send}
          Compose Notification
        </button>
        <button 
          className={`kfpl-tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {svgIcons.history}
          Sent History Logs ({sentLogs.length})
        </button>
        <button 
          className={`kfpl-tab ${activeTab === 'auto' ? 'active' : ''}`}
          onClick={() => setActiveTab('auto')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {svgIcons.settings}
          Auto Trigger Config
        </button>
      </div>

      {/* Tab 1: Compose Notification */}
      {activeTab === 'compose' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* STEP 1: Recipient Selection Console (Collapsible Accordion Panels) */}
          <div className="kfpl-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Step 1: Recipient Targets Selection</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Expand Client or Agent selection panels below. Toggles allow bulk actions and checkbox picking.</p>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', padding: '6px 16px', background: 'var(--color-gold-glow)', border: '1px solid var(--color-gold)', borderRadius: '20px', fontWeight: 700 }}>
                Total Selected: <strong style={{ color: 'var(--color-gold-dark)', fontSize: '1.05rem' }}>{selectedRecipients.length}</strong>
              </div>
            </div>

            {/* Accordion List container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Accordion Item 1: Clients Selection */}
              <div style={{ border: '1.5px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
                {/* Header */}
                <div 
                  onClick={() => setClientsExpanded(!clientsExpanded)}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '14px 20px', 
                    background: '#F8FAFC', 
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: clientsExpanded ? '1.5px solid var(--color-border)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }}></span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Client / Investor List</span>
                    <Badge status={selectedClientsCount > 0 ? 'active' : 'inactive'}>
                      {selectedClientsCount} Selected
                    </Badge>
                  </div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', transition: '0.2s', transform: clientsExpanded ? 'rotate(180deg)' : 'none' }}>
                    {svgIcons.chevronDown}
                  </span>
                </div>

                {/* Body Content */}
                {clientsExpanded && (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#FFF' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                      
                      {/* Search client input */}
                      <div className="kfpl-search" style={{ margin: 0, flex: 1, maxWidth: '320px' }}>
                        {svgIcons.search}
                        <input 
                          type="text" 
                          placeholder="Search clients..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                        />
                      </div>

                      {/* Select/Clear client actions */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          type="button" 
                          className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                          onClick={handleToggleAllClients}
                          style={{ border: '1.5px solid var(--color-border)', borderRadius: '6px', height: 'auto', padding: '6px 12px' }}
                        >
                          {isAllClientsSelected ? 'Deselect All Clients' : 'Select All Clients'}
                        </button>
                        {selectedClientsCount > 0 && (
                          <button 
                            type="button" 
                            className="kfpl-btn kfpl-btn--secondary kfpl-btn--sm"
                            onClick={() => {
                              const clientIds = clients.map(c => c.id);
                              setSelectedRecipients(prev => prev.filter(id => !clientIds.includes(id)));
                              addToast('Cleared client selections', 'info', 'Reset');
                            }}
                            style={{ color: '#EF4444', border: '1.5px solid #FCA5A5', height: 'auto', padding: '6px 12px' }}
                          >
                            Clear Clients
                          </button>
                        )}
                      </div>

                    </div>

                    {/* Scrollable list */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', maxHeight: '180px', overflowY: 'auto', padding: '2px' }}>
                      {filteredClients.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                          No clients found matching the query.
                        </div>
                      ) : (
                        filteredClients.map(c => {
                          const isChecked = selectedRecipients.includes(c.id);
                          return (
                            <label 
                              key={c.id}
                              style={{ 
                                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', 
                                border: isChecked ? '1.5px solid var(--color-gold)' : '1.5px solid #E2E8F0',
                                borderRadius: '8px', background: isChecked ? 'var(--color-gold-glow)' : '#FFF',
                                cursor: 'pointer', margin: 0, transition: 'var(--transition-fast)'
                              }}
                            >
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => handleToggleRecipient(c.id)}
                                style={{ accentColor: 'var(--color-gold)', scale: '1.1' }}
                              />
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px', overflow: 'hidden' }}>
                                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{c.name}</span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{c.code} • {c.email}</span>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion Item 2: Agents Selection */}
              <div style={{ border: '1.5px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
                {/* Header */}
                <div 
                  onClick={() => setAgentsExpanded(!agentsExpanded)}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '14px 20px', 
                    background: '#F8FAFC', 
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: agentsExpanded ? '1.5px solid var(--color-border)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Agent List</span>
                    <Badge status={selectedAgentsCount > 0 ? 'active' : 'inactive'}>
                      {selectedAgentsCount} Selected
                    </Badge>
                  </div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', transition: '0.2s', transform: agentsExpanded ? 'rotate(180deg)' : 'none' }}>
                    {svgIcons.chevronDown}
                  </span>
                </div>

                {/* Body Content */}
                {agentsExpanded && (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#FFF' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                      
                      {/* Search agent input */}
                      <div className="kfpl-search" style={{ margin: 0, flex: 1, maxWidth: '320px' }}>
                        {svgIcons.search}
                        <input 
                          type="text" 
                          placeholder="Search agents..."
                          value={agentSearch}
                          onChange={(e) => setAgentSearch(e.target.value)}
                        />
                      </div>

                      {/* Select/Clear agent actions */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          type="button" 
                          className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                          onClick={handleToggleAllAgents}
                          style={{ border: '1.5px solid var(--color-border)', borderRadius: '6px', height: 'auto', padding: '6px 12px' }}
                        >
                          {isAllAgentsSelected ? 'Deselect All Agents' : 'Select All Agents'}
                        </button>
                        {selectedAgentsCount > 0 && (
                          <button 
                            type="button" 
                            className="kfpl-btn kfpl-btn--secondary kfpl-btn--sm"
                            onClick={() => {
                              const agentIds = agents.map(a => a.id);
                              setSelectedRecipients(prev => prev.filter(id => !agentIds.includes(id)));
                              addToast('Cleared agent selections', 'info', 'Reset');
                            }}
                            style={{ color: '#EF4444', border: '1.5px solid #FCA5A5', height: 'auto', padding: '6px 12px' }}
                          >
                            Clear Agents
                          </button>
                        )}
                      </div>

                    </div>

                    {/* Scrollable list */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', maxHeight: '180px', overflowY: 'auto', padding: '2px' }}>
                      {filteredAgents.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                          No agents found matching the query.
                        </div>
                      ) : (
                        filteredAgents.map(a => {
                          const isChecked = selectedRecipients.includes(a.id);
                          return (
                            <label 
                              key={a.id}
                              style={{ 
                                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', 
                                border: isChecked ? '1.5px solid var(--color-gold)' : '1.5px solid #E2E8F0',
                                borderRadius: '8px', background: isChecked ? 'var(--color-gold-glow)' : '#FFF',
                                cursor: 'pointer', margin: 0, transition: 'var(--transition-fast)'
                              }}
                            >
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => handleToggleRecipient(a.id)}
                                style={{ accentColor: 'var(--color-gold)', scale: '1.1' }}
                              />
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px', overflow: 'hidden' }}>
                                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{a.name}</span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{a.code} • {a.email}</span>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* STEP 2: Compose & Content (Full Width) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
            
            {/* Left Box: Mail Form */}
            <form className="kfpl-card" onSubmit={handleSendNotification} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Step 2: Compose Mail Content</h3>
              </div>

              {/* Template Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                
                {/* Built-in dropdown */}
                <div className="kfpl-input-group">
                  <label className="kfpl-input-label">Select System Template</label>
                  <select 
                    className="kfpl-select" 
                    value={selectedTemplate} 
                    onChange={(e) => handleTemplateChange(e.target.value)}
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Upload HTML Template file */}
                <div className="kfpl-input-group">
                  <label className="kfpl-input-label">Upload HTML Template File</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="file"
                      ref={htmlUploadRef}
                      accept=".html,.htm"
                      onChange={handleHtmlTemplateUpload}
                      style={{ display: 'none' }}
                    />
                    <button 
                      type="button"
                      className="kfpl-btn kfpl-btn--ghost"
                      onClick={() => htmlUploadRef.current.click()}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', border: '1.5px solid var(--color-border)', borderRadius: '8px' }}
                    >
                      {svgIcons.upload}
                      Upload .html File
                    </button>
                  </div>
                </div>

              </div>

              {/* Subject Line */}
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Email Subject Line <span className="required">*</span></label>
                <input 
                  type="text" 
                  className="kfpl-input"
                  placeholder="Enter subject heading..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              {/* Message Body Composer */}
              <div className="kfpl-input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="kfpl-input-label">Email Body Content (HTML supported) <span className="required">*</span></label>
                </div>
                <textarea 
                  className="kfpl-input"
                  style={{ minHeight: '220px', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5', borderRadius: '10px' }}
                  placeholder="Enter email content. HTML blocks like <h3>, <p>, and <strong> tags can be used..."
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  required
                />
              </div>

              {/* Attachment Area */}
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Attach Files, Videos or Documents</label>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="kfpl-custom-dotted-dropzone"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    multiple
                  />
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-gold-dark)', marginBottom: '8px', marginInline: 'auto' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Click to upload file resources</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>Supported: PDF, Images, Videos, ZIP, Docs (Max 25MB)</div>
                </div>

                {/* Uploaded Attachments list */}
                {attachments.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                    {attachments.map((file, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          {svgIcons.paperclip}
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{file.name}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>({file.size})</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeAttachment(idx)}
                          style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                        >
                          {svgIcons.trash}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Send Mode & Scheduling Console */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <span className="kfpl-input-label" style={{ marginBottom: 0 }}>Send Timing:</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input 
                      type="radio" 
                      name="sendMode" 
                      checked={sendMode === 'now'} 
                      onChange={() => setSendMode('now')}
                      style={{ accentColor: 'var(--color-gold)' }}
                    />
                    Send Immediately
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input 
                      type="radio" 
                      name="sendMode" 
                      checked={sendMode === 'schedule'} 
                      onChange={() => setSendMode('schedule')}
                      style={{ accentColor: 'var(--color-gold)' }}
                    />
                    Schedule for Later
                  </label>
                </div>

                {sendMode === 'schedule' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1.5px solid var(--color-border)', animate: 'fadeIn 0.2s ease' }}>
                    
                    {/* Date Picker Row with day calculation */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                      <div className="kfpl-input-group">
                        <label className="kfpl-input-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {svgIcons.calendar}
                          Select Date
                        </label>
                        <input 
                          type="date" 
                          className="kfpl-input"
                          value={scheduleDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          style={{ padding: '8px 12px' }}
                        />
                      </div>
                      
                      {/* Dynamic Day Helper Block */}
                      <div className="kfpl-input-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <div style={{ padding: '10px 14px', background: '#FFF', border: '1.5px solid var(--color-border)', borderRadius: '8px', height: '40px', display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                          Day: <span style={{ color: 'var(--color-gold-dark)', marginLeft: '6px' }}>{getDayOfWeek(scheduleDate) || '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Time Selectors Row (AM/PM Custom Pickers) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div className="kfpl-input-group">
                        <label className="kfpl-input-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {svgIcons.clock}
                          Hour
                        </label>
                        <select 
                          className="kfpl-select" 
                          value={scheduleHour} 
                          onChange={(e) => setScheduleHour(e.target.value)}
                        >
                          {hourOptions.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>

                      <div className="kfpl-input-group">
                        <label className="kfpl-input-label">Minute</label>
                        <select 
                          className="kfpl-select" 
                          value={scheduleMinute} 
                          onChange={(e) => setScheduleMinute(e.target.value)}
                        >
                          {minuteOptions.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <div className="kfpl-input-group">
                        <label className="kfpl-input-label">AM / PM</label>
                        <select 
                          className="kfpl-select" 
                          value={schedulePeriod} 
                          onChange={(e) => setSchedulePeriod(e.target.value)}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>



                  </div>
                )}
              </div>

              {/* Form submit */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '6px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Selected Targets: <strong>{selectedRecipients.length}</strong>
                </div>
                <button 
                  type="submit" 
                  className="kfpl-btn kfpl-btn--primary"
                  disabled={isSending}
                  style={{ minWidth: '160px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  {isSending ? (
                    <>
                      <span className="kfpl-spinner" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      Processing...
                    </>
                  ) : (
                    <>
                      {svgIcons.send}
                      {sendMode === 'schedule' ? 'Schedule Campaign' : 'Dispatch Email'}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Right Box: Instructions / Guide */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Template creation button */}
              <div className="kfpl-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Email Layout Templates</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.4', margin: 0 }}>
                  Upload dynamic Welcome HTML layout scripts or configure templates using our inline creation utility.
                </p>
                <button 
                  type="button" 
                  className="kfpl-btn kfpl-btn--secondary"
                  onClick={() => setShowAddTemplateModal(true)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {svgIcons.plus}
                  Configure Custom Template
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Sent History Logs */}
      {activeTab === 'logs' && (
        <DataTable
          columns={logColumns}
          data={sentLogs}
          onRowClick={(row) => setSelectedLog(row)}
          searchPlaceholder="Search history by subject, recipient, template or status..."
        />
      )}

      {/* Tab 3: Auto-Trigger Configuration */}
      {activeTab === 'auto' && (
        <div className="kfpl-table-container">
          <div className="kfpl-table-toolbar">
            <span className="kfpl-table-count">
              Modify triggers that dispatch dynamic emails during core operational workflows.
            </span>
          </div>

          <div className="kfpl-table-scroll">
            <table className="kfpl-table">
              <thead>
                <tr>
                  <th>System Event Trigger</th>
                  <th>Recipient Portal</th>
                  <th>Automatic Status</th>
                  <th>Total Emails Sent</th>
                  <th>Last Executed</th>
                  <th style={{ textAlign: 'center' }}>Toggle Status</th>
                </tr>
              </thead>
              <tbody>
                {autoTriggers.map(item => (
                  <tr key={item.id}>
                    <td className="kfpl-table-cell-primary">{item.event}</td>
                    <td>
                      <span className="kfpl-stat-pill">
                        <span className="kfpl-stat-pill-value">{item.recipient}</span>
                      </span>
                    </td>
                    <td>
                      <Badge status={item.status === 'active' ? 'active' : 'inactive'}>
                        {item.status === 'active' ? 'ENABLED' : 'DISABLED'}
                      </Badge>
                    </td>
                    <td className="font-semibold">{item.count.toLocaleString()}</td>
                    <td className="text-muted text-sm">{item.lastSent}</td>
                    <td style={{ display: 'flex', justifyContent: 'center', padding: '12px' }}>
                      {/* Premium Toggle Switch */}
                      <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '22px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox"
                          checked={item.status === 'active'}
                          onChange={() => handleToggleAutoTrigger(item.id, item.event)}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{ 
                          position: 'absolute', 
                          top: 0, left: 0, right: 0, bottom: 0, 
                          backgroundColor: item.status === 'active' ? '#10B981' : '#D1D5DB', 
                          borderRadius: '34px',
                          transition: '0.3s',
                        }}>
                          <span style={{ 
                            position: 'absolute', 
                            content: '""', 
                            height: '16px', width: '16px', 
                            left: item.status === 'active' ? '24px' : '4px', 
                            bottom: '3px', 
                            backgroundColor: 'white', 
                            borderRadius: '50%',
                            transition: '0.3s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                          }} />
                        </span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Custom Template */}
      {showAddTemplateModal && (
        <div className="kfpl-modal-overlay" onClick={() => setShowAddTemplateModal(false)}>
          <form 
            className="kfpl-modal" 
            onSubmit={handleAddTemplate}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '580px' }}
          >
            <div className="kfpl-modal-header">
              <h3 className="kfpl-modal-title">Create Custom Mail Template</h3>
              <button 
                type="button"
                className="kfpl-modal-close"
                onClick={() => setShowAddTemplateModal(false)}
                style={{ border: 'none', background: 'none' }}
              >
                ✕
              </button>
            </div>

            <div className="kfpl-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Template Name <span className="required">*</span></label>
                <input 
                  type="text"
                  className="kfpl-input"
                  placeholder="e.g. Festival Greeting, Monthly Newsletter..."
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  required
                />
              </div>

              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Email Subject Line <span className="required">*</span></label>
                <input 
                  type="text"
                  className="kfpl-input"
                  placeholder="Enter default subject for this template..."
                  value={newTemplateSubject}
                  onChange={(e) => setNewTemplateSubject(e.target.value)}
                  required
                />
              </div>

              <div className="kfpl-input-group">
                <label className="kfpl-input-label">Template Body Message <span className="required">*</span></label>
                <textarea 
                  className="kfpl-input"
                  style={{ minHeight: '160px', fontFamily: 'monospace', borderRadius: '10px' }}
                  placeholder="Enter default body message. Supports shortcodes like {ClientName} or [ClientName]..."
                  value={newTemplateBody}
                  onChange={(e) => setNewTemplateBody(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="kfpl-modal-footer">
              <button 
                type="button" 
                className="kfpl-btn kfpl-btn--secondary"
                onClick={() => setShowAddTemplateModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="kfpl-btn kfpl-btn--primary"
              >
                Save & Use Template
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sent Log Modal Detail View */}
      {selectedLog && (
        <div className="kfpl-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div 
            className="kfpl-modal" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px' }}
          >
            <div className="kfpl-modal-header">
              <div>
                <span className="text-muted text-sm" style={{ display: 'block', marginBottom: '2px' }}>{selectedLog.dateTime}</span>
                <h3 className="kfpl-modal-title">Sent Notification Details</h3>
              </div>
              <button 
                type="button"
                className="kfpl-modal-close"
                onClick={() => setSelectedLog(null)}
                style={{ border: 'none', background: 'none' }}
              >
                ✕
              </button>
            </div>

            <div className="kfpl-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Meta information */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: 'var(--color-text-secondary)' }}>Recipient Type:</strong> {selectedLog.recipientType}
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: 'var(--color-text-secondary)' }}>Recipients list:</strong> {selectedLog.recipientSummary}
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: 'var(--color-text-secondary)' }}>Template:</strong> {selectedLog.templateName}
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: 'var(--color-text-secondary)' }}>Subject:</strong> {selectedLog.subject}
                </div>
                {selectedLog.scheduledFor && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-gold-dark)', fontWeight: 600 }}>
                    ⏰ Scheduled For Delivery: {selectedLog.scheduledFor}
                  </div>
                )}
              </div>

              {/* Email Message Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Message Preview:</span>
                <div 
                  style={{ 
                    border: '1.5px solid var(--color-border)', 
                    borderRadius: '10px', 
                    padding: '16px', 
                    maxHeight: '200px', 
                    overflowY: 'auto', 
                    background: '#FFF', 
                    fontSize: '0.875rem', 
                    lineHeight: '1.6' 
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedLog.body }}
                />
              </div>

              {/* Attachments Section inside Modal */}
              {selectedLog.attachments.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Attached Resources:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedLog.attachments.map((file, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#FAFAFA' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>📎 {file.name} ({file.size})</span>
                        <a href="#" onClick={(e) => { e.preventDefault(); alert(`Simulating file download: ${file.name}`); }} style={{ fontSize: '0.78rem', color: 'var(--color-gold-dark)', fontWeight: 600, textDecoration: 'underline' }}>Download</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="kfpl-modal-footer">
              <button 
                type="button"
                className="kfpl-btn kfpl-btn--secondary"
                onClick={() => setSelectedLog(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
