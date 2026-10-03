// src/pages/ThreatsPage.jsx — active threats map + filterable list
import { useState } from 'react';
import ThreatMap from '../components/ThreatMap';
import { useHotspots } from '../hooks/useHotspots';

const THREATS_TEMPLATE = [
  { id: 1, title: 'Fake SBI KYC link', category: 'Bank KYC', area: 'Velachery', iconUrl: '/assets/bank_kyc_impersonation.png', color: '#DC2626', bg: '#FEF2F2' },
  { id: 2, title: 'Courier refund SMS', category: 'Courier', area: 'Adyar', iconUrl: '/assets/courier_refund_scam.png', color: '#EA580C', bg: '#FFF7ED' },
  { id: 3, title: 'Fake job offer on WhatsApp', category: 'Job offer', area: 'Sholinganallur', iconUrl: '/assets/fake_job_recruitment.png', color: '#D97706', bg: '#FFFBEB' },
  { id: 4, title: 'UPI collect request', category: 'UPI', area: 'Perungudi', iconUrl: '/assets/upi_payment.png', color: '#9333EA', bg: '#F5F3FF' },
  { id: 5, title: 'Phishing SMS', category: 'Fake link', area: 'Medavakkam', iconUrl: '/assets/sms.png', color: '#2563EB', bg: '#EFF6FF' },
  { id: 6, title: 'Fake delivery link', category: 'Courier', area: 'Tharamani', iconUrl: '/assets/website_url.png', color: '#0D9488', bg: '#F0FDFA' },
];

const CATEGORIES = ['All', 'Bank KYC', 'Courier', 'UPI', 'Job offer', 'Fake link'];

import { useLanguage } from '../context/LanguageContext';

export default function ThreatsPage() {
  const [category, setCategory] = useState('All');
  const { hotspots } = useHotspots(false);
  const { t } = useLanguage();

  // Merge hotspots with template so counts match everywhere
  const dynamicThreats = THREATS_TEMPLATE.map(threat => {
    const hp = hotspots.find(h => h.name === threat.area);
    return { ...threat, reports: hp ? hp.reports : 0 };
  }).filter(threat => threat.reports > 0).sort((a,b) => b.reports - a.reports);

  // Fallback to template if no real reports, for empty state UI purposes if desired
  // But the requirement says "Counts: markers, map labels and cards must all use the same data source"
  // So if there are no reports, it will be empty.
  const sourceThreats = dynamicThreats.length > 0 ? dynamicThreats : THREATS_TEMPLATE.map(threat => ({...threat, reports: 0}));

  // Filter map hotspots by category as well, and match counts exactly
  const filteredHotspots = hotspots.filter(h => {
    const t = THREATS_TEMPLATE.find(th => th.area === h.name);
    if (!t) return false;
    if (category !== 'All' && t.category !== category) return false;
    return true;
  });

  const filtered = sourceThreats.filter(
    (threat) => (category === 'All' || threat.category === category)
  );

  return (
    <div style={{ padding: '1rem', paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: '0.875rem', maxWidth: '32rem', margin: '0 auto', width: '100%' }}>
      {/* Title & Subtitle */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{t('activeThreats')}</h1>
        <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: '0.25rem' }}>{t('threatsDesc')}</p>
      </div>

      {/* Scam-type chip row */}
      <div style={{ position: 'relative', margin: '0 -1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0 1rem', paddingBottom: '0.25rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  padding: '0.375rem 0.875rem', background: active ? '#2563EB' : '#fff', color: active ? '#fff' : '#475569',
                  borderRadius: '1rem', border: active ? 'none' : '1px solid #E6EAF2', fontSize: '0.8125rem',
                  fontWeight: active ? '700' : '500', whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
                  fontFamily: 'var(--font-head)',
                }}
              >
                {c === 'All' ? t('all') : c}
              </button>
            );
          })}
        </div>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: '0.25rem', width: '2rem', background: 'linear-gradient(to right, transparent, #F6F8FC)', pointerEvents: 'none' }}></div>
      </div>

      {/* Map Card */}
      <div style={{ height: '38vh', minHeight: '16rem', position: 'relative', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #E6EAF2', zIndex: 0 }}>
        <ThreatMap hotspots={filteredHotspots} mode="citizen" />
      </div>

      {/* Campaign Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {filtered.length === 0 && (
          <div style={{ background: '#fff', border: '1px dashed #CBD5E1', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            {t('noThreats')}
          </div>
        )}
        {filtered.map((threat) => (
          <button
            key={threat.id}
            style={{
              background: '#fff', border: '1px solid #E6EAF2', borderRadius: '0.875rem', padding: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left', cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(16,24,40,0.05)', width: '100%',
            }}
          >
            <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '50%', background: threat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src={threat.iconUrl} alt="" style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '0.9375rem', color: '#0f172a' }}>{threat.title}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }}>
                {threat.area} · <span style={{ color: '#DC2626', fontWeight: '700' }}>{threat.reports} {threat.reports === 1 ? t('reportSingular') : t('reportsPlural')}</span>
              </div>
            </div>
            <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        ))}
      </div>
    </div>
  );
}
