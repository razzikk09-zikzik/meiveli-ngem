// src/components/Sidebar.jsx
import { navItems } from '../data/mock';

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      style={{
        background: '#ffffff',
        borderRight: '1px solid #E8EDF5',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100%',
        position: 'relative',
        zIndex: 100,
      }}
    >
      {/* Sidebar Toggle Button */}
      <button
        onClick={onToggle}
        className="sidebar-toggle"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          position: 'absolute',
          top: '1.25rem',
          right: '-0.75rem',
          width: '1.5rem',
          height: '1.5rem',
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 101,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <svg
          width="0.75rem"
          height="0.75rem"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64748b"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
          }}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Logo Area */}
      <div
        style={{
          padding: collapsed ? '1.5rem 0' : '1.5rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: '0.75rem',
          borderBottom: '1px solid transparent',
          height: '4.5rem',
        }}
      >
        {/* Simple Eye Logo SVG */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="2rem" height="2rem" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 26C24.8366 26 32 16 32 16C32 16 24.8366 6 16 6C7.16344 6 0 16 0 16C0 16 7.16344 26 16 26Z"
              fill="#1D4ED8"
            />
            <circle cx="16" cy="16" r="6" fill="#EFF6FF" />
            <circle cx="16" cy="16" r="3" fill="#1E3A8A" />
          </svg>
        </div>

        {!collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span
              style={{
                fontFamily: "var(--font-head)",
                fontWeight: '800',
                fontSize: '1.25rem',
                color: '#1e293b',
                lineHeight: 1.1,
                letterSpacing: '-0.025em',
                whiteSpace: 'nowrap'
              }}
            >
              MEYVIZHI
            </span>
            <span
              style={{
                fontFamily: "var(--font-tamil)",
                fontWeight: '600',
                fontSize: '0.85rem',
                color: '#2563EB',
                lineHeight: 1.2,
                whiteSpace: 'nowrap'
              }}
            >
              மெய்விழி
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: '0.65rem',
                color: '#64748b',
                marginTop: '0.125rem',
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap'
              }}
            >
              See the scam. Trace the threat.
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav
        style={{
          flex: 1,
          padding: '1.25rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          overflowY: 'auto',
        }}
      >
        {navItems.map((item) => {
          const isActive = item.id === 'home';

          return (
            <a
              key={item.id}
              href="#"
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: '0.6875rem',
                height: '2.6rem',
                padding: collapsed ? '0' : '0 0.875rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                background: isActive ? '#E8EFFF' : 'transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {/* SVG directly instead of colored circles */}
                <svg
                  width="1.25rem"
                  height="1.25rem"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isActive ? '#2563EB' : '#475569'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={item.iconPath} />
                  {item.iconPath2 && <path d={item.iconPath2} />}
                </svg>
              </div>

              {!collapsed && (
                <span
                  style={{
                    fontFamily: "var(--font-head)",
                    fontWeight: isActive ? '700' : '600',
                    fontSize: '0.9375rem',
                    color: isActive ? '#2563EB' : '#475569',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid #E6EAF2',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
          <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="0.875rem" height="0.875rem" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
              <span className="text-ellipsis-1" style={{ fontFamily: "var(--font-head)", fontWeight: '700', fontSize: '0.8125rem', color: '#1e293b', whiteSpace: 'nowrap' }}>
                South Chennai
              </span>
              <span className="text-ellipsis-1" style={{ fontFamily: "var(--font-body)", fontSize: '0.6875rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                Community-powered safety
              </span>
            </div>
          )}
        </div>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
            <span style={{ fontSize: '0.625rem', fontWeight: '800', color: '#10B981', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>SYSTEM OPERATIONAL</span>
          </div>
        )}
      </div>
    </aside>
  );
}
