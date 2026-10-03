// src/pages/ReportPage.jsx — 3-step report flow: Type → Details → Done
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportTiles } from '../data/mock';
import { supabase } from '../utils/supabase';
import { buildDomainIntelligence } from '../utils/domainAnalyzer';

const AREAS = [
  'South Chennai', 'Velachery', 'Adyar', 'Sholinganallur', 'Perungudi',
  'Medavakkam', 'Tharamani', 'Pallavaram', 'Tambaram',
];

import { useLanguage } from '../context/LanguageContext';

function Stepper({ step, onStepClick }) {
  const { t } = useLanguage();
  const steps = [t('stepType'), t('stepDetails'), t('stepDone')];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', padding: '0.25rem 0.5rem 0' }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        const color = done ? '#16A34A' : active ? '#2563EB' : '#94A3B8';
        const bg = done ? '#DCFCE7' : active ? '#2563EB' : '#E2E8F0';
        return (
          <div key={label} style={{ flex: done || active || n === 1 ? 1 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {i > 0 && (
              <div style={{ position: 'absolute', top: '1rem', right: '50%', width: '100%', height: '2px', background: step >= n ? '#2563EB' : '#E2E8F0', transform: 'translateY(-50%)', zIndex: 0 }} />
            )}
            <button
              onClick={() => onStepClick && onStepClick(n)}
              style={{
                position: 'relative', zIndex: 1, width: '2rem', height: '2rem', borderRadius: '50%',
                background: bg, color: active ? '#fff' : color, border: 'none',
                fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: n < step ? 'pointer' : 'default',
              }}
            >
              {done ? '✓' : n}
            </button>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: '0.75rem', fontWeight: active ? '700' : '500', color: active ? '#2563EB' : '#64748b', marginTop: '0.25rem' }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ReportPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [type, setType] = useState(null);
  const [message, setMessage] = useState('');
  const [lostMoney, setLostMoney] = useState(null);
  const [area, setArea] = useState('South Chennai');
  const [reportId, setReportId] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const submit = async () => {
    if (!message || message.trim() === '') {
      setErrorMsg(t('provideDetails'));
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg(null);

    // 1. Run local domain intelligence
    const intel = buildDomainIntelligence(message);
    
    // Check if the report contains a strictly verified official domain
    const hasTrustedDomain = intel.some(d => d.trusted && !d.signals.brandMismatch);
    
    const classification = hasTrustedDomain ? 'Safe' : 'Suspicious';
    const status = hasTrustedDomain ? 'auto_rejected' : 'pending';

    // Generate a random ID for the UI
    const randomId = `MV-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // 2. Insert into Supabase
    try {
      const { error } = await supabase.from('reports').insert([{
        type: type || 'other',
        content: message,
        area: area,
        classification: classification,
        status: status,
      }]);

      if (error) throw error;

      setReportId(randomId);
      setStep(3);
    } catch (e) {
      console.error(e);
      setErrorMsg(t('failSubmit'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionTitle = { fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '0.9375rem', color: '#0f172a', marginBottom: '0.625rem' };
  const chip = (selected) => ({
    flex: 1, padding: '0.625rem', borderRadius: '0.625rem', border: `1px solid ${selected ? '#2563EB' : '#E6EAF2'}`,
    background: selected ? '#EFF6FF' : '#fff', color: selected ? '#2563EB' : '#475569',
    fontFamily: 'var(--font-head)', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', textAlign: 'center',
  });

  return (
    <div style={{ padding: '1rem', paddingBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '32rem', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button onClick={() => (step === 1 ? navigate(-1) : setStep(step - 1))} style={{ background: 'none', border: 'none', padding: '0.25rem', cursor: 'pointer', display: 'flex' }} aria-label="Back">
          <svg width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.125rem', fontWeight: '800', color: '#0f172a' }}>{t('reportTitle')}</h1>
      </div>

      <Stepper step={step} onStepClick={(n) => n < step && setStep(n)} />

      {step === 1 && (
        <>
          <div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{t('reportTitle')}</h2>
            <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: '0.25rem' }}>{t('reportDesc')}</p>
          </div>

          <div>
            <h3 style={sectionTitle}>{t('whatType')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
              {reportTiles.map((tile) => {
                const selected = type === tile.id;
                return (
                  <button
                    key={tile.id}
                    onClick={() => { setType(tile.id); setStep(2); }}
                    style={{
                      background: selected ? '#EFF6FF' : '#fff', border: `1.5px solid ${selected ? '#2563EB' : '#E6EAF2'}`,
                      borderRadius: '0.75rem', padding: '0.875rem 0.375rem', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                  >
                    <img src={tile.iconUrl} alt="" style={{ width: '2.375rem', height: '2.375rem', objectFit: 'contain' }} />
                    <span style={{ fontFamily: 'var(--font-head)', fontWeight: '600', fontSize: '0.75rem', color: '#0f172a', textAlign: 'center', lineHeight: 1.25 }}>{t(tile.id) || tile.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{t('reportTitle')}</h2>
            <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: '0.25rem' }}>{t('reportDesc')}</p>
          </div>

          <div>
            <h3 style={sectionTitle}>{t('pasteLabel')}</h3>
            <div style={{ background: '#fff', border: '1px solid #E6EAF2', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                placeholder="Sir ungali SBI account block aagidum. Irga click pannunga: sbi-kyc-update.in/verify"
                style={{ width: '100%', minHeight: '5.5rem', border: 'none', background: 'transparent', resize: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 'max(16px, 0.875rem)', color: '#1e293b' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button style={{ padding: '0.375rem', background: '#F1F5F9', border: 'none', borderRadius: '0.25rem', display: 'flex' }} aria-label="Attach screenshot">
                  <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                </button>
                <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{message.length}/1000</span>
              </div>
            </div>
          </div>

          <div>
            <h3 style={sectionTitle}>{t('loseMoney')}</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['no', 'almost', 'yes'].map((optKey) => (
                <button key={optKey} onClick={() => setLostMoney(optKey)} style={chip(lostMoney === optKey)}>{t(optKey)}</button>
              ))}
            </div>
          </div>

          <div>
            <h3 style={sectionTitle}>{t('whereHappen')}</h3>
            <div style={{ position: 'relative' }}>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                style={{ width: '100%', appearance: 'none', padding: '0.75rem 2.5rem 0.75rem 2.5rem', borderRadius: '0.625rem', border: '1px solid #E6EAF2', background: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#0f172a', outline: 'none' }}
              >
                {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <svg style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <svg style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>

          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '0.625rem', padding: '0.75rem', display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
            <svg width="1.125rem" height="1.125rem" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" style={{ flexShrink: 0 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <p style={{ fontSize: '0.8125rem', color: '#166534', lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: t('anonymous') }} />
          </div>
          
          {errorMsg && (
            <div style={{ color: '#DC2626', fontSize: '0.875rem', textAlign: 'center', fontWeight: '500' }}>
              {errorMsg}
            </div>
          )}

          <button
            onClick={submit}
            disabled={isSubmitting}
            style={{
              width: '100%', padding: '0.875rem', borderRadius: '2rem', border: 'none',
              background: 'linear-gradient(90deg, #1D6FF2 0%, #7C5CF5 100%)', color: '#fff',
              fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(29, 111, 242, 0.25)', cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? (
               <span>{t('submitting')}</span>
            ) : (
              <>
                <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                {t('submitReport')}
              </>
            )}
          </button>
        </>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem 1rem', gap: '0.75rem' }}>
          <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="2.25rem" height="2.25rem" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.375rem', fontWeight: '800', color: '#0f172a' }}>{t('thanks')}</h2>
          <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.5 }}>
            {t('reportReceivedPart1')}<strong style={{ color: '#2563EB' }}>{reportId}</strong>{t('reportReceivedPart2')}
          </p>
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '0.625rem', padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#1e40af', marginTop: '0.25rem' }} dangerouslySetInnerHTML={{ __html: t('call1930') }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', width: '100%', marginTop: '0.75rem' }}>
            <button
              onClick={() => navigate('/')}
              style={{ width: '100%', padding: '0.875rem', borderRadius: '2rem', border: 'none', background: 'linear-gradient(90deg, #1D6FF2 0%, #7C5CF5 100%)', color: '#fff', fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '0.9375rem', cursor: 'pointer' }}
            >
              {t('backHome')}
            </button>
            <button
              onClick={() => { setType(null); setMessage(''); setLostMoney(null); setReportId(null); setStep(1); }}
              style={{ width: '100%', padding: '0.875rem', borderRadius: '2rem', border: '1px solid #E6EAF2', background: '#fff', color: '#334155', fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '0.9375rem', cursor: 'pointer' }}
            >
              {t('reportAnother')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
