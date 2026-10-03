import { useState } from 'react';

export default function MobileTopBar({ language, onLanguageToggle, onOpenSettings }) {
  return (
    <header
      style={{
        height: '3.5rem',
        background: '#ffffff',
        borderBottom: '1px solid #E6EAF2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
        <img src="/assets/eye-mark.png" alt="MEYVIZHI logo" style={{ width: '1.875rem', height: '1.875rem', objectFit: 'contain' }} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: '800', fontSize: '0.9375rem', color: '#1e293b', letterSpacing: '0.02em' }}>MEYVIZHI <span style={{ fontWeight: '500', color: '#2563EB' }}>மெய்விழி</span></span>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: '500', fontSize: '0.5625rem', color: '#64748b' }}>See the scam. Trace the threat.</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', borderRadius: '1.25rem', padding: '0.125rem' }}>
          <button
            onClick={() => onLanguageToggle('en')}
            style={{
              padding: '0.25rem 0.5rem', borderRadius: '1rem', border: 'none', background: language === 'en' ? '#2563EB' : 'transparent', color: language === 'en' ? '#fff' : '#64748b', fontFamily: "var(--font-head)", fontWeight: '700', fontSize: '0.75rem',
            }}
          >EN</button>
          <button
            onClick={() => onLanguageToggle('ta')}
            style={{
              padding: '0.25rem 0.5rem', borderRadius: '1rem', border: 'none', background: language === 'ta' ? '#2563EB' : 'transparent', color: language === 'ta' ? '#fff' : '#64748b', fontFamily: "var(--font-tamil)", fontWeight: '500', fontSize: '0.75rem',
            }}
          >தமிழ்</button>
        </div>
        
        <button
          onClick={onOpenSettings}
          style={{
            width: '2rem', height: '2rem', borderRadius: '50%', border: '0.09375rem solid #64748b', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer'
          }}
        >
          <svg width="0.875rem" height="0.875rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>

        <button
          style={{
            width: '2rem', height: '2rem', borderRadius: '50%', border: '0.09375rem solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', position: 'relative'
          }}
        >
          <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="#64748b"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
          <span style={{ position: 'absolute', top: '-0.125rem', right: '-0.125rem', width: '0.875rem', height: '0.875rem', borderRadius: '50%', background: '#DC2626', color: '#fff', fontSize: '0.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '0.09375rem solid #fff' }}>3</span>
        </button>
      </div>
    </header>
  );
}
