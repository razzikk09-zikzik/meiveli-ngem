// src/pages/ThreatsPage.jsx — active threats map + filterable list
import { useState } from 'react';
import ThreatMap from '../components/ThreatMap';
import { useHotspots } from '../hooks/useHotspots';

const THREATS = [
  { id: 1, title: 'Fake SBI KYC link', category: 'Bank KYC', area: 'Velachery', reports: 14, iconUrl: '/assets/bank_kyc_impersonation.png', color: '#DC2626', bg: '#FEF2F2' },
  { id: 2, title: 'Courier refund SMS', category: 'Courier', area: 'Adyar', reports: 8, iconUrl: '/assets/courier_refund_scam.png', color: '#EA580C', bg: '#FFF7ED' },
  { id: 3, title: 'Fake job offer on WhatsApp', category: 'Job offer', area: 'Sholinganallur', reports: 5, iconUrl: '/assets/fake_job_recruitment.png', color: '#D97706', bg: '#FFFBEB' },
  { id: 4, title: 'UPI collect request', category: 'UPI', area: 'Perungudi', reports: 4, iconUrl: '/assets/upi_payment.png', color: '#9333EA', bg: '#F5F3FF' },
  { id: 5, title: 'Phishing SMS', category: 'Fake link', area: 'Medavakkam', reports: 3, iconUrl: '/assets/sms.png', color: '#2563EB', bg: '#EFF6FF' },
  { id: 6, title: 'Fake delivery link', category: 'Courier', area: 'Tharamani', reports: 2, iconUrl: '/assets/website_url.png', color: '#0D9488', bg: '#F0FDFA' },
];

const CATEGORIES = ['All', 'Bank KYC', 'Courier', 'UPI', 'Job offer', 'Fake link'];
const AREAS = ['All areas', 'Velachery', 'Adyar', 'Sholinganallur', 'Perungudi', 'Medavakkam', 'Tharamani'];
const TIMES = ['Last 7 days', 'Last 24 hours', 'Last 30 days'];

const selectStyle = {
  appearance: 'none', padding: '0.375rem 1.75rem 0.375rem 0.75rem', borderRadius: '1rem',
  border: '1px solid #E6EAF2', background: '#fff', fontFamily: 'var(--font-body)',
  fontSize: '0.8125rem', fontWeight: '600', color: '#334155', outline: 'none',
  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'3\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")',
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center',
};

export default function ThreatsPage() {
  const [category, setCategory] = useState('All');
  const [area, setArea] = useState('All areas');
  const [time, setTime] = useState('Last 7 days');
  const { hotspots } = useHotspots(false);

  const filtered = THREATS.filter(
    (t) => (category === 'All' || t.category === category) && (area === 'All areas' || t.area === area),
  );

  return (
    <div style={{ padding: '1rem', paddingBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', maxWidth: '32rem', margin: '0 auto', width: '100%' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Active threats</h1>
        <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: '0.25rem' }}>What's happening in South Chennai right now.</p>
      </div>

      {/* Area + time dropdowns */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <select value={area} onChange={(e) => setArea(e.target.value)} style={selectStyle} aria-label="Filter by area">
          {AREAS.map((a) => <option key={a}>{a}</option>)}
        </select>
        <select value={time} onChange={(e) => setTime(e.target.value)} style={selectStyle} aria-label="Filter by time">
          {TIMES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
              {c}
            </button>
          );
        })}
      </div>

      {/* Map */}
      <div style={{ height: '38vh', minHeight: '16rem', position: 'relative', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #E6EAF2', zIndex: 0 }}>
        <ThreatMap hotspots={hotspots} mode="citizen" />
      </div>

      {/* Threat list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {filtered.length === 0 && (
          <div style={{ background: '#fff', border: '1px dashed #CBD5E1', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            No threats match this filter right now. 🎉
          </div>
        )}
        {filtered.map((t) => (
          <button
            key={t.id}
            style={{
              background: '#fff', border: '1px solid #E6EAF2', borderRadius: '0.875rem', padding: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left', cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(16,24,40,0.05)', width: '100%',
            }}
          >
            <img src={t.iconUrl} alt="" style={{ width: '2.75rem', height: '2.75rem', objectFit: 'contain' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '0.9375rem', color: '#0f172a' }}>{t.title}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }}>
                {t.area} · <span style={{ color: '#DC2626', fontWeight: '700' }}>{t.reports} reports</span>
              </div>
            </div>
            <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        ))}
      </div>
    </div>
  );
}
