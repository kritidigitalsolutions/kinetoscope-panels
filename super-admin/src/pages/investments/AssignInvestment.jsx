/* ============================================================
   Page: AssignInvestment.jsx
   Description: Form to assign investment to a client
   ============================================================ */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { investors, INVESTMENT_SEGMENTS } from '../../data/mockData';

export default function AssignInvestment() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [form, setForm] = useState({
    investorId: '', segment: '', amount: '', roi: '', contractPeriod: '',
  });
  const [riskSliders, setRiskSliders] = useState(
    INVESTMENT_SEGMENTS.reduce((acc, seg) => ({ ...acc, [seg.id]: 0 }), {})
  );

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSlider = (segId, value) => {
    setRiskSliders(prev => ({ ...prev, [segId]: Number(value) }));
  };

  const totalRisk = Object.values(riskSliders).reduce((sum, v) => sum + v, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    addToast('Investment assigned successfully!', 'success', 'Investment Created');
    setTimeout(() => navigate('/investments'), 500);
  };

  return (
    <div className="kfpl-page">
      <div className="kfpl-page-header">
        <div className="kfpl-page-header-left">
          <h2 className="kfpl-page-title">Assign Investment</h2>
          <p className="kfpl-page-subtitle">Assign a new investment project to a client</p>
        </div>
        <div className="kfpl-page-header-actions">
          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => navigate('/investments')}>Cancel</button>
        </div>
      </div>

      <form className="kfpl-form-card" onSubmit={handleSubmit}>
        <div className="kfpl-form-card-header">
          <div>
            <h3 className="kfpl-form-card-title">Investment Details</h3>
          </div>
        </div>

        <div className="kfpl-form">
          <div className="kfpl-form-row">
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Select Investor <span className="required">*</span></label>
              <select className="kfpl-select" name="investorId" value={form.investorId} onChange={handleChange} required>
                <option value="">Choose investor</option>
                {investors.filter(i => i.status === 'active').map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.name} ({inv.clientId})</option>
                ))}
              </select>
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Investment Segment <span className="required">*</span></label>
              <select className="kfpl-select" name="segment" value={form.segment} onChange={handleChange} required>
                <option value="">Choose segment</option>
                {INVESTMENT_SEGMENTS.map(seg => (
                  <option key={seg.id} value={seg.id}>{seg.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="kfpl-form-row-3">
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Amount (₹) <span className="required">*</span></label>
              <input className="kfpl-input" name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Enter amount" required />
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">ROI % <span className="required">*</span></label>
              <input className="kfpl-input" name="roi" type="number" step="0.1" value={form.roi} onChange={handleChange} placeholder="e.g. 15" required />
            </div>
            <div className="kfpl-input-group">
              <label className="kfpl-input-label">Contract Period (months)</label>
              <input className="kfpl-input" name="contractPeriod" type="number" value={form.contractPeriod} onChange={handleChange} placeholder="e.g. 24" />
            </div>
          </div>

          {/* Risk Allocation Sliders */}
          <div className="kfpl-form-section">
            <div className="kfpl-form-section-title">
              Risk Appetite Allocation
              <span style={{ float: 'right', color: totalRisk === 100 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 700 }}>
                Total: {totalRisk}%
              </span>
            </div>
            {INVESTMENT_SEGMENTS.map(seg => (
              <div className="kfpl-slider-group" key={seg.id}>
                <div className="kfpl-slider-header">
                  <span className="kfpl-slider-label">{seg.name}</span>
                  <span className="kfpl-slider-value">{riskSliders[seg.id]}%</span>
                </div>
                <input
                  type="range"
                  className="kfpl-slider"
                  min="0"
                  max="100"
                  value={riskSliders[seg.id]}
                  onChange={(e) => handleSlider(seg.id, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="kfpl-form-actions">
            <button type="button" className="kfpl-btn kfpl-btn--ghost" onClick={() => navigate('/investments')}>Cancel</button>
            <button type="submit" className="kfpl-btn kfpl-btn--primary">Assign Investment</button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ============ END: AssignInvestment.jsx ============ */
