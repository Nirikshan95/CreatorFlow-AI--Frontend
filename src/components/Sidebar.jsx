import { NavLink } from 'react-router-dom';

const sections = [
  {
    label: 'Main',
    links: [
      { to: '/', icon: 'D', label: 'Dashboard' },
      { to: '/generate', icon: 'G', label: 'Generate' },
      { to: '/channel-profiles', icon: 'P', label: 'Channel Profiles' },
      { to: '/history', icon: 'H', label: 'Content History' },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {sections.map((section) => (
        <div key={section.label}>
          <div className="sidebar-section-label">{section.label}</div>
          {section.links.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-link-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>
      ))}

      <div style={{ marginTop: 'auto', padding: '12px', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <div style={{ marginBottom: 4, fontWeight: 600 }}>YTA System v1.0</div>
        AI-powered YouTube
        <br />
        Content Strategist
      </div>
    </aside>
  );
}
