import { useState } from 'react';
import './Navbar.css';

function Navbar({ username, onLogout, currentPage, onPageChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pages = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'file-analysis', label: 'File Analysis', icon: '📁' },
    { key: 'url-analysis', label: 'URL Analysis', icon: '🔗' },
    { key: 'ip-analysis', label: 'IP Analysis', icon: '🌐' },
    { key: 'hash-lookup', label: 'Hash Lookup', icon: '#️⃣' },
    { key: 'ai-assistant', label: 'AI Assistant', icon: '🤖' },
    { key: 'threat-map', label: 'Threat Map', icon: '🗺️' },
    { key: 'history', label: 'History', icon: '📜' },
    { key: 'reports', label: 'Reports', icon: '📄' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handlePageChange = (pageKey) => {
    onPageChange(pageKey);
    setSidebarOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <div className="navbar-brand">
            <span className="brand-icon">🛡️</span>
            <span className="brand-text">CyberShield</span>
          </div>
        </div>

        <div className="navbar-right">
          <div className="user-info">
            <span className="username">{username}</span>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Navigation</h2>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>

        <ul className="sidebar-menu">
          {pages.map((page) => (
            <li key={page.key}>
              <button
                className={`menu-item ${currentPage === page.key ? 'active' : ''}`}
                onClick={() => handlePageChange(page.key)}>
                <span className="menu-icon">{page.icon}</span>
                <span className="menu-label">{page.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <p className="version">CyberShield v2.0</p>
          <p className="tagline">Threat Intelligence Platform</p>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    </>
  );
}

export default Navbar;
