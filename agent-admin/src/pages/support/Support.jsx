/* ============================================================
   Page: Support.jsx
   Description: Support page with WhatsApp, Email, Phone
   PRD Section 11: S-01, S-02
   ============================================================ */

import { agentProfile } from '../../data/mockData';

export default function Support() {
  const waLink = `https://wa.me/919999999999?text=Hi%20KFPL%20Support%2C%20I'm%20agent%20${encodeURIComponent(agentProfile.name)}%20(${encodeURIComponent(agentProfile.agentId)})`;

  return (
    <div className="kfpl-page" id="support-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h1 className="kfpl-page-title">Support</h1>
          <p className="kfpl-page-subtitle">Contact the KFPL support desk for commission, client, and payout assistance.</p>
        </div>
      </div>

      <div className="kfpl-support-overview">
        <div className="kfpl-support-overview-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div className="kfpl-support-overview-text">
          <div className="kfpl-page-eyebrow">Agent help desk</div>
          <h2>We are here to help</h2>
          <p>Support requests include your Agent ID automatically where applicable.</p>
        </div>
        <div className="kfpl-support-overview-meta">
          <span>{agentProfile.agentId}</span>
          <small>Mon-Fri, 10 AM - 6 PM</small>
        </div>
      </div>

      {/* Support Cards */}
      <div className="kfpl-support-grid">
        <a href={waLink} target="_blank" rel="noopener noreferrer" className="kfpl-support-card">
          <div className="kfpl-support-card-icon" style={{ background: 'rgba(37, 211, 102, 0.1)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="1.8">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </div>
          <div className="kfpl-support-card-title">WhatsApp</div>
          <div className="kfpl-support-card-desc">Chat with us instantly on WhatsApp. Pre-filled with your Agent ID.</div>
          <span className="kfpl-btn kfpl-btn-primary kfpl-btn-sm" style={{ display: 'inline-flex' }}>Open WhatsApp</span>
        </a>

        <a href="mailto:support@kfpl.in" className="kfpl-support-card">
          <div className="kfpl-support-card-icon" style={{ background: 'var(--color-info-bg)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-info)" strokeWidth="1.8">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div className="kfpl-support-card-title">Email</div>
          <div className="kfpl-support-card-desc">Send us an email at support@kfpl.in. We typically respond within 24 hours.</div>
          <span className="kfpl-btn kfpl-btn-primary kfpl-btn-sm" style={{ display: 'inline-flex' }}>Send Email</span>
        </a>

        <a href="tel:+919999999999" className="kfpl-support-card">
          <div className="kfpl-support-card-icon" style={{ background: 'var(--color-success-bg)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="1.8">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <div className="kfpl-support-card-title">Phone</div>
          <div className="kfpl-support-card-desc">Call our dedicated agent support line. Available Mon-Fri, 10 AM – 6 PM.</div>
          <span className="kfpl-btn kfpl-btn-primary kfpl-btn-sm" style={{ display: 'inline-flex' }}>Call Now</span>
        </a>
      </div>

      {/* FAQ Section */}
      <div className="kfpl-card" style={{ marginTop: 32 }}>
        <div className="kfpl-card-header">
          <h3>Frequently Asked Questions</h3>
        </div>
        <div className="kfpl-card-body">
          {[
            { q: 'When is my monthly commission credited?', a: 'Monthly commission is auto-calculated and credited within the first 5 business days of each month.' },
            { q: 'How long does a withdrawal take?', a: 'Withdrawal requests are typically processed within 2-3 business days after admin approval.' },
            { q: 'How do I claim a reward?', a: 'Once a reward is unlocked, click on it in the Rewards page and fill out the claim form. Our team will verify and fulfill it.' },
            { q: 'Can I download my client\'s agreement?', a: 'Agents can preview agreements in-browser but download is restricted. Contact support if you need a copy.' },
          ].map((faq, i) => (
            <div key={i} style={{ padding: '16px 0', borderBottom: i < 3 ? '1px solid var(--color-border-light)' : 'none' }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{faq.q}</h4>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ END: Support.jsx ============ */
