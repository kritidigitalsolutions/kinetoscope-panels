/* ============================================================
   Component: KpiCard.jsx
   Description: Dashboard KPI card with icon, value, trend, sparkline
   ============================================================ */

import { useEffect, useState } from 'react';

export default function KpiCard({ title, value, trend, trendDirection, icon, iconColor, variant, pulse, delay = 0 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`kfpl-card kfpl-kpi-card ${variant === 'gold' ? 'kfpl-card--gold' : ''} ${pulse ? 'kfpl-kpi-pulse' : ''}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    >
      {/* Subtle sparkline background decoration */}
      <div className="kfpl-kpi-sparkline-bg" aria-hidden="true">
        <svg viewBox="0 0 120 40" preserveAspectRatio="none">
          <path
            d="M0,35 Q15,30 25,25 T50,20 T75,15 T100,22 T120,10"
            fill="none"
            stroke={variant === 'gold' ? 'rgba(201,168,76,0.12)' : 'rgba(13,27,42,0.06)'}
            strokeWidth="1.5"
          />
          <path
            d="M0,35 Q15,30 25,25 T50,20 T75,15 T100,22 T120,10 L120,40 L0,40 Z"
            fill={variant === 'gold' ? 'rgba(201,168,76,0.04)' : 'rgba(13,27,42,0.02)'}
          />
        </svg>
      </div>

      <div className="kfpl-kpi-info">
        <span className="kfpl-kpi-label">{title}</span>
        <span className="kfpl-kpi-value">{value}</span>
        {trend && (
          <span className={`kfpl-kpi-trend ${trendDirection}`}>
            {trendDirection === 'up' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            )}
            {trend}
          </span>
        )}
      </div>
      <div className={`kfpl-kpi-icon ${iconColor || 'navy'}`}>
        {icon}
      </div>
    </div>
  );
}

/* ============ END: KpiCard.jsx ============ */
