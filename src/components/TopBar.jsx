// src/components/TopBar.jsx

export default function TopBar({ language, onLanguageToggle, onOpenSettings }) {
  return (
    <header
      style={{
        height: '4.5rem',
        background: '#ffffff',
        borderBottom: '1px solid #E6EAF2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.375rem 0 1.5rem',
        flexShrink: 0,
        gap: '1rem',
        overflow: 'hidden',
      }}
    >
      {/* ── Slot 1: Welcome text (shrink-0) ── */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <h1
          style={{
            fontFamily: "var(--font-head)",
            fontWeight: '800',
            fontSize: '1.5rem',
            color: '#0f172a',
            lineHeight: 1.1,
            letterSpacing: '-0.025rem',
          }}
        >
          Welcome.
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: '0.85rem',
            color: '#64748b',
            fontWeight: '400',
          }}
        >
          Check any message in seconds, no login needed.
        </p>
      </div>

      {/* ── Slot 2: Skyline image (flex: 1) ── */}
      <div
        className="header-skyline"
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          height: '100%',
        }}
        aria-hidden="true"
      >
        <img
          src="/assets/lighthouse-skyline.png"
          alt=""
          style={{
            height: '100%',
            width: 'auto',
            objectFit: 'contain',
            objectPosition: 'right bottom',
            mixBlendMode: 'multiply',
            maskImage: 'linear-gradient(to right, transparent 0%, black 28%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 28%)',
          }}
        />
      </div>

      {/* ── Slot 3: Controls (shrink-0) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          flexShrink: 0,
        }}
      >
        {/* EN | தமிழ் toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#F1F5F9',
            borderRadius: '1.25rem',
            padding: '0.1875rem 0.25rem',
            gap: '0.125rem',
          }}
        >
          <button
            id="lang-en"
            onClick={() => onLanguageToggle('en')}
            style={{
              padding: '0.25rem 0.6875rem',
              borderRadius: '1rem',
              border: 'none',
              background: language === 'en' ? '#2563EB' : 'transparent',
              color: language === 'en' ? '#fff' : '#64748b',
              fontFamily: "var(--font-head)",
              fontWeight: '700',
              fontSize: '0.78125rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              lineHeight: '1.4',
            }}
          >
            EN
          </button>
          <span style={{ color: '#cbd5e1', fontSize: '0.8125rem' }}>|</span>
          <button
            id="lang-ta"
            onClick={() => onLanguageToggle('ta')}
            style={{
              padding: '0.25rem 0.6875rem',
              borderRadius: '1rem',
              border: 'none',
              background: language === 'ta' ? '#2563EB' : 'transparent',
              color: language === 'ta' ? '#fff' : '#64748b',
              fontFamily: "var(--font-tamil)",
              fontWeight: '500',
              fontSize: '0.78125rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              lineHeight: '1.4',
            }}
          >
            தமிழ்
          </button>
        </div>

        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            id="notification-bell"
            aria-label="Notifications"
            style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '50%',
              border: '0.09375rem solid #E2E8F0',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            {/* Bell SVG filled */}
            <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="#64748b">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </button>
          <span
            style={{
              position: 'absolute',
              top: '-0.1875rem',
              right: '-0.1875rem',
              width: '1.0625rem',
              height: '1.0625rem',
              borderRadius: '50%',
              background: '#DC2626',
              color: '#fff',
              fontSize: '0.625rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "var(--font-body)",
              border: '0.09375rem solid #fff',
            }}
          >
            3
          </span>
        </div>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.4375rem 0.9375rem',
            borderRadius: '1.25rem',
            border: '0.09375rem solid #64748b',
            background: 'transparent',
            color: '#64748b',
            fontFamily: "var(--font-head)",
            fontWeight: '700',
            fontSize: '0.78125rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {/* Settings gear icon */}
          <svg width="0.875rem" height="0.875rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          Settings
        </button>
      </div>
    </header>
  );
}
