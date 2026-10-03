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


import { useLanguage } from '../context/LanguageContext';

export default function ThreatsPage() {
  const { hotspots } = useHotspots(false);
  const { t } = useLanguage();

  // Sort hotspots by report count to show most active areas first
  const sourceThreats = [...hotspots].sort((a,b) => b.reports - a.reports);

  return (
    <div style={{ padding: '1rem', paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: '0.875rem', maxWidth: '32rem', margin: '0 auto', width: '100%' }}>
      {/* Title & Subtitle */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{t('activeThreats')}</h1>
        <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: '0.25rem' }}>{t('threatsDesc')}</p>
      </div>

      {/* Map Card */}
      <div style={{ height: '38vh', minHeight: '16rem', position: 'relative', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #E6EAF2', zIndex: 0 }}>
        <ThreatMap hotspots={hotspots} mode="citizen" />
      </div>

      {/* Campaign Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {sourceThreats.length === 0 && (
          <div style={{ background: '#fff', border: '1px dashed #CBD5E1', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            {t('noThreats')}
          </div>
        )}
        {sourceThreats.map((threat) => (
          <button
            key={threat.name}
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
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '0.9375rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {threat.latestContent || t(threat.title) || threat.title}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t(threat.title)} · {t(threat.name) || threat.name} · <span style={{ color: '#DC2626', fontWeight: '700' }}>{threat.reports} {threat.reports === 1 ? t('reportSingular') : t('reportsPlural')}</span>
              </div>
            </div>
            <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        ))}
      </div>
    </div>
  );
}
