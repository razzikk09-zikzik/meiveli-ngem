import { useState } from 'react';

export default function MobileTopBar({ language, onLanguageToggle }) {
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
          id="analyst-access-btn"
          style={{
            width: '2rem', height: '2rem', borderRadius: '50%', border: '0.09375rem solid #7C3AED', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', cursor: 'pointer'
          }}
        >
          <svg width="0.875rem" height="0.875rem" viewBox="0 0 24 24" fill="#7C3AED">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
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
