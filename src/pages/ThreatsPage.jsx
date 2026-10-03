// src/pages/ThreatsPage.jsx — active threats map + filterable list
import { useState } from 'react';
import ThreatMap from '../components/ThreatMap';
import { useHotspots } from '../hooks/useHotspots';

const THREATS_TEMPLATE = [
  { id: 1, title: 'Fake SBI KYC link', category: 'Bank KYC', area: 'Velachery', iconUrl: '/assets/bank_kyc_impersonation.png' },
  { id: 2, title: 'Courier refund SMS', category: 'Courier', area: 'Adyar', iconUrl: '/assets/courier_refund_scam.png' },
  { id: 3, title: 'Fake job offer on WhatsApp', category: 'Job offer', area: 'Sholinganallur', iconUrl: '/assets/fake_job_recruitment.png' },
  { id: 4, title: 'UPI collect request', category: 'UPI', area: 'Perungudi', iconUrl: '/assets/upi_payment.png' },
  { id: 5, title: 'Phishing SMS', category: 'Fake link', area: 'Medavakkam', iconUrl: '/assets/sms.png' },
  { id: 6, title: 'Fake delivery link', category: 'Courier', area: 'Tharamani', iconUrl: '/assets/website_url.png' },
];

const CATEGORIES = ['All', 'Bank KYC', 'Courier', 'UPI', 'Job offer', 'Fake link'];

export default function ThreatsPage() {
  const [category, setCategory] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const { hotspots } = useHotspots(false);

  // Merge hotspots with template
  const dynamicThreats = THREATS_TEMPLATE.map(t => {
    const hp = hotspots.find(h => h.name === t.area);
    return { ...t, reports: hp ? hp.reports : 0 };
  }).filter(t => t.reports > 0).sort((a,b) => b.reports - a.reports);

  // Filter by category
  const filteredList = dynamicThreats.filter(t => category === 'All' || t.category === category);

  // Filter map hotspots by category as well, and match counts exactly
  const filteredHotspots = hotspots.filter(h => {
    const t = THREATS_TEMPLATE.find(th => th.area === h.name);
    if (!t) return false;
    if (category !== 'All' && t.category !== category) return false;
    return true;
  });

  const totalCampaigns = filteredList.length;
  const topArea = filteredList.length > 0 ? filteredList[0].area : 'South Chennai';

  return (
    <div style={{ padding: '1rem', paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '32rem', margin: '0 auto', width: '100%' }}>
      {/* HEADER */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Active threats</h1>
        <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: '0.25rem' }}>What's happening in South Chennai right now.</p>
        
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F1F5F9', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', width: 'fit-content' }}>
          <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#10B981' }}></div>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#334155' }}>
            {totalCampaigns} active campaigns · {topArea} on alert
          </span>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ position: 'relative', margin: '0 -1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0 1rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  height: '48px', // 48px touch target
                  padding: '0 1rem', background: active ? '#2563EB' : '#fff', color: active ? '#fff' : '#475569',
                  borderRadius: '1.5rem', border: active ? 'none' : '1px solid #E6EAF2', fontSize: '0.8125rem',
                  fontWeight: active ? '700' : '500', whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
                  fontFamily: 'var(--font-head)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '2rem', background: 'linear-gradient(to right, transparent, #F6F8FC)', pointerEvents: 'none' }}></div>
      </div>

      {/* VIEW TOGGLE */}
      <div style={{ display: 'flex', background: '#E2E8F0', padding: '0.25rem', borderRadius: '0.75rem', width: 'fit-content' }}>
        <button
          onClick={() => { setViewMode('list'); setSelectedCampaign(null); }}
          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: viewMode === 'list' ? '#fff' : 'transparent', color: viewMode === 'list' ? '#0f172a' : '#64748b', fontWeight: '600', fontSize: '0.875rem', boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', minWidth: '5rem', cursor: 'pointer' }}
        >List</button>
        <button
          onClick={() => setViewMode('map')}
          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: viewMode === 'map' ? '#fff' : 'transparent', color: viewMode === 'map' ? '#0f172a' : '#64748b', fontWeight: '600', fontSize: '0.875rem', boxShadow: viewMode === 'map' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', minWidth: '5rem', cursor: 'pointer' }}
        >Map</button>
      </div>

      {/* CONTENT */}
      {viewMode === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredList.length === 0 && (
              <div style={{ background: '#fff', border: '1px dashed #CBD5E1', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                No threats match this filter right now. 🎉
              </div>
            )}
            {filteredList.map((t) => {
              const riskColor = t.reports >= 10 ? '#EF4444' : (t.reports >= 5 ? '#F59E0B' : '#3B82F6');
              const riskBg = t.reports >= 10 ? '#FEF2F2' : (t.reports >= 5 ? '#FFFBEB' : '#EFF6FF');
              const riskText = t.reports >= 10 ? 'High Risk' : (t.reports >= 5 ? 'Medium Risk' : 'Low Risk');
              
              return (
                <button
                  key={t.id}
                  onClick={() => { setViewMode('map'); setSelectedCampaign(t); }}
                  style={{
                    background: '#fff', border: '1px solid #E6EAF2', borderRadius: '0.875rem', padding: '0.875rem',
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem', textAlign: 'left', cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(16,24,40,0.05)', width: '100%', minHeight: '48px'
                  }}
                >
                  <img src={t.iconUrl} alt="" style={{ width: '2.75rem', height: '2.75rem', objectFit: 'contain', marginTop: '0.25rem' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '0.9375rem', color: '#0f172a' }}>{t.title}</div>
                      <span style={{ fontSize: '0.625rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>2 hrs ago</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {t.area} · <span style={{ color: '#DC2626', fontWeight: '700' }}>{t.reports} reports</span>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{ background: riskBg, color: riskColor, padding: '0.125rem 0.5rem', borderRadius: '1rem', fontSize: '0.625rem', fontWeight: '700' }}>{riskText}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Compact map preview card */}
          <div 
            onClick={() => setViewMode('map')} 
            style={{ height: '22vh', minHeight: '10rem', position: 'relative', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #E6EAF2', cursor: 'pointer', marginTop: '0.5rem' }}
          >
            <ThreatMap hotspots={filteredHotspots} mode="mobile-threats" />
            <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}></div> {/* Overlay to capture clicks */}
            <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', background: '#fff', padding: '0.375rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600', color: '#0F172A', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 11 }}>
              Tap to expand map
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '60vh', minHeight: '20rem', position: 'relative', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #E6EAF2' }}>
          <ThreatMap hotspots={filteredHotspots} mode="mobile-threats" />
          
          {/* Pinned Card */}
          {selectedCampaign && (
            <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', right: '0.5rem', zIndex: 1000 }}>
              <div style={{
                background: '#fff', border: '1px solid #E2E8F0', borderRadius: '0.75rem', padding: '0.75rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}>
                <img src={selectedCampaign.iconUrl} alt="" style={{ width: '2rem', height: '2rem', objectFit: 'contain' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '0.875rem', color: '#0f172a' }}>{selectedCampaign.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{selectedCampaign.area} · <span style={{ color: '#DC2626', fontWeight: '700' }}>{selectedCampaign.reports} reports</span></div>
                </div>
                <button onClick={() => setSelectedCampaign(null)} style={{ background: 'transparent', border: 'none', padding: '0.25rem', color: '#94A3B8' }}>×</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
