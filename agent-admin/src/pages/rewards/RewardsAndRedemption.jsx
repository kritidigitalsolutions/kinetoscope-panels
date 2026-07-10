/* ============================================================
   Page: RewardsAndRedemption.jsx
   Description: Rewards grid (locked/unlocked), claim form, history
   PRD Section 7: RW-01 through RW-06
   ============================================================ */

import { useState } from 'react';
import { rewardsList, rewardsHistory } from '../../data/mockData';
import { useToast } from '../../components/ui/Toast';

const rewardIcons = {
  star: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  gift: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  crown: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M3 20h18"/></svg>,
  plane: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>,
  diamond: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z"/></svg>,
};

export default function RewardsAndRedemption() {
  const toast = useToast();
  const [showClaimForm, setShowClaimForm] = useState(null);
  const [activeView, setActiveView] = useState('grid');
  const rewardSummary = {
    unlocked: rewardsList.filter(r => r.status === 'unlocked').length,
    claimed: rewardsList.filter(r => r.status === 'claimed').length,
    locked: rewardsList.filter(r => r.status === 'locked').length,
  };

  const handleClaim = (e) => {
    e.preventDefault();
    toast('Reward claim submitted successfully!', 'success');
    setShowClaimForm(null);
  };

  return (
    <div className="kfpl-page" id="rewards-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h1 className="kfpl-page-title">Rewards & Redemption</h1>
          <p className="kfpl-page-subtitle">Monitor reward milestones, claim eligibility, and redemption history.</p>
        </div>
      </div>

      <div className="kfpl-overview-bar kfpl-rewards-overview-card">
        <div className="kfpl-overview-icon kfpl-overview-icon--gold">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 16.81 6.2 19.86l1.11-6.46-4.7-4.58 6.49-.94L12 2z"/>
          </svg>
        </div>
        <div className="kfpl-overview-copy">
          <div className="kfpl-page-eyebrow">Milestone status</div>
          <h2>Reward pipeline</h2>
          <p>Unlocked rewards are ready for claim. Locked rewards show current progress toward the target.</p>
        </div>
        <div className="kfpl-overview-metrics kfpl-rewards-summary">
          <div className="kfpl-rewards-summary-item">
            <span>{rewardSummary.unlocked}</span>
            <small>Unlocked</small>
          </div>
          <div className="kfpl-rewards-summary-item">
            <span>{rewardSummary.claimed}</span>
            <small>Claimed</small>
          </div>
          <div className="kfpl-rewards-summary-item">
            <span>{rewardSummary.locked}</span>
            <small>Locked</small>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="kfpl-tabs">
        <button className={`kfpl-tab ${activeView === 'grid' ? 'active' : ''}`} onClick={() => setActiveView('grid')}>Rewards</button>
        <button className={`kfpl-tab ${activeView === 'history' ? 'active' : ''}`} onClick={() => setActiveView('history')}>Claim History</button>
      </div>

      {activeView === 'grid' && (
        <div className="kfpl-rewards-grid">
          {rewardsList.map(reward => {
            const isLocked = reward.status === 'locked';
            const isClaimed = reward.status === 'claimed';
            const progress = Math.min((reward.currentValue / reward.targetValue) * 100, 100);

            return (
              <div
                key={reward.id}
                className={`kfpl-reward-card ${isLocked ? 'kfpl-reward-card--locked' : isClaimed ? '' : 'kfpl-reward-card--unlocked'}`}
                onClick={() => !isLocked && !isClaimed && setShowClaimForm(reward)}
              >
                {!isLocked && !isClaimed && <div className="kfpl-reward-card-ribbon">Claim Now</div>}
                {isClaimed && (
                  <div className="kfpl-reward-card-ribbon" style={{ background: 'var(--color-success)' }}>Claimed</div>
                )}
                <div className="kfpl-reward-card-icon">
                  {rewardIcons[reward.icon] || rewardIcons.star}
                </div>
                <div className="kfpl-reward-card-title">{reward.title}</div>
                <div className="kfpl-reward-card-desc">{reward.description}</div>
                <div className="kfpl-reward-card-target">{reward.targetLabel}</div>
                <div className="kfpl-reward-card-progress">
                  <div className="kfpl-reward-card-progress-bar" style={{ width: `${progress}%` }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6, textAlign: 'right' }}>
                  {Math.round(progress)}% complete
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeView === 'history' && (
        <div className="kfpl-table-wrapper">
          <table className="kfpl-table">
            <thead>
              <tr><th>Reward</th><th>Claimed Date</th><th>Status</th><th>Note</th></tr>
            </thead>
            <tbody>
              {rewardsHistory.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.rewardTitle}</td>
                  <td>{new Date(r.claimedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td><span className={`kfpl-badge ${r.status === 'Fulfilled' ? 'kfpl-badge--success' : 'kfpl-badge--warning'}`}>{r.status}</span></td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Claim Form Modal */}
      {showClaimForm && (
        <div className="kfpl-modal-overlay" onClick={() => setShowClaimForm(null)}>
          <div className="kfpl-modal" onClick={e => e.stopPropagation()}>
            <div className="kfpl-modal-header">
              <h3>Claim Reward: {showClaimForm.title}</h3>
              <button className="kfpl-modal-close" onClick={() => setShowClaimForm(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleClaim}>
              <div className="kfpl-modal-body">
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 }}>{showClaimForm.description}</p>
                <div className="kfpl-form-group">
                  <label className="kfpl-form-label">Delivery Address <span className="required">*</span></label>
                  <textarea className="kfpl-form-textarea" placeholder="Enter your delivery address..." required />
                </div>
                <div className="kfpl-form-group">
                  <label className="kfpl-form-label">Contact Number <span className="required">*</span></label>
                  <input className="kfpl-form-input" type="tel" placeholder="+91 XXXXX XXXXX" required />
                </div>
                <div className="kfpl-form-group">
                  <label className="kfpl-form-label">Additional Notes</label>
                  <textarea className="kfpl-form-textarea" placeholder="Any special instructions..." style={{ minHeight: 60 }} />
                </div>
              </div>
              <div className="kfpl-modal-footer">
                <button type="button" className="kfpl-btn kfpl-btn-secondary" onClick={() => setShowClaimForm(null)}>Cancel</button>
                <button type="submit" className="kfpl-btn kfpl-btn-primary">Submit Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ END: RewardsAndRedemption.jsx ============ */
