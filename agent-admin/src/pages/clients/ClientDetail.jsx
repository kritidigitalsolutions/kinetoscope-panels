/* ============================================================
   Page: ClientDetail.jsx
   Description: Client profile detail page for Agent Portal (Read-Only)
   Matches Super Admin's InvestorDetail.jsx structure and aesthetics perfectly
   ============================================================ */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import { formatCurrency } from '../../data/mockData';
import { useToast } from '../../components/ui/Toast';
import { apiRequest } from '../../config/apiHelper';

/* ── helpers for downloading statements ─────────────────────── */
function downloadClientROISingleCSV(roi, client) {
  const rows = [
    ['ROI Payout Statement'],
    ['Client Name', client.name],
    ['Client ID', client.clientId],
    ['Period / Month', roi.month],
    ['Payout Date', new Date(roi.paidAt || roi.date || new Date()).toLocaleDateString('en-IN')],
    ['ROI Amount', `₹${roi.amount}`],
    ['Status', roi.status],
  ];
  const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ROI_Statement_${roi.month.replace(/\s/g, '_')}_${client.name.replace(/\s/g, '_')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadClientROISinglePDF(roi, client) {
  const dateStr = new Date(roi.paidAt || roi.date || new Date()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const investments = client.investments || [];

  const rowsHtml = investments.map(inv => {
    const monthlyROI = Math.round((inv.amount * (inv.roi || client.roiPercent || 1)) / 100);
    return `
      <tr>
        <td style="border: 1px solid #CFDDD5; padding: 10px; font-weight: 500;">${inv.segment}</td>
        <td style="border: 1px solid #CFDDD5; padding: 10px; text-align: center;">${inv.date || '—'}</td>
        <td style="border: 1px solid #CFDDD5; padding: 10px; text-align: center;">—</td>
        <td style="border: 1px solid #CFDDD5; padding: 10px; text-align: right; font-weight: 600;">₹${inv.amount.toLocaleString('en-IN')}</td>
        <td style="border: 1px solid #CFDDD5; padding: 10px; text-align: right;">${inv.roi || client.roiPercent || 1}%</td>
        <td style="border: 1px solid #CFDDD5; padding: 10px; text-align: right; font-weight: bold; color: #0F766E;">₹${monthlyROI.toLocaleString('en-IN')}</td>
      </tr>
    `;
  }).join('');

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  printWindow.document.write(`
    <html>
    <head>
      <title>ROI Payout Statement - ${roi.month} - ${client.name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #11221A; background-color: #FFFFFF; padding: 40px; margin: 0; }
        .header { margin-bottom: 30px; border-bottom: 3px solid #0F766E; padding-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
        .title { font-size: 28px; font-weight: 800; color: #061D13; margin: 0; text-transform: uppercase; letter-spacing: -0.5px; }
        .meta-info { margin-bottom: 30px; background-color: #F3F7F5; border: 1px solid #CFDDD5; border-radius: 12px; padding: 20px; }
        .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .meta-item { display: flex; justify-content: space-between; border-bottom: 1px solid #E2ECE7; padding-bottom: 6px; font-size: 14px; }
        .meta-label { font-weight: 600; color: #6D7E75; }
        .meta-val { font-weight: 700; color: #11221A; }
        .section-title { font-size: 18px; font-weight: 700; color: #061D13; margin-top: 40px; margin-bottom: 14px; border-bottom: 1.5px solid #CFDDD5; padding-bottom: 6px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        .table th { background-color: #E5ECE8; border: 1px solid #CFDDD5; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; font-weight: 800; color: #2E3E36; letter-spacing: 0.5px; }
        .table td { border: 1px solid #CFDDD5; padding: 10px 12px; color: #11221A; }
        .total-row { background-color: #F3F7F5; font-weight: bold; }
        @media print {
          body { padding: 0; }
          .print-btn-bar { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="print-btn-bar" style="display: flex; justify-content: flex-end; margin-bottom: 20px; gap: 10px;">
        <button onclick="window.print();" style="background: #0F766E; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 13px; box-shadow: 0 4px 12px rgba(15, 118, 110, 0.2);">Print / Save PDF</button>
        <button onclick="window.close();" style="background: #e2ece7; color: #2e3e36; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 13px;">Close Window</button>
      </div>

      <div class="header">
        <div>
          <div class="title">ROI Payout Statement</div>
          <div style="font-size: 12px; color: #6D7E75; margin-top: 4px; font-weight: 500;">KINETOSCOPE CAPITAL PARTNERS LTD</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 13px; font-weight: 600; color: #2E3E36;">Date Generated:</div>
          <div style="font-size: 14px; font-weight: 700; color: #11221A;">${new Date().toLocaleDateString('en-GB')}</div>
        </div>
      </div>
      
      <div class="meta-info">
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Client Name:</span>
            <span class="meta-val">${client.name}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Client ID:</span>
            <span class="meta-val">${client.clientId}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Period:</span>
            <span class="meta-val">${roi.month}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Payout Date:</span>
            <span class="meta-val">${dateStr}</span>
          </div>
          <div class="meta-item" style="grid-column: span 2; border-bottom: none; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #CFDDD5;">
            <span class="meta-label" style="font-size: 16px; color: #061D13;">Total ROI Received:</span>
            <span class="meta-val" style="font-size: 20px; color: #059669;">₹${roi.amount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
      
      <div class="section-title">Active Investments Breakdown</div>
      <table class="table">
        <thead>
          <tr>
            <th>Segment</th>
            <th style="text-align: center;">Start Date</th>
            <th style="text-align: center;">Contract Period</th>
            <th style="text-align: right;">Principal Investment</th>
            <th style="text-align: right;">Allocated Monthly ROI %</th>
            <th style="text-align: right;">Proportional Monthly ROI</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

function downloadAllClientROICSV(roiList, client) {
  const rows = [
    ['Client ROI Statement History'],
    ['Client Name', client.name],
    ['Client ID', client.clientId],
    [''],
    ['Month', 'ROI Amount', 'Payment Date', 'Status']
  ];
  roiList.forEach(roi => {
    rows.push([
      roi.month,
      roi.amount,
      roi.paidAt || roi.date || '—',
      roi.status
    ]);
  });
  const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ROI_Statement_All_${client.name.replace(/\s/g, '_')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadAllClientROIPDF(roiList, client) {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  const totalReceived = roiList.reduce((sum, r) => sum + r.amount, 0);

  const rowsHtml = roiList.map(roi => {
    return `
      <tr>
        <td style="border: 1px solid #CFDDD5; padding: 10px; font-weight: 500;">${roi.month}</td>
        <td style="border: 1px solid #CFDDD5; padding: 10px; text-align: right; font-weight: bold; color: ${roi.amount > 0 ? '#059669' : '#11221A'};">₹${roi.amount.toLocaleString('en-IN')}</td>
        <td style="border: 1px solid #CFDDD5; padding: 10px; text-align: center;">${roi.paidAt || roi.date || '—'}</td>
        <td style="border: 1px solid #CFDDD5; padding: 10px; text-align: center; color: ${roi.status === 'paid' ? '#059669' : '#D97706'}; font-weight: 600;">${roi.status.toUpperCase()}</td>
      </tr>
    `;
  }).join('');

  printWindow.document.write(`
    <html>
    <head>
      <title>ROI Statement History - ${client.name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #11221A; background-color: #FFFFFF; padding: 40px; margin: 0; }
        .header { margin-bottom: 30px; border-bottom: 3px solid #0F766E; padding-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
        .title { font-size: 28px; font-weight: 800; color: #061D13; margin: 0; text-transform: uppercase; letter-spacing: -0.5px; }
        .meta-info { margin-bottom: 30px; background-color: #F3F7F5; border: 1px solid #CFDDD5; border-radius: 12px; padding: 20px; }
        .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .meta-item { display: flex; justify-content: space-between; border-bottom: 1px solid #E2ECE7; padding-bottom: 6px; font-size: 14px; }
        .meta-label { font-weight: 600; color: #6D7E75; }
        .meta-val { font-weight: 700; color: #11221A; }
        .section-title { font-size: 18px; font-weight: 700; color: #061D13; margin-top: 40px; margin-bottom: 14px; border-bottom: 1.5px solid #CFDDD5; padding-bottom: 6px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        .table th { background-color: #E5ECE8; border: 1px solid #CFDDD5; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; font-weight: 800; color: #2E3E36; letter-spacing: 0.5px; }
        .table td { border: 1px solid #CFDDD5; padding: 10px 12px; color: #11221A; }
        .total-row { background-color: #F3F7F5; font-weight: bold; }
        @media print {
          body { padding: 0; }
          .print-btn-bar { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="print-btn-bar" style="display: flex; justify-content: flex-end; margin-bottom: 20px; gap: 10px;">
        <button onclick="window.print();" style="background: #0F766E; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 13px; box-shadow: 0 4px 12px rgba(15, 118, 110, 0.2);">Print / Save PDF</button>
        <button onclick="window.close();" style="background: #e2ece7; color: #2e3e36; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 13px;">Close Window</button>
      </div>

      <div class="header">
        <div>
          <div class="title">ROI Statement History</div>
          <div style="font-size: 12px; color: #6D7E75; margin-top: 4px; font-weight: 500;">KINETOSCOPE CAPITAL PARTNERS LTD</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 13px; font-weight: 600; color: #2E3E36;">Date Generated:</div>
          <div style="font-size: 14px; font-weight: 700; color: #11221A;">${new Date().toLocaleDateString('en-GB')}</div>
        </div>
      </div>
      
      <div class="meta-info">
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Client Name:</span>
            <span class="meta-val">${client.name}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Client ID:</span>
            <span class="meta-val">${client.clientId}</span>
          </div>
          <div class="meta-item" style="grid-column: span 2; border-bottom: none; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #CFDDD5;">
            <span class="meta-label" style="font-size: 16px; color: #061D13;">Total ROI Received:</span>
            <span class="meta-val" style="font-size: 20px; color: #059669;">₹${totalReceived.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
      
      <div class="section-title">ROI Payment Log</div>
      <table class="table">
        <thead>
          <tr>
            <th>Month / Period</th>
            <th style="text-align: right;">ROI Received</th>
            <th style="text-align: center;">Payment Date</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr class="total-row">
            <td style="text-align: left; font-weight: 800; font-size: 14px; padding: 12px;">Total Summary</td>
            <td style="text-align: right; font-weight: 800; color: #059669; font-size: 14px; padding: 12px;">₹${totalReceived.toLocaleString('en-IN')}</td>
            <td colspan="2"></td>
          </tr>
        </tbody>
      </table>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// ── SVG Icon Definitions ───────────────────────
const tabIcons = {
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  investments: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  roi: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  perks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  documents: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
};

const infoIcons = {
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  mapPin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  fileText: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  landmark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" /><path d="M4 6v12c0 1.1.9 2 2 2h14v-4" /><path d="M18 12a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4v-6z" />
    </svg>
  )
};

const perkDetails = {
  'Priority Support': { desc: 'Direct 24/7 dedicated support helpline and query resolution within 2 hours.', icon: '📞' },
  'Annual Gala Invite': { desc: 'Complimentary premium access and VIP seating at the annual film gala and awards.', icon: '🎟️' },
  'Quarterly Review': { desc: 'One-on-one portfolio review sessions with senior investment strategists.', icon: '📊' },
  'Film Set Visit': { desc: 'Exclusive behind-the-scenes access to active KFPL production sets and meet & greet.', icon: '🎬' },
  'VIP Screening': { desc: 'Private premiere screening invites for upcoming movie and content releases.', icon: '🍿' },
  'Revenue Share Bonus': { desc: 'Additional 1.5% bonus payout on high-performing distribution segments.', icon: '💰' }
};

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [rawClient, setRawClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await apiRequest(`/api/agent/clients/${id}`);
        const extractClient = (res) => {
          if (!res) return null;
          if (res.client) return res.client;
          if (res.data) {
            if (res.data.client) return res.data.client;
            return res.data;
          }
          return res;
        };
        const clientObj = extractClient(response);
        setRawClient(clientObj);
      } catch (err) {
        console.error('Failed to load client details:', err);
        addToast('Failed to load client profile', 'error', 'Error');
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  if (loading) {
    return (
      <div className="kfpl-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading client details...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!rawClient) {
    return (
      <div className="kfpl-page">
        <div className="kfpl-empty-state">
          <div className="kfpl-empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div className="kfpl-empty-state-title">Client not found</div>
          <div className="kfpl-empty-state-text">The requested client profile could not be located in your database.</div>
          <button className="kfpl-btn kfpl-btn--secondary mt-4" onClick={() => navigate('/clients')}>Back to List</button>
        </div>
      </div>
    );
  }

  // Fallbacks to enrich rawClient to match all Super Admin Investor fields
  const client = {
    dob: rawClient.dob || '1987-10-14',
    address: rawClient.address || '42, Residency Road, Near Brigade Junction, Bangalore, Karnataka 560025',
    kyc: rawClient.kyc || rawClient.kycStatus || 'Verified',
    pan: rawClient.pan || rawClient.panNumber || 'ABCDE5678F',
    bankName: rawClient.bankName || 'HDFC Bank',
    accountNo: rawClient.accountNo || rawClient.accountNumber || 'XXXX9876',
    ifsc: rawClient.ifsc || rawClient.ifscCode || 'HDFC0001042',
    riskProfile: rawClient.riskProfile || 'Moderate',
    name: rawClient.name || rawClient.fullName || 'Client',
    clientId: rawClient.clientId || rawClient.id || rawClient._id,
    roiPercent: rawClient.roiPercent || rawClient.monthlyRoi || 5.0,
    totalInvestment: rawClient.totalInvestment || rawClient.investmentAmount || 0,
    dateOfJoining: rawClient.dateOfJoining || rawClient.joinDate || rawClient.createdAt,
    ...rawClient
  };

  // Determine category tier
  let category = 'silver';
  if (client.totalInvestment >= 5000000) category = 'diamond';
  else if (client.totalInvestment >= 3000000) category = 'platinum';
  else if (client.totalInvestment >= 1500000) category = 'gold';

  // Map risk level statuses
  const riskMap = {
    'Conservative': 'active', // green
    'Moderate': 'gold',       // gold
    'Aggressive': 'rejected'   // red
  };

  // Dynamically generate sub-investments from totalInvestment
  const investments = client.investments || [
    { id: 101, segment: 'Film Making', amount: Math.round(client.totalInvestment * 0.6), date: client.dateOfJoining, roi: client.roiPercent, status: 'Active', risk: 'Medium' },
    { id: 102, segment: 'Distribution', amount: Math.round(client.totalInvestment * 0.4), date: client.dateOfJoining, roi: client.roiPercent, status: 'Active', risk: 'Low' },
  ];

  // Dynamically generate ROI History
  const monthlyROIVal = Math.round((client.totalInvestment * (client.roiPercent / 12)) / 100);
  const roiHistory = client.roiHistory || [
    { id: 201, month: 'Jan 2026', amount: monthlyROIVal, status: 'paid', paidAt: '2026-01-31' },
    { id: 202, month: 'Feb 2026', amount: monthlyROIVal, status: 'paid', paidAt: '2026-02-28' },
    { id: 203, month: 'Mar 2026', amount: monthlyROIVal, status: 'paid', paidAt: '2026-03-31' },
    { id: 204, month: 'Apr 2026', amount: monthlyROIVal, status: 'pending', paidAt: null },
    { id: 205, month: 'May 2026', amount: monthlyROIVal, status: 'pending', paidAt: null },
  ];

  // Enrich client with calculated values
  client.investments = investments;
  client.roiHistory = roiHistory;
  client.category = category;

  const tabs = ['profile', 'investments', 'roi', 'perks', 'documents'];
  const [viewingDoc, setViewingDoc] = useState(null);

  const totalPaidROI = roiHistory.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
  const totalPendingROI = roiHistory.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);

  // Perks list matching client tier
  const getPerksList = (tier) => {
    if (tier === 'diamond') return ['Priority Support', 'Annual Gala Invite', 'Quarterly Review', 'Film Set Visit', 'VIP Screening'];
    if (tier === 'platinum') return ['Priority Support', 'Annual Gala Invite', 'Quarterly Review', 'VIP Screening'];
    if (tier === 'gold') return ['Priority Support', 'Annual Gala Invite', 'Quarterly Review'];
    return ['Priority Support', 'Annual Gala Invite'];
  };
  const perks = getPerksList(category);

  return (
    <div className="kfpl-page" id="client-detail-page">
      {/* Premium Gradient Header Card */}
      <div className="kfpl-detail-card-header">
        <div className="kfpl-detail-profile">
          <div className="kfpl-detail-avatar">
            {client.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="kfpl-detail-name" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{client.name}</h2>
            <div className="kfpl-detail-id" style={{ marginTop: '2px' }}>ID: {client.clientId}</div>
            <div className="kfpl-detail-meta" style={{ marginTop: '8px' }}>
              <Badge status={category}>{category} Tier</Badge>
              <Badge status={client.status === 'Active' ? 'active' : 'inactive'}>{client.status}</Badge>
              <Badge status={riskMap[client.riskProfile]}>{client.riskProfile} Risk</Badge>
            </div>
          </div>
        </div>
        <div className="kfpl-detail-actions">
          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" style={{ color: 'var(--color-white)', borderColor: 'rgba(255, 255, 255, 0.25)', background: 'rgba(255, 255, 255, 0.05)' }} onClick={() => navigate('/clients')}>
            ← Back to List
          </button>
        </div>
      </div>

      {/* KPI summaries dashboard */}
      <div className="kfpl-detail-kpis-summary">
        <div className="kfpl-detail-kpi-summary-card">
          <span className="kfpl-detail-kpi-summary-label">Total Investment</span>
          <span className="kfpl-detail-kpi-summary-value" style={{ color: '#10B981' }}>{formatCurrency(client.totalInvestment)}</span>
        </div>
        <div className="kfpl-detail-kpi-summary-card">
          <span className="kfpl-detail-kpi-summary-label">Active Segments</span>
          <span className="kfpl-detail-kpi-summary-value">{investments.length} Segments</span>
        </div>
        <div className="kfpl-detail-kpi-summary-card">
          <span className="kfpl-detail-kpi-summary-label">Monthly ROI %</span>
          <span className="kfpl-detail-kpi-summary-value" style={{ color: '#F59E0B' }}>{client.roiPercent}% Allocated</span>
        </div>
        <div className="kfpl-detail-kpi-summary-card">
          <span className="kfpl-detail-kpi-summary-label">KYC Verification</span>
          <span className="kfpl-detail-kpi-summary-value">
            <Badge status="active">{client.kyc}</Badge>
          </span>
        </div>
      </div>

      {/* Segmented Pill Tab Bar */}
      <div className="kfpl-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`kfpl-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tabIcons[tab]}
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="kfpl-detail-grid">
          <div className="kfpl-detail-info-card">
            <div className="kfpl-detail-info-title">Personal Information</div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.user}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Full Name</span>
                <span className="kfpl-detail-info-item-value">{client.name}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.mail}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Email Address</span>
                <span className="kfpl-detail-info-item-value">{client.email}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.phone}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Phone Number</span>
                <span className="kfpl-detail-info-item-value">{client.mobile}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.calendar}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Date of Birth</span>
                <span className="kfpl-detail-info-item-value">{client.dob}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.mapPin}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Address</span>
                <span className="kfpl-detail-info-item-value">{client.address}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.calendar}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Join Date</span>
                <span className="kfpl-detail-info-item-value">
                  {new Date(client.dateOfJoining).toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>
          </div>

          <div className="kfpl-detail-info-card">
            <div className="kfpl-detail-info-title">KYC & Financial Information</div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.shield}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">KYC Status</span>
                <span className="kfpl-detail-info-item-value">
                  <Badge status="active">{client.kyc}</Badge>
                </span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Risk Profile</span>
                <span className="kfpl-detail-info-item-value">{client.riskProfile} (Read-Only)</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Monthly ROI Rate</span>
                <span className="kfpl-detail-info-item-value" style={{ color: '#10B981', fontWeight: 800 }}>{client.roiPercent}% Allocated</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.fileText}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">PAN Card Number</span>
                <span className="kfpl-detail-info-item-value">{client.pan}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.landmark}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Bank Name</span>
                <span className="kfpl-detail-info-item-value">{client.bankName}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.fileText}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Account No.</span>
                <span className="kfpl-detail-info-item-value">{client.accountNo}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon">{infoIcons.shield}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">IFSC Code</span>
                <span className="kfpl-detail-info-item-value">{client.ifsc}</span>
              </div>
            </div>
            <div className="kfpl-detail-info-row-item">
              <div className="kfpl-detail-info-item-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>{infoIcons.wallet}</div>
              <div className="kfpl-detail-info-item-content">
                <span className="kfpl-detail-info-item-label">Total Portfolio Value</span>
                <span className="kfpl-detail-info-item-value" style={{ color: '#10B981', fontWeight: 800 }}>{formatCurrency(client.totalInvestment)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'investments' && (
        <div className="kfpl-table-container">
          <div className="kfpl-table-toolbar">
            <h3 className="kfpl-form-card-title" style={{ margin: 0 }}>Active Segment Distribution</h3>
          </div>
          <div className="kfpl-table-scroll">
            <table className="kfpl-table">
              <thead>
                <tr>
                  <th>Segment</th>
                  <th>Amount</th>
                  <th>ROI Rate</th>
                  <th>Risk Level</th>
                  <th>Allocation Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {investments.map(inv => (
                  <tr key={inv.id}>
                    <td className="kfpl-table-cell-primary">{inv.segment}</td>
                    <td className="font-semibold" style={{ color: '#10B981' }}>{formatCurrency(inv.amount)}</td>
                    <td>{inv.roi}%</td>
                    <td>
                      <Badge status={inv.risk === 'High' ? 'rejected' : inv.risk === 'Medium' ? 'pending' : 'active'}>
                        {inv.risk}
                      </Badge>
                    </td>
                    <td>{new Date(inv.date).toLocaleDateString('en-GB')}</td>
                    <td><Badge status={inv.status.toLowerCase()}>{inv.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'roi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ROI Stats row */}
          <div className="kfpl-detail-grid" style={{ gap: '20px' }}>
            <div className="kfpl-detail-kpi-summary-card" style={{ borderLeft: '4px solid #10B981' }}>
              <span className="kfpl-detail-kpi-summary-label">Total ROI Paid</span>
              <span className="kfpl-detail-kpi-summary-value" style={{ color: '#10B981' }}>{formatCurrency(totalPaidROI)}</span>
            </div>
            <div className="kfpl-detail-kpi-summary-card" style={{ borderLeft: '4px solid #F59E0B' }}>
              <span className="kfpl-detail-kpi-summary-label">Total ROI Pending</span>
              <span className="kfpl-detail-kpi-summary-value" style={{ color: '#F59E0B' }}>{formatCurrency(totalPendingROI)}</span>
            </div>
          </div>

          <div className="kfpl-table-container">
            <div className="kfpl-table-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>ROI Payout Statements</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Export CSV or print PDF statements for client's ROI returns</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                  onClick={() => {
                    downloadAllClientROICSV(roiHistory, client);
                    addToast('All CSV statements downloaded', 'success', 'Download Complete');
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  CSV (All)
                </button>
                <button
                  className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                  onClick={() => {
                    downloadAllClientROIPDF(roiHistory, client);
                    addToast('All PDF statements generated', 'success', 'Download Complete');
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  PDF (All)
                </button>
              </div>
            </div>

            <div className="kfpl-table-scroll">
              <table className="kfpl-table">
                <thead>
                  <tr>
                    <th>Payout Month</th>
                    <th>ROI Rate</th>
                    <th>Payout Amount</th>
                    <th>Payout Status</th>
                    <th>Processed Date</th>
                    <th style={{ textAlign: 'center' }}>Download Statement</th>
                  </tr>
                </thead>
                <tbody>
                  {roiHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                        No ROI payout records found for this client.
                      </td>
                    </tr>
                  ) : (
                    roiHistory.map(roi => (
                      <tr key={roi.id}>
                        <td className="kfpl-table-cell-primary">{roi.month}</td>
                        <td><strong>{client.roiPercent}%</strong></td>
                        <td className="font-semibold">{formatCurrency(roi.amount)}</td>
                        <td><Badge status={roi.status}>{roi.status}</Badge></td>
                        <td>{roi.paidAt || '—'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                              onClick={() => {
                                downloadClientROISingleCSV(roi, client);
                                addToast(`Statement CSV downloaded for ${roi.month}`, 'success', 'Downloaded');
                              }}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', padding: '4px 8px' }}
                              title="Download CSV"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="12" height="12">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
                              </svg>
                              CSV
                            </button>
                            <button
                              className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                              onClick={() => {
                                downloadClientROISinglePDF(roi, client);
                                addToast(`Statement PDF generated for ${roi.month}`, 'success', 'Downloaded');
                              }}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', padding: '4px 8px' }}
                              title="Download PDF"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="12" height="12">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
                              </svg>
                              PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'perks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="kfpl-page-header" style={{ marginBottom: '4px' }}>
            <div>
              <h3 className="kfpl-form-card-title" style={{ margin: 0 }}>Assigned Loyalty Perks</h3>
              <p className="kfpl-page-subtitle" style={{ margin: '2px 0 0 0' }}>Client benefits based on their {category} recognition tier</p>
            </div>
          </div>

          {perks.length === 0 ? (
            <div className="kfpl-detail-info-card">
              <div className="kfpl-empty-state" style={{ padding: '40px' }}>
                <div className="kfpl-empty-state-title">No perks assigned</div>
                <div className="kfpl-empty-state-text">No recognition benefits exist for this tier.</div>
              </div>
            </div>
          ) : (
            <div className="kfpl-perks-grid">
              {perks.map((perkName, i) => {
                const details = perkDetails[perkName] || { desc: 'Assigned platform benefit and VIP privileges.', icon: '⭐' };
                return (
                  <div key={i} className="kfpl-perk-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="kfpl-perk-tier-stripe" style={{ background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)' }} />
                    <div className="kfpl-perk-card-header">
                      <div className="kfpl-perk-icon-wrap">
                        <span style={{ fontSize: '1.25rem' }}>{details.icon}</span>
                      </div>
                      <Badge status={category}>{category}</Badge>
                    </div>
                    <div className="kfpl-perk-card-body">
                      <h4 className="kfpl-perk-card-title" style={{ color: 'var(--color-text-primary)' }}>{perkName}</h4>
                      <p className="kfpl-perk-card-desc">
                        {details.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="kfpl-page-header" style={{ marginBottom: '4px' }}>
            <div>
              <h3 className="kfpl-form-card-title" style={{ margin: 0 }}>Onboarded Documents</h3>
              <p className="kfpl-page-subtitle" style={{ margin: '2px 0 0 0' }}>KYC, financial verification, agreement, and nominee documents</p>
            </div>
          </div>

          <div className="kfpl-detail-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {[
              { id: 'pan', label: 'PAN Card Upload', desc: 'Proof of PAN Card Identification', filename: `${client.name.replace(/\s/g, '_')}_PAN.pdf`, size: '1.2 MB' },
              { id: 'aadhar', label: 'Aadhaar Card Upload', desc: 'Proof of Identity and Address', filename: `${client.name.replace(/\s/g, '_')}_Aadhaar.pdf`, size: '2.4 MB' },
              { id: 'bank', label: 'Bank Details Document', desc: 'Cancelled Cheque or Bank Statement', filename: `${client.name.replace(/\s/g, '_')}_BankProof.pdf`, size: '1.8 MB' },
              { id: 'nominee', label: 'Nominee ID Proof', desc: 'ID Proof for Assigned Nominee', filename: 'Nominee_ID.pdf', size: '1.5 MB' },
              { id: 'agreement', label: 'Agreement Document', desc: 'Signed Investment Agreement Contract', filename: `${client.name.replace(/\s/g, '_')}_Agreement.pdf`, size: '3.1 MB' }
            ].map((doc, idx) => (
              <div key={idx} className="kfpl-detail-info-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', minHeight: '160px', position: 'relative' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ background: 'var(--color-gold-glow, #fef3c7)', color: 'var(--color-gold-dark, #b38600)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{doc.label}</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>PDF Document • {doc.size}</span>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                    {doc.desc}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--color-border-light)', paddingTop: '12px', marginTop: '12px' }}>
                  <button 
                    className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" 
                    style={{ flex: 1, fontSize: '0.78rem', padding: '6px 0' }}
                    onClick={() => setViewingDoc({ ...doc, investorName: client.name, status: 'Verified', uploadedAt: new Date(client.dateOfJoining).toLocaleDateString('en-GB') })}
                  >
                    View Document
                  </button>
                  <button 
                    className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" 
                    style={{ padding: '6px 10px' }}
                    onClick={() => {
                      const blob = new Blob([`Dummy file content for ${doc.label} of ${client.name}`], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = doc.filename;
                      link.click();
                      URL.revokeObjectURL(url);
                      addToast(`${doc.label} downloaded`, 'success', 'Downloaded');
                    }}
                    title="Download File"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Document Viewer Modal ─── */}
      {viewingDoc && createPortal(
        <div
          className="kfpl-modal-overlay"
          onClick={() => setViewingDoc(null)}
        >
          <div
            className="kfpl-modal"
            style={{ maxWidth: '680px', width: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="kfpl-modal-header">
              <h3 className="kfpl-modal-title">{viewingDoc.label}</h3>
              <button className="kfpl-modal-close" onClick={() => setViewingDoc(null)} aria-label="Close modal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="kfpl-modal-body" style={{ background: '#f8fafc', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px' }}>
              <div style={{
                background: '#ffffff', width: '100%', maxWidth: '480px', borderRadius: '12px',
                border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)', padding: '24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, var(--color-gold) 0%, #0F766E 100%)' }} />
                
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-dark)" strokeWidth="1.5" strokeLinecap="round" width="64" height="64" style={{ marginBottom: '16px', opacity: 0.85 }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
                
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800 }}>{viewingDoc.label}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>{viewingDoc.filename}</span>
                
                <div style={{
                  width: '100%', background: '#f1f5f9', borderRadius: '8px', border: '1px dashed #cbd5e1',
                  padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>Holder:</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{viewingDoc.investorName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>Status:</span>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>{viewingDoc.status}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>Verification:</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>Digital Signatures Valid</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>Uploaded:</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{viewingDoc.uploadedAt}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px', color: '#64748b', fontSize: '0.75rem' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span>Secured PDF Document. Download to view raw scan.</span>
                </div>
              </div>
            </div>
            <div className="kfpl-modal-footer">
              <button
                className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm"
                onClick={() => setViewingDoc(null)}
              >Close</button>
              <button
                className="kfpl-btn kfpl-btn--primary kfpl-btn--sm"
                onClick={() => {
                  const blob = new Blob([`Dummy file content for ${viewingDoc.label} of ${viewingDoc.investorName}`], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = viewingDoc.filename;
                  link.click();
                  URL.revokeObjectURL(url);
                  addToast(`${viewingDoc.label} downloaded`, 'success', 'Downloaded');
                  setViewingDoc(null);
                }}
              >Download Original File</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
