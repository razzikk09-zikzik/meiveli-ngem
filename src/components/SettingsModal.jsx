import { useState, useEffect } from 'react';

export default function SettingsModal({ onClose }) {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('MEYVIZHI_GEMINI_API_KEY');
    if (saved) {
      setApiKey(saved);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('MEYVIZHI_GEMINI_API_KEY', apiKey.trim());
    } else {
      localStorage.removeItem('MEYVIZHI_GEMINI_API_KEY');
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '1rem',
        width: '100%',
        maxWidth: '24rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        padding: '1.5rem',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '2rem',
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <svg width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem' }}>Settings</h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>Set your Gemini API key to run analysis entirely locally.</p>

        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>Gemini API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="AIza..."
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #CBD5E1',
            background: '#F8FAFC',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            outline: 'none',
            marginBottom: '1.5rem'
          }}
        />

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', background: '#fff', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: '#2563EB', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}
