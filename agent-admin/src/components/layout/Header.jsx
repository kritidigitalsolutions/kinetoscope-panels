/* ============================================================
   Component: Header.jsx
   Description: Top header bar — page title, notifications, profile
   ============================================================ */

import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { apiRequest } from '../../config/apiHelper';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/profile': 'Profile',
  '/clients': 'My Clients',
  '/commission': 'Commission',
  '/rewards': 'Rewards & Redemption',
  '/grow': 'Grow with KFPL',
  '/withdrawal': 'Withdrawal',
  '/service-requests': 'Service Requests',
  '/support': 'Support',
  '/settings': 'Settings',
};

export default function Header({ isCollapsed, onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [agentName, setAgentName] = useState(() => {
    const authData = localStorage.getItem('kfpl_agent_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const agentObj = parsed.agent || parsed.user || {};
        return agentObj.name || agentObj.fullName || 'Agent';
      } catch (e) {
        console.error('Failed to parse agent auth:', e);
      }
    }
    return 'Agent';
  });

  useEffect(() => {
    const loadAgentName = async () => {
      // 1. Initial load from local storage
      const authData = localStorage.getItem('kfpl_agent_auth');
      let currentLocalName = 'Agent';
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          const agentObj = parsed.agent || parsed.user || {};
          currentLocalName = agentObj.name || agentObj.fullName || 'Agent';
          setAgentName(currentLocalName);
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Dynamic fetch from API
      try {
        const res = await apiRequest('/api/agent/profile');
        if (res) {
          const profile = res.profile || res.agent || res.data || res;
          let freshName = profile.name || profile.fullName || currentLocalName;
          
          // Fix: If API returns generic demo name but local storage has specific name, keep local name
          if (
            (freshName.toLowerCase().includes('demo') || freshName.toLowerCase() === 'agent') &&
            currentLocalName &&
            !currentLocalName.toLowerCase().includes('demo')
          ) {
            freshName = currentLocalName;
          }

          setAgentName(freshName);

          // Update localStorage session to keep it in sync
          if (authData) {
            const parsed = JSON.parse(authData);
            parsed.agent = {
              ...(parsed.agent || {}),
              name: freshName,
              fullName: freshName
            };
            localStorage.setItem('kfpl_agent_auth', JSON.stringify(parsed));
          }
        }
      } catch (err) {
        console.warn('Failed to load fresh agent profile in header:', err);
      }
    };

    loadAgentName();
    window.addEventListener('storage', loadAgentName);
    return () => window.removeEventListener('storage', loadAgentName);
  }, []);

  const pageTitle = routeTitles[location.pathname] || 'Agent Portal';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('kfpl_agent_auth');
    window.location.href = '/login';
  };

  return (
    <header className="kfpl-header">
      <div className="kfpl-header-left">
        <button className="kfpl-header-menu-btn" onClick={onMenuClick}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <h1 className="kfpl-header-page-title">{pageTitle}</h1>
      </div>

      <div className="kfpl-header-right">
        {/* Notifications */}
        <button className="kfpl-header-icon-btn" title="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="kfpl-header-notif-dot"></span>
        </button>

        {/* Agent Profile Pill */}
        <div className="kfpl-header-agent-pill" ref={dropdownRef} onClick={() => setShowDropdown(!showDropdown)} style={{ position: 'relative' }}>
          <div className="kfpl-header-agent-pill-avatar">
            {agentName.charAt(0)}
          </div>
          <span className="kfpl-header-agent-pill-name">{agentName}</span>
          <svg className="kfpl-header-agent-pill-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>

          {showDropdown && (
            <div className="kfpl-dropdown">
              <button className="kfpl-dropdown-item" onClick={() => { navigate('/profile'); setShowDropdown(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                My Profile
              </button>
              <button className="kfpl-dropdown-item" onClick={() => { navigate('/commission'); setShowDropdown(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                Commission
              </button>
              <div className="kfpl-dropdown-divider" />
              <button className="kfpl-dropdown-item" onClick={handleLogout} style={{ color: 'var(--color-danger)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ============ END: Header.jsx ============ */
