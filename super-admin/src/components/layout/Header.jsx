/* ============================================================
   Component: Header.jsx
   Description: Professional top bar with breadcrumb, notifications, admin profile
   ============================================================ */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// ── Route to Title & Breadcrumb Map ───────────────────────
const routeConfig = {
  '/dashboard': { title: 'Dashboard', breadcrumb: 'Overview' },
  '/investors': { title: 'Manage Clients', breadcrumb: 'Client & Agent' },
  '/investors/add': { title: 'Add New Client', breadcrumb: 'Client & Agent / Clients' },
  '/agents': { title: 'Manage Agents', breadcrumb: 'Client & Agent' },
  '/agents/add': { title: 'Add New Agent', breadcrumb: 'Client & Agent / Agents' },
  '/investments': { title: 'Manage Investments', breadcrumb: 'Investment Management' },
  '/investments/assign': { title: 'Assign Investment', breadcrumb: 'Investment Management' },
  '/roi': { title: 'Return on Investment', breadcrumb: 'Investment Management' },
  '/investment-status': { title: 'Status of Investment', breadcrumb: 'Investment Management' },
  '/perks': { title: 'Perks & Recognition', breadcrumb: 'Investment Management' },
  '/approvals': { title: 'Deposit & Withdrawal Approvals', breadcrumb: 'Operations' },
  '/approvals/history': { title: 'Approval History', breadcrumb: 'Operations / Approvals' },
  '/email-notifications': { title: 'Email Notifications', breadcrumb: 'Operations' },
  '/settings': { title: 'Settings', breadcrumb: 'Operations' },
};

function getPageConfig(pathname) {
  if (routeConfig[pathname]) return routeConfig[pathname];
  if (pathname.match(/^\/investors\/\d+\/edit/)) return { title: 'Edit Client', breadcrumb: 'Client & Agent / Clients' };
  if (pathname.match(/^\/investors\/\d+/)) return { title: 'Client Details', breadcrumb: 'Client & Agent / Clients' };
  if (pathname.match(/^\/roi\/\d+/)) return { title: 'ROI Details', breadcrumb: 'Investment Management / ROI' };
  if (pathname.match(/^\/agents\/\d+\/edit/)) return { title: 'Edit Agent', breadcrumb: 'Client & Agent / Agents' };
  if (pathname.match(/^\/agents\/\d+/)) return { title: 'Agent Details', breadcrumb: 'Client & Agent / Agents' };
  return { title: 'Super Admin', breadcrumb: '' };
}

export default function Header({ isCollapsed, onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const config = getPageConfig(location.pathname);

  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('dark-theme');
    localStorage.removeItem('kfpl_theme');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('kfpl_auth');
    navigate('/login');
  };

  return (
    <header className={`kfpl-header ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="kfpl-header-left">
        <button className="kfpl-header-hamburger" onClick={onMenuClick} aria-label="Open menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div className="kfpl-header-title-wrap">
          <h1 className="kfpl-header-title">{config.title}</h1>
          {config.breadcrumb && (
            <div className="kfpl-header-breadcrumb">
              <span>Home</span> / {config.breadcrumb}
            </div>
          )}
        </div>
      </div>

      <div className="kfpl-header-right">
        {/* Global Search */}
        <button className="kfpl-header-icon-btn" aria-label="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>

        {/* Notifications */}
        <button className="kfpl-header-icon-btn" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="kfpl-header-notification-dot"></span>
        </button>

        {/* Messages */}
        <button className="kfpl-header-icon-btn" aria-label="Messages">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>

        <div className="kfpl-header-divider"></div>

        {/* Admin Profile with Dropdown */}
        <div className="kfpl-dropdown-container" style={{ position: 'relative' }}>
          <div className="kfpl-header-profile" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="kfpl-header-avatar">SA</div>
            <div className="kfpl-header-profile-info">
              <span className="kfpl-header-profile-name">Super Admin</span>
              <span className="kfpl-header-profile-role">Administrator</span>
            </div>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              width="14"
              height="14"
              style={{
                color: 'var(--color-text-muted)',
                transform: showDropdown ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          {showDropdown && (
            <div className="kfpl-header-profile-dropdown" onMouseLeave={() => setShowDropdown(false)}>
              <div className="kfpl-dropdown-profile-header">
                <span className="kfpl-dropdown-profile-name">Super Admin</span>
                <span className="kfpl-dropdown-profile-email">admin@kfpl.com</span>
              </div>
              <div className="kfpl-dropdown-divider"></div>
              <div className="kfpl-dropdown-item" onClick={() => { setShowDropdown(false); navigate('/settings'); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Settings
              </div>
              <div className="kfpl-dropdown-item kfpl-dropdown-logout-btn" onClick={handleLogout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ============ END: Header.jsx ============ */
