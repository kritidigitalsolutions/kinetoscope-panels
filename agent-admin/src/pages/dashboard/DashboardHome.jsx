/* ============================================================
   Page: DashboardHome.jsx
   Description: Agent Dashboard — Commission Summary, KPIs,
   Rewards Strip, 2x2 Charts Grid, Activity Feed, Top Clients,
   Rewards Status Widget
   ============================================================ */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  dashboardStats, activityFeed, rewardsList, monthlyChartData,
  formatCurrency, formatNumber, clientsList, withdrawalHistory,
} from '../../data/mockData';
import KpiCard from '../../components/ui/KpiCard';
import Badge from '../../components/ui/Badge';
import DonutChart from '../../components/charts/DonutChart';
import LineChart from '../../components/charts/LineChart';
import { apiRequest } from '../../config/apiHelper';

// ── Activity Icons ───────────────────────
const activityIcons = {
  success: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  gold: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  warning: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
};

const activityColors = {
  success: { bg: 'var(--color-success-bg)', color: 'var(--color-success)' },
  gold: { bg: 'var(--color-gold-glow)', color: 'var(--color-gold-dark)' },
  warning: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)' },
  info: { bg: 'var(--color-info-bg)', color: 'var(--color-info)' },
};

// Reward card icons
const rewardIcons = {
  star: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  gift: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  crown: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M3 20h18"/></svg>,
  plane: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>,
  diamond: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z"/></svg>,
};

const SEGMENT_COLORS = ['#10B981', '#1565C0', '#2E7D32', '#E65100', '#7B1FA2', '#00838F'];

export default function DashboardHome() {
  const navigate = useNavigate();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const [stats, setStats] = useState({
    totalClients: 0,
    activeInvestments: 0,
    thisMonthCommission: 0,
    commissionPaid: 0,
    commissionPending: 0,
    rewardsEarned: 0,
  });
  const [clients, setClients] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentName, setAgentName] = useState('Agent');

  useEffect(() => {
    const authData = localStorage.getItem('kfpl_agent_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const rawName = parsed.agent?.name || parsed.agent?.fullName || 'Agent';
        setAgentName(rawName.split(' ')[0]);
      } catch (e) {
        console.error('Failed to parse agent auth:', e);
      }
    }

    const loadDashboardData = async () => {
      try {
        const [dashRes, clientsRes] = await Promise.all([
          apiRequest('/api/agent/dashboard').catch(err => { console.error(err); return null; }),
          apiRequest('/api/agent/clients').catch(err => { console.error(err); return null; })
        ]);

        if (dashRes) {
          setStats({
            totalClients: dashRes.totalClients ?? 0,
            activeInvestments: dashRes.activeInvestments ?? 0,
            thisMonthCommission: dashRes.thisMonthCommission ?? dashRes.monthlyCommission ?? 0,
            commissionPaid: dashRes.commissionPaid ?? 0,
            commissionPending: dashRes.commissionPending ?? 0,
            rewardsEarned: dashRes.rewardsEarned ?? 0,
          });
          if (dashRes.activities && Array.isArray(dashRes.activities)) {
            setActivities(dashRes.activities);
          }
          if (dashRes.withdrawals && Array.isArray(dashRes.withdrawals)) {
            setWithdrawals(dashRes.withdrawals);
          }
        }

        if (clientsRes) {
          const extractClients = (res) => {
            if (!res) return [];
            if (Array.isArray(res)) return res;
            if (res.data) {
              if (Array.isArray(res.data)) return res.data;
              if (res.data.clients && Array.isArray(res.data.clients)) return res.data.clients;
            }
            if (res.clients && Array.isArray(res.clients)) return res.clients;
            return [];
          };
          setClients(extractClients(clientsRes));
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // 1. Calculate Client Investment Distribution (Donut Chart 1)
  const totalClientInvestment = clients.reduce((sum, c) => sum + (c.totalInvestment || c.investmentAmount || 0), 0);
  const sortedClients = [...clients].sort((a, b) => (b.totalInvestment || b.investmentAmount || 0) - (a.totalInvestment || a.investmentAmount || 0));
  
  const topClientsForDonut = totalClientInvestment > 0 
    ? sortedClients.slice(0, 5).map(c => {
        const inv = c.totalInvestment || c.investmentAmount || 0;
        return {
          segment: c.name || c.fullName || 'Client',
          value: Math.round((inv / totalClientInvestment) * 100),
          amount: inv
        };
      })
    : [];

  const othersAmount = totalClientInvestment > 0 
    ? sortedClients.slice(5).reduce((sum, c) => sum + (c.totalInvestment || c.investmentAmount || 0), 0)
    : 0;

  if (othersAmount > 0) {
    topClientsForDonut.push({
      segment: 'Others',
      value: Math.round((othersAmount / totalClientInvestment) * 100),
      amount: othersAmount
    });
  }

  // For Line Chart Trend (fallback to monthly chart if there is real commission or empty)
  const lineChartData = stats.thisMonthCommission > 0 ? monthlyChartData : [];

  const clientOnboardingTrend = [...clients]
    .sort((a, b) => new Date(a.dateOfJoining || a.createdAt) - new Date(b.dateOfJoining || b.createdAt))
    .reduce((acc, client) => {
      const joinDate = client.dateOfJoining || client.createdAt;
      if (!joinDate) return acc;
      const month = new Date(joinDate).toLocaleDateString('en-IN', { month: 'short' });
      const previous = acc.length ? acc[acc.length - 1].amount : 0;
      const existingIndex = acc.findIndex(item => item.month === month);
      if (existingIndex !== -1) {
        acc[existingIndex].amount += 1;
      } else {
        acc.push({ month, amount: previous + 1 });
      }
      return acc;
    }, []);

  const withdrawalTrend = withdrawals.map(item => ({
    month: new Date(item.date || item.createdAt).toLocaleDateString('en-IN', { month: 'short' }),
    amount: item.amount,
    status: item.status,
  }));

  // Top Clients list for widgets section
  const topClientsList = sortedClients.slice(0, 5);

  return (
    <div className="kfpl-page" id="agent-dashboard-page">

      {/* ═══════════════ WELCOME BANNER ═══════════════ */}
      <div className="kfpl-welcome-banner">
        <div className="kfpl-welcome-content">
          <div className="kfpl-welcome-text">
            <div className="kfpl-welcome-eyebrow">Agent admin portal</div>
            <h1 className="kfpl-welcome-title">
              Welcome back, <span className="kfpl-welcome-name">{agentName}</span>
            </h1>
            <p className="kfpl-welcome-subtitle">
              {dateStr} — Your commission overview at a glance.
            </p>
          </div>
          <div className="kfpl-welcome-stats">
            <div className="kfpl-stat-pill">
              <span className="kfpl-stat-pill-value">{formatNumber(stats.totalClients)}</span>
              <span className="kfpl-stat-pill-label">Total Clients</span>
            </div>
            <div className="kfpl-stat-pill">
              <span className="kfpl-stat-pill-value">{formatNumber(stats.activeInvestments)}</span>
              <span className="kfpl-stat-pill-label">Active Investments</span>
            </div>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="kfpl-welcome-deco" aria-hidden="true">
          <div className="kfpl-welcome-circle kfpl-welcome-circle--1" />
          <div className="kfpl-welcome-circle kfpl-welcome-circle--2" />
          <div className="kfpl-welcome-circle kfpl-welcome-circle--3" />
        </div>
      </div>

      {/* ═══════════════ 6 KPI CARDS (2x3 Grid) ═══════════════ */}
      <div className="kfpl-dashboard-kpis">
        <KpiCard
          title="Total Clients"
          value={formatNumber(stats.totalClients)}
          trend="+2 this month"
          trendDirection="up"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          iconColor="info"
          delay={0}
        />
        <KpiCard
          title="Active Investments"
          value={formatNumber(stats.activeInvestments)}
          trend="Live active portfolios"
          trendDirection="up"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
          iconColor="success"
          delay={80}
        />
        <KpiCard
          title="This Month's Commission"
          value={formatCurrency(stats.thisMonthCommission)}
          trend="+8.2% vs last month"
          trendDirection="up"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          iconColor="info"
          delay={160}
        />
        <KpiCard
          title="Commission Paid"
          value={formatCurrency(stats.commissionPaid)}
          trend="Total earned to date"
          trendDirection="up"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}
          iconColor="success"
          delay={240}
        />
        <KpiCard
          title="Commission Pending"
          value={formatCurrency(stats.commissionPending)}
          trend="Available for withdrawal"
          trendDirection="up"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          iconColor="warning"
          delay={320}
        />
        <KpiCard
          title="Rewards Earned"
          value={formatNumber(stats.rewardsEarned)}
          trend="Milestones achieved"
          trendDirection="up"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
          iconColor="gold"
          variant="gold"
          delay={400}
        />
      </div>

      {/* ═══════════════ ACTIVE REWARDS STRIP ═══════════════ */}
      <div className="kfpl-rewards-section">
        <div className="kfpl-section-header">
          <h3 className="kfpl-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Active Rewards
          </h3>
          <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => navigate('/rewards')}>
            View All
          </button>
        </div>
        <div className="kfpl-rewards-strip">
          {rewardsList.filter(r => r.status !== 'claimed').slice(0, 5).map(reward => {
            const isLocked = reward.status === 'locked';
            const progress = Math.min((reward.currentValue / reward.targetValue) * 100, 100);
            return (
              <div
                key={reward.id}
                className={`kfpl-reward-card kfpl-rewards-strip-card ${isLocked ? 'kfpl-reward-card--locked' : 'kfpl-reward-card--unlocked'}`}
                onClick={() => !isLocked && navigate('/rewards')}
              >
                {!isLocked && <div className="kfpl-reward-card-ribbon">Claim Now</div>}
                <div className="kfpl-reward-card-icon">
                  {rewardIcons[reward.icon] || rewardIcons.star}
                </div>
                <div className="kfpl-reward-card-title">{reward.title}</div>
                <div className="kfpl-reward-card-desc">{reward.description}</div>
                <div className="kfpl-reward-card-target">{reward.targetLabel}</div>
                <div className="kfpl-reward-card-progress">
                  <div className="kfpl-reward-card-progress-bar" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════ 2×2 CHARTS GRID ═══════════════ */}
      <div className="kfpl-dashboard-charts-grid">
        {/* Chart 1: Client Investment Distribution */}
        <div className="kfpl-chart-card kfpl-chart-card--glass">
          <div className="kfpl-chart-header">
            <div>
              <div className="kfpl-chart-title">Client Investment Share</div>
              <div className="kfpl-chart-subtitle">Percentage of total client investment</div>
            </div>
            <Badge status="active">Live Share</Badge>
          </div>
          {topClientsForDonut.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              No investment data available
            </div>
          ) : (
            <>
              <div className="kfpl-chart-body">
                <DonutChart data={topClientsForDonut} size={190} strokeWidth={26} />
              </div>
              <div className="kfpl-chart-legend">
                {topClientsForDonut.map((cl, i) => (
                  <div className="kfpl-legend-item" key={cl.segment}>
                    <span className="kfpl-legend-dot" style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }} />
                    <span>{cl.segment}</span>
                    <span className="kfpl-legend-value">{cl.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Chart 2: Monthly Commission Trend */}
        <div className="kfpl-chart-card kfpl-chart-card--glass">
          <div className="kfpl-chart-header">
            <div>
              <div className="kfpl-chart-title">Monthly Commission Trend</div>
              <div className="kfpl-chart-subtitle">Recurring payouts track — FY 25</div>
            </div>
            <Badge status="gold">FY 2025</Badge>
          </div>
          {lineChartData.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              No commission history recorded yet
            </div>
          ) : (
            <div className="kfpl-chart-body">
              <LineChart data={lineChartData} height={200} color="#10B981" />
            </div>
          )}
        </div>

        {/* Chart 3: Client Onboarding Momentum */}
        <div className="kfpl-chart-card kfpl-chart-card--glass">
          <div className="kfpl-chart-header">
            <div>
              <div className="kfpl-chart-title">Client Onboarding Momentum</div>
              <div className="kfpl-chart-subtitle">Cumulative clients added by month</div>
            </div>
            <Badge status="active">{formatNumber(stats.totalClients)} Clients</Badge>
          </div>
          {clientOnboardingTrend.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              No client registration history
            </div>
          ) : (
            <div className="kfpl-chart-body">
              <LineChart data={clientOnboardingTrend} height={200} color="#1565C0" />
            </div>
          )}
        </div>

        {/* Chart 4: Withdrawal Request Trend */}
        <div className="kfpl-chart-card kfpl-chart-card--glass">
          <div className="kfpl-chart-header">
            <div>
              <div className="kfpl-chart-title">Withdrawal Request Trend</div>
              <div className="kfpl-chart-subtitle">Recent payout requests by amount</div>
            </div>
            <Badge status="gold">Requests</Badge>
          </div>
          {withdrawalTrend.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              No payout requests raised yet
            </div>
          ) : (
            <div className="kfpl-chart-body" style={{ paddingBottom: 16 }}>
              <div className="kfpl-vbar-chart">
                {withdrawalTrend.map((d, i) => {
                  const maxVal = Math.max(...withdrawalTrend.map(x => x.amount));
                  const pct = (d.amount / maxVal) * 100;
                  return (
                    <div className="kfpl-vbar-col" key={`${d.month}-${i}`}>
                      <div className="kfpl-vbar-value">{formatCurrency(d.amount)}</div>
                      <div className="kfpl-vbar-track">
                        <div
                          className={`kfpl-vbar-fill ${d.status === 'Pending' ? 'kfpl-vbar-fill--warning' : ''}`}
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                      <div className="kfpl-vbar-label">{d.month}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════ BOTTOM WIDGETS ═══════════════ */}
      <div className="kfpl-dashboard-widgets">
        {/* Widget 1: Recent Activity */}
        <div className="kfpl-chart-card">
          <div className="kfpl-chart-header">
            <div>
              <div className="kfpl-chart-title">Recent Activity</div>
              <div className="kfpl-chart-subtitle">Last 5 agent actions</div>
            </div>
          </div>
          <div className="kfpl-chart-body" style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {activities.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                No recent activity logged
              </div>
            ) : (
              <div className="kfpl-activity-feed">
                {activities.map((item, idx) => (
                  <div className="kfpl-activity-item" key={item.id || idx}>
                    <div
                      className="kfpl-activity-icon-wrap"
                      style={{ background: activityColors[item.type]?.bg || 'var(--color-border-light)', color: activityColors[item.type]?.color || 'var(--color-text-muted)' }}
                    >
                      {activityIcons[item.type] || activityIcons.info}
                    </div>
                    <div className="kfpl-activity-content">
                      <div className="kfpl-activity-text">{item.text}</div>
                      <div className="kfpl-activity-time">{item.time || new Date(item.timestamp).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Widget 2: Top Clients */}
        <div className="kfpl-chart-card">
          <div className="kfpl-chart-header">
            <div>
              <div className="kfpl-chart-title">Top Clients</div>
              <div className="kfpl-chart-subtitle">Ranked by total investment</div>
            </div>
            <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => navigate('/clients')}>View All</button>
          </div>
          <div className="kfpl-chart-body">
            {topClientsList.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                No clients registered under this agent
              </div>
            ) : (
              <div className="kfpl-widget-list">
                {topClientsList.map((cl, i) => (
                  <div className="kfpl-widget-item" key={cl.clientId || cl.id || cl._id}>
                    <div className={`kfpl-widget-rank ${i < 3 ? 'gold' : 'silver'}`}>
                      #{i + 1}
                    </div>
                    <div className="kfpl-widget-item-info">
                      <div className="kfpl-widget-item-name">{cl.name || cl.fullName}</div>
                      <div className="kfpl-widget-item-sub">{cl.clientId || 'N/A'} • <Badge status={(cl.status || 'Active') === 'Active' ? 'active' : 'inactive'}>{cl.status || 'Active'}</Badge></div>
                    </div>
                    <div className="kfpl-widget-item-value">
                      {formatCurrency(cl.totalInvestment || cl.investmentAmount || 0)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Widget 3: Rewards Milestone Status */}
        <div className="kfpl-chart-card">
          <div className="kfpl-chart-header">
            <div>
              <div className="kfpl-chart-title">Reward Milestones</div>
              <div className="kfpl-chart-subtitle">Current status & targets</div>
            </div>
            <button className="kfpl-btn kfpl-btn--ghost kfpl-btn--sm" onClick={() => navigate('/rewards')}>View All</button>
          </div>
          <div className="kfpl-chart-body">
            <div className="kfpl-widget-list">
              {rewardsList.slice(0, 5).map((reward, i) => (
                <div className="kfpl-widget-item" key={reward.id}>
                  <div className="kfpl-widget-item-info">
                    <div className="kfpl-widget-item-name">{reward.title}</div>
                    <div className="kfpl-widget-item-sub">{reward.description}</div>
                  </div>
                  <div className="kfpl-widget-item-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {reward.status === 'claimed' && <Badge status="active">Claimed</Badge>}
                    {reward.status === 'unlocked' && <Badge status="gold">Unlocked</Badge>}
                    {reward.status === 'locked' && <Badge status="inactive">Locked</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
