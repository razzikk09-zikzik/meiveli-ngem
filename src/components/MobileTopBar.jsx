import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function MobileTopBar({ onOpenSettings }) {
  const { language, setLanguage } = useLanguage();
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
      <button onClick={onOpenSettings} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
        <img src="/assets/logo.png" alt="MEYVIZHI logo" style={{ height: '32px', objectFit: 'contain' }} />
      </button>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', borderRadius: '1.25rem', padding: '0.125rem' }}>
          <button
            onClick={() => setLanguage('en')}
            style={{
              padding: '0.375rem 0.625rem', borderRadius: '1rem', border: 'none', background: language === 'en' ? '#2563EB' : 'transparent', color: language === 'en' ? '#fff' : '#64748b', fontFamily: "var(--font-head)", fontWeight: '700', fontSize: '0.75rem',
            }}
          >EN</button>
          <button
            onClick={() => setLanguage('ta')}
            style={{
              padding: '0.375rem 0.625rem', borderRadius: '1rem', border: 'none', background: language === 'ta' ? '#2563EB' : 'transparent', color: language === 'ta' ? '#fff' : '#64748b', fontFamily: "var(--font-tamil)", fontWeight: '500', fontSize: '0.75rem',
            }}
          >தமிழ்</button>
        </div>


      </div>
    </header>
  );
}
