import { useState } from 'react';
import { ChevronDown, Clock3, ExternalLink, LogOut } from 'lucide-react';
import { api } from '../lib/api';

export default function TopBar({ activeLabel, session, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  async function signOut() {
    await api('/auth/logout', { method: 'POST' });
    setMenuOpen(false);
    onLogout();
  }

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>Workspace</span>
        <span className="crumb-slash">/</span>
        <span className="crumb-current">{activeLabel}</span>
      </div>

      <div className="top-actions">
        <span className="top-date"><Clock3 size={15} /> Live records</span>
        <div className="top-divider" />
        {session?.authenticated ? (
          <div className="user-menu-wrap">
            <button className="user-menu" onClick={() => setMenuOpen((open) => !open)}>
              <span className="avatar">{(session.user?.name || 'S').charAt(0).toUpperCase()}</span>
              <span className="user-copy">
                <strong>{session.user?.name || 'Salesforce user'}</strong>
                <small>{session.user?.username || 'Connected'}</small>
              </span>
              <ChevronDown size={14} />
            </button>
            {menuOpen && (
              <div className="user-popover">
                <div className="popover-email">{session.user?.email}</div>
                <button onClick={signOut}><LogOut size={15} /> Sign out</button>
              </div>
            )}
          </div>
        ) : (
          <a className="connect-button" href="/auth/login">
            <ExternalLink size={15} /> Connect Salesforce
          </a>
        )}
      </div>
    </header>
  );
}
