/* ============================================================
   Page: GrowWithKFPL.jsx
   Description: Offers feed + Income Calculator
   PRD Section 8: G-01, G-02, G-03
   ============================================================ */

import { useState } from 'react';
import { growOffers, calculatorSlabs, formatCurrency } from '../../data/mockData';

export default function GrowWithKFPL() {
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [calcResult, setCalcResult] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const handleCalculate = () => {
    const amount = parseFloat(investmentAmount.replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) return;
    const slab = calculatorSlabs.find(s => amount >= s.min && amount <= s.max) || calculatorSlabs[0];
    setCalcResult({
      investmentAmount: amount,
      oneTimePercent: slab.oneTimePercent,
      oneTimeCommission: Math.round(amount * slab.oneTimePercent / 100),
      monthlyPercent: slab.monthlyPercent,
      monthlyCommission: Math.round(amount * slab.monthlyPercent / 100),
      annualCommission: Math.round(amount * slab.monthlyPercent / 100 * 12),
    });
  };

  return (
    <div className="kfpl-page" id="grow-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h1 className="kfpl-page-title">Grow with KFPL</h1>
          <p className="kfpl-page-subtitle">Browse active plans and estimate agent commission for client investments.</p>
        </div>
      </div>

      <div className="kfpl-grow-overview-card">
        <div>
          <div className="kfpl-page-eyebrow">Growth offers</div>
          <h2>Active investment plans</h2>
          <p>Use the calculator below to estimate one-time and recurring commission before client onboarding.</p>
        </div>
        <div className="kfpl-grow-metrics">
          <div className="kfpl-grow-metric">
            <span>{growOffers.length}</span>
            <small>Active Plans</small>
          </div>
          <div className="kfpl-grow-metric">
            <span>{formatCurrency(Math.min(...growOffers.map(offer => offer.minInvestment)))}</span>
            <small>Min Investment</small>
          </div>
        </div>
      </div>

      {/* Offers Feed */}
      <div className="kfpl-section-header">
        <h2>Current Offers & Plans</h2>
      </div>
      <div className="kfpl-offers-grid">
        {growOffers.map(offer => (
          <div key={offer.id} className="kfpl-offer-card" onClick={() => setSelectedOffer(offer)}>
            <div className="kfpl-offer-card-banner">
              {offer.isNew && (
                <span className="kfpl-badge kfpl-badge--emerald" style={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}>NEW</span>
              )}
              <svg className="kfpl-offer-card-banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
            <div className="kfpl-offer-card-body">
              <div className="kfpl-offer-card-title">{offer.title}</div>
              <div className="kfpl-offer-card-desc">{offer.description}</div>
              <div className="kfpl-offer-card-footer">
                <span className="kfpl-badge kfpl-badge--info">{offer.expectedROI} ROI</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{offer.period}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Income Calculator */}
      <div style={{ marginTop: 40 }}>
        <div className="kfpl-section-header">
          <h2>Income Calculator</h2>
        </div>
        <div className="kfpl-card">
          <div className="kfpl-card-body">
            <div className="kfpl-income-calculator">
              <div className="kfpl-income-calculator-inputs">
                <div className="kfpl-form-group">
                  <label className="kfpl-form-label">Investment Amount (Rs.)</label>
                  <input
                    className="kfpl-form-input"
                    type="text"
                    placeholder="e.g. 25,00,000"
                    value={investmentAmount}
                    onChange={e => setInvestmentAmount(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCalculate()}
                  />
                </div>
                <button className="kfpl-btn kfpl-btn-primary kfpl-btn-lg" onClick={handleCalculate}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="8" y1="18" x2="8" y2="18.01"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>
                  Calculate Commission
                </button>

                {/* Slab Reference */}
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>Commission Slab Reference</h4>
                  <table className="kfpl-slab-table">
                    <thead>
                      <tr><th>Investment Range</th><th>One-Time</th><th>Monthly</th></tr>
                    </thead>
                    <tbody>
                      {calculatorSlabs.map((s, i) => (
                        <tr key={i}>
                          <td>{formatCurrency(s.min)} — {s.max === Infinity ? '& above' : formatCurrency(s.max)}</td>
                          <td style={{ fontWeight: 600 }}>{s.oneTimePercent}%</td>
                          <td style={{ fontWeight: 600 }}>{s.monthlyPercent}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="kfpl-income-calculator-results">
                <h4>Projected Commission</h4>
                {calcResult ? (
                  <>
                    <div className="kfpl-income-result-item">
                      <span className="kfpl-income-result-label">Investment</span>
                      <span className="kfpl-income-result-value">{formatCurrency(calcResult.investmentAmount)}</span>
                    </div>
                    <div className="kfpl-income-result-item">
                      <span className="kfpl-income-result-label">One-Time ({calcResult.oneTimePercent}%)</span>
                      <span className="kfpl-income-result-value">{formatCurrency(calcResult.oneTimeCommission)}</span>
                    </div>
                    <div className="kfpl-income-result-item">
                      <span className="kfpl-income-result-label">Monthly ({calcResult.monthlyPercent}%)</span>
                      <span className="kfpl-income-result-value">{formatCurrency(calcResult.monthlyCommission)}</span>
                    </div>
                    <div className="kfpl-income-result-item" style={{ borderBottom: 'none' }}>
                      <span className="kfpl-income-result-label" style={{ fontWeight: 600 }}>Annual (12 months)</span>
                      <span className="kfpl-income-result-value" style={{ fontSize: 24 }}>{formatCurrency(calcResult.annualCommission)}</span>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
                    Enter an investment amount and click Calculate to see projected commission.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Detail Modal */}
      {selectedOffer && (
        <div className="kfpl-modal-overlay" onClick={() => setSelectedOffer(null)}>
          <div className="kfpl-modal" onClick={e => e.stopPropagation()}>
            <div className="kfpl-modal-header">
              <h3>{selectedOffer.title}</h3>
              <button className="kfpl-modal-close" onClick={() => setSelectedOffer(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="kfpl-modal-body">
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.6 }}>{selectedOffer.description}</p>
              <div className="kfpl-profile-detail-row">
                <span className="kfpl-profile-detail-label">Minimum Investment</span>
                <span className="kfpl-profile-detail-value">{formatCurrency(selectedOffer.minInvestment)}</span>
              </div>
              <div className="kfpl-profile-detail-row">
                <span className="kfpl-profile-detail-label">Expected ROI</span>
                <span className="kfpl-profile-detail-value" style={{ color: 'var(--color-success)' }}>{selectedOffer.expectedROI}</span>
              </div>
              <div className="kfpl-profile-detail-row">
                <span className="kfpl-profile-detail-label">Contract Period</span>
                <span className="kfpl-profile-detail-value">{selectedOffer.period}</span>
              </div>
            </div>
            <div className="kfpl-modal-footer">
              <button className="kfpl-btn kfpl-btn-secondary" onClick={() => setSelectedOffer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ END: GrowWithKFPL.jsx ============ */
