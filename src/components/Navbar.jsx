import { NavLink } from 'react-router-dom';

const links = [
  { to: '/',          icon: '⚡', label: 'Dashboard' },
  { to: '/generate',  icon: '🚀', label: 'Generate'  },
  { to: '/history',   icon: '📋', label: 'History'   },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo-icon">🧠</div>
        <span className="navbar-logo-text">YTA&nbsp;System</span>
      </div>

      <div style={{ display: 'flex', gap: '4px' }}>
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive ? 'rgba(124,58,237,0.3)' : 'transparent',
              border: isActive ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
              transition: 'all 0.2s ease',
            })}
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>

      <div className="navbar-info">
        <div className="status-dot" />
        AI Content Engine
      </div>
    </nav>
  );
}
