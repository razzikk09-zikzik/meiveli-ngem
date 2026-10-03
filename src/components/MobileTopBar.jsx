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
        <img src="/assets/logo.png" alt="MEYVIZHI logo" style={{ height: '32px', objectFit: 'contain' }} />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', borderRadius: '1.25rem', padding: '0.125rem' }}>
          <button
            onClick={() => onLanguageToggle('en')}
            style={{
              padding: '0.375rem 0.625rem', borderRadius: '1rem', border: 'none', background: language === 'en' ? '#2563EB' : 'transparent', color: language === 'en' ? '#fff' : '#64748b', fontFamily: "var(--font-head)", fontWeight: '700', fontSize: '0.75rem',
            }}
          >EN</button>
          <button
            onClick={() => onLanguageToggle('ta')}
            style={{
              padding: '0.375rem 0.625rem', borderRadius: '1rem', border: 'none', background: language === 'ta' ? '#2563EB' : 'transparent', color: language === 'ta' ? '#fff' : '#64748b', fontFamily: "var(--font-tamil)", fontWeight: '500', fontSize: '0.75rem',
            }}
          >தமிழ்</button>
        </div>

        <button
          style={{
            width: '2.5rem', height: '2.5rem', borderRadius: '50%', border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', position: 'relative'
          }}
        >
          <svg width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="#64748b"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-1.5-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
          <span style={{ position: 'absolute', top: '0', right: '0', width: '0.875rem', height: '0.875rem', borderRadius: '50%', background: '#DC2626', color: '#fff', fontSize: '0.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fff' }}>3</span>
        </button>
      </div>
    </header>
  );
}
