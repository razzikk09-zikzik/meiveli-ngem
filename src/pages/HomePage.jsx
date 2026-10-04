import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreatMap from '../components/ThreatMap';
import { useHotspots } from '../hooks/useHotspots';
import { reportTiles, scamCards } from '../data/mock';
import { useLanguage } from '../context/LanguageContext';

export default function HomePage() {
  const [text, setText] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [supportsSpeech] = useState('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { t, language } = useLanguage();
  const [area, setArea] = useState('Velachery'); // default selected area
  const [alertIndex, setAlertIndex] = useState(0);
  const navigate = useNavigate();
  const { hotspots, reports } = useHotspots(false);

  // Compute top threats (grouping web by domain, SMS by exact text)
  const threatGroups = {};
  reports.forEach(r => {
    // Exclude Safe reports, but include Scam, Suspicious, and Pending to match dashboard counts
    if (r.classification === 'Safe') return;
    let key = (r.content || '').trim();
    if (!key) return;
    
    let isWeb = r.type === 'web' || key.startsWith('http');
    if (isWeb) {
      try { key = new URL(key.startsWith('http') ? key : `https://${key}`).hostname; } catch(e){}
    }
    
    if (!threatGroups[key]) {
      threatGroups[key] = { id: key, content: key, isWeb, count: 0 };
    }
    threatGroups[key].count += 1;
  });
  
  const topThreats = Object.values(threatGroups)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Auto-slide for Recent Alerts carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setAlertIndex((prev) => {
        if (topThreats.length === 0) return 0;
        return prev === topThreats.length - 1 ? 0 : prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [topThreats.length]);

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'en' ? 'en-US' : language === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event) => {
      setText((prev) => (prev + ' ' + event.results[0][0].transcript).trim());
    };
    recognition.start();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submit = () => {
    if (text.trim() || imageBase64) {
      navigate('/result', { state: { text, imageBase64, area } });
    }
  };

  const cardStyle = {
    background: '#ffffff',
    border: '1px solid #E6EAF2',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(16,24,40,0.05)',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  };

  const alertThemes = [
    { cardBg: '#FEF2F2', cardBorder: '#FECACA', iconBg: '#FEE2E2', iconColor: '#DC2626', badgeBg: '#FEE2E2', badgeColor: '#DC2626' },
    { cardBg: '#EFF6FF', cardBorder: '#BFDBFE', iconBg: '#E0E7FF', iconColor: '#4F46E5', badgeBg: '#E0E7FF', badgeColor: '#4F46E5' },
    { cardBg: '#F0FDF4', cardBorder: '#BBF7D0', iconBg: '#DCFCE7', iconColor: '#16A34A', badgeBg: '#DCFCE7', badgeColor: '#16A34A' },
    { cardBg: '#FFF9F0', cardBorder: '#FEF08A', iconBg: '#FEF3C7', iconColor: '#D97706', badgeBg: '#FEF3C7', badgeColor: '#D97706' },
  ];

  const renderMobile = () => {
    const currentTheme = alertThemes[alertIndex % alertThemes.length];
    
    return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 1. Heading */}
      <div style={{ padding: '0.5rem 0' }}>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{t('checkStaySafe')}</h1>
        <p style={{ color: '#475569', fontSize: '0.9375rem', marginTop: '0.25rem' }}>{t('stopScams')}</p>
      </div>

      {/* 2. Input Card */}
      <div style={{ ...cardStyle, padding: '0.75rem', gap: '0.5rem' }}>
        {imageBase64 && (
          <div style={{ position: 'relative', width: 'fit-content' }}>
            <img src={imageBase64} alt="Upload preview" style={{ height: '4rem', borderRadius: '0.25rem', objectFit: 'cover' }} />
            <button onClick={() => setImageBase64(null)} style={{ position: 'absolute', top: '-0.25rem', right: '-0.25rem', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '1rem', height: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', cursor: 'pointer' }}>×</button>
          </div>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('placeholder')}
          style={{
            width: '100%',
            minHeight: '7rem',
            border: 'none',
            background: 'transparent',
            fontFamily: "var(--font-body)",
            fontSize: 'max(16px, 0.875rem)',
            color: '#1e293b',
            resize: 'none',
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <label style={{ padding: '0.5rem 0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', transition: 'background-color 0.2s' }}>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              <svg width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 600 }}>{t('uploadImage')}</span>
            </label>
          </div>
          <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{text.length}/1000</span>
        </div>
      </div>

      {/* 3. Removed Language & Area Chips per user request */}

      {/* 4. Check Now Button */}
      <button
        onClick={submit}
        style={{
          width: '100%',
          padding: '0.875rem',
          borderRadius: '2rem',
          border: 'none',
          background: 'linear-gradient(90deg, #1D6FF2 0%, #7C5CF5 100%)',
          color: '#fff',
          fontFamily: "var(--font-head)",
          fontWeight: '700',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(29, 111, 242, 0.25)',
        }}
      >
        <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        {t('checkScam')}
      </button>



      {/* 6. Recent Alerts Card */}
      <div style={{ ...cardStyle, marginTop: '0.25rem' }}>
        <div style={{ padding: '0.375rem 0.625rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <svg width="1.125rem" height="1.125rem" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <h2 style={{ fontFamily: "var(--font-head)", fontWeight: '800', fontSize: '0.875rem', color: '#0f172a' }}>{t('recentAlerts')}</h2>
          </div>
          <button onClick={() => navigate('/threats')} style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600, background: 'none', border: 'none' }}>{t('viewAll')}</button>
        </div>
        
        {/* Carousel Content */}
        <div style={{ position: 'relative', background: currentTheme.cardBg, padding: '0.375rem 0.5rem', margin: '0 0.375rem 0.375rem', borderRadius: '0.5rem', border: `1px solid ${currentTheme.cardBorder}`, transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
          {topThreats.length > 0 ? (
            <>
              {/* Navigation Arrows */}
              <button 
                onClick={() => setAlertIndex(prev => prev === 0 ? topThreats.length - 1 : prev - 1)}
                style={{ position: 'absolute', left: '0.125rem', top: '45%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', borderRadius: '50%', background: '#fff', border: '1px solid #E6EAF2', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
              >
                <svg width="0.75rem" height="0.75rem" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button 
                onClick={() => setAlertIndex(prev => prev === topThreats.length - 1 ? 0 : prev + 1)}
                style={{ position: 'absolute', right: '0.125rem', top: '45%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', borderRadius: '50%', background: '#fff', border: '1px solid #E6EAF2', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
              >
                <svg width="0.75rem" height="0.75rem" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

              {/* Slide Content */}
              <div style={{ padding: '0 0.875rem', overflow: 'hidden' }}>
                <div key={alertIndex} className="animate-slide-right" style={{ display: 'flex', gap: '0.375rem' }}>
                  <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem', background: currentTheme.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {alertIndex % 2 === 0 ? (
                      <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke={currentTheme.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2" ry="2"/><path d="M12 14v4"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                    ) : (
                      <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke={currentTheme.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.125rem' }}>
                      <span style={{ color: currentTheme.badgeColor, fontSize: '0.5rem', fontWeight: 800, background: currentTheme.badgeBg, padding: '0.125rem 0.25rem', borderRadius: '1rem', textTransform: 'uppercase' }}>{topThreats[alertIndex].isWeb ? t('scam') : t('suspicious')}</span>
                      <span style={{ fontSize: '0.5625rem', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.125rem', fontWeight: 600 }}>
                        <svg width="0.6875rem" height="0.6875rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                        {topThreats[alertIndex].count} {topThreats[alertIndex].count === 1 ? t('reportSingular') : t('reportsPlural')}
                      </span>
                    </div>
                    <div style={{ fontFamily: "var(--font-head)", fontWeight: '800', fontSize: '0.8125rem', color: '#0f172a', lineHeight: 1.1, marginBottom: '0.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {topThreats[alertIndex].content}
                    </div>
                    <div style={{ fontSize: '0.625rem', color: '#475569', lineHeight: 1.2, marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {topThreats[alertIndex].isWeb ? t('phishingLink') : t('suspiciousSMS')}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', color: '#64748b', fontSize: '0.5625rem' }}>
                        <svg width="0.5625rem" height="0.5625rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {t('activeThreats')}
                      </div>
                      <div style={{ fontSize: '0.5625rem', color: '#64748b', fontWeight: 600 }}>{alertIndex + 1} / {topThreats.length}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.1875rem', marginTop: '0.375rem' }}>
                {Array.from({ length: topThreats.length }).map((_, i) => (
                  <div key={i} style={{ width: '0.25rem', height: '0.25rem', borderRadius: '50%', background: i === alertIndex ? '#3B82F6' : '#CBD5E1' }} />
                ))}
              </div>
            </>
          ) : (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>
              {t('noThreats')}
            </div>
          )}
        </div>
      </div>

      {/* 7. Tamil Nadu Police Awareness Video Card */}
      <div style={{ ...cardStyle, marginTop: '0.375rem' }}>
        <div style={{ padding: '0.625rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/assets/TNPOLICELOGO.png" alt="TN Police Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "var(--font-head)", fontWeight: '800', fontSize: '0.9375rem', color: '#0f172a' }}>{t('tnPoliceAwareness')}</h2>
              <p style={{ fontSize: '0.6875rem', color: '#475569' }}>{t('learnHowToAvoid')}</p>
            </div>
          </div>
          <button onClick={() => navigate('/guide')} style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600, background: 'none', border: 'none' }}>{t('viewMore')}</button>
        </div>
        
        <div style={{ padding: '0 1rem 1rem' }}>
          <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '0.5rem', overflow: 'hidden', background: '#000', marginBottom: '0.75rem' }}>
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/kdgS_eGopio?rel=0" 
              title="Tamil Nadu Police Awareness" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <svg width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '0.125rem' }}><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            <div>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: '700', fontSize: '0.875rem', color: '#0f172a' }}>{t('howToAvoid')}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('tnPoliceDept')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  };

  const renderDesktop = () => (
    <div style={{ display: 'contents' }}>
      {/* ══ ROW 1: Input card + Map card ══ */}
      <div className="top-row-flex" style={{ display: 'flex', gap: '0.75rem', minHeight: 0 }}>
        
        {/* ── Left: Is this suspicious? ── */}
        <div style={{ ...cardStyle, flex: 1, position: 'relative' }}>
          {/* Header */}
          <div style={{ display: 'flex', gap: '0.875rem', padding: '1.25rem 1.25rem 0.5rem', background: '#fff' }}>
            <div
              style={{
                width: '1.5rem',
                height: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '0.125rem'
              }}
            >
              <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <div>
              <h2 style={{ fontFamily: "var(--font-head)", fontWeight: '800', fontSize: '1.25rem', color: '#0f172a' }}>
                {t('checkStaySafe')}
              </h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: '0.8125rem', color: '#64748b' }}>
                {t('stopScams')}
              </p>
            </div>
          </div>

          <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {/* Textarea Area */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #E6EAF2',
                borderRadius: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: '6rem',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#93C5FD'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E6EAF2'}
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('placeholder')}
                style={{
                  flex: 1,
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  padding: '0.75rem 0.875rem',
                  fontFamily: "var(--font-body)",
                  fontSize: 'max(16px, 0.875rem)',
                  color: '#1e293b',
                  resize: 'none',
                  outline: 'none',
                }}
              />
              <div style={{ padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E6EAF2' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <label style={{ padding: '0.375rem 0.625rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', transition: 'background-color 0.2s' }}>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    <svg width="1.125rem" height="1.125rem" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>{t('uploadImage')}</span>
                  </label>
                </div>
                <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{text.length}/1000</span>
              </div>
            </div>
            
            {imageBase64 && (
              <div style={{ position: 'relative', width: 'fit-content' }}>
                <img src={imageBase64} alt="Upload preview" style={{ height: '4rem', borderRadius: '0.25rem', objectFit: 'cover', border: '1px solid #E6EAF2' }} />
                <button onClick={() => setImageBase64(null)} style={{ position: 'absolute', top: '-0.25rem', right: '-0.25rem', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '1rem', height: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', cursor: 'pointer' }}>×</button>
              </div>
            )}

            <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: '#475569' }}>
              Supports <span style={{ fontFamily: "var(--font-tamil)" }}>தமிழ்</span> · English · Tanglish · Private by default, nothing stored unless you report.
            </div>

            {/* Examples */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Try an example:</span>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {['Bank KYC', 'Courier', 'UPI', 'Electricity', 'Job scam'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setText(tag + " msg... ")}
                    style={{
                      padding: '0.25rem 0.625rem',
                      background: '#fff',
                      border: '1px solid #E6EAF2',
                      borderRadius: '1rem',
                      fontSize: '0.8125rem',
                      color: '#334155',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#93C5FD'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E6EAF2'}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>Area:</span>
              <select value={area} onChange={e => setArea(e.target.value)} style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.8125rem', fontWeight: 600, outline: 'none' }}>
                {Object.keys(hotspots.length ? hotspots.reduce((acc,h)=>({...acc,[h.name]:1}),{}) : {'Velachery':1,'Sholinganallur':1,'Adyar':1,'Perungudi':1,'Medavakkam':1,'Tharamani':1}).map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <button
              onClick={submit}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '2rem',
                border: 'none',
                background: 'linear-gradient(90deg, #1D6FF2 0%, #7C5CF5 100%)',
                color: '#fff',
                fontFamily: "var(--font-head)",
                fontWeight: '700',
                fontSize: '0.9375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                boxShadow: '0 4px 12px rgba(29, 111, 242, 0.25)',
                flexShrink: 0,
              }}
            >
              {t('checkNow')}
              <svg width="0.875rem" height="0.875rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        {/* ── Right: Map Card ── */}
        <div className="map-card-wrapper" style={{ ...cardStyle, flex: 1, padding: '1rem 1.25rem', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <h2 style={{ fontFamily: "var(--font-head)", fontWeight: '700', fontSize: '1.125rem', color: '#0f172a' }}>
                Scams reported near you
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: '#16A34A', fontWeight: '600' }}>
              <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: '#16A34A' }} />
              Updated 5 min ago
            </div>
          </div>

          <div
            style={{
              background: '#FFF7E6',
              border: '1px solid #FDE68A',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
              <svg width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: '800', fontSize: '0.9375rem', color: '#DC2626' }}>
                  Active scam campaign reported
                </div>
                <div className="text-ellipsis-1" style={{ fontFamily: "var(--font-body)", fontSize: '0.8125rem', color: '#475569' }}>
                  in Velachery, 14 reports this week.
                </div>
              </div>
            </div>
            <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>

          <div style={{ flex: 1, minHeight: 0, position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #E6EAF2' }}>
            <ThreatMap hotspots={hotspots} mode="citizen" />
          </div>
        </div>
      </div>

      {/* ══ ROW 2: Report a scam ══ */}
      <div style={{ ...cardStyle, padding: '0.75rem 1rem', gap: '0.75rem', flexShrink: 0, marginTop: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <h2 style={{ fontFamily: "var(--font-head)", fontWeight: '800', fontSize: '1.125rem', color: '#0f172a', lineHeight: 1 }}>
            Report a scam
          </h2>
          <span style={{ fontSize: '0.875rem', color: '#475569', marginLeft: '0.25rem' }}>What did you receive?</span>
        </div>

        <div className="report-tiles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {reportTiles.map(tile => (
              <button
                key={tile.id}
                style={{
                  background: '#fff',
                  border: '1px solid #E6EAF2',
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  height: '5rem',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(37,99,235,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E6EAF2'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <img src={tile.iconUrl} alt={tile.label} style={{ width: '1.875rem', height: '1.875rem', objectFit: 'contain' }} />
                <span style={{ fontFamily: "var(--font-head)", fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{t(tile.id) || tile.label}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* ══ ROW 3: Common Scams ══ */}
      <div style={{ ...cardStyle, padding: '0.75rem 1rem', gap: '0.75rem', flexShrink: 0, marginTop: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>
            <h2 style={{ fontFamily: "var(--font-head)", fontWeight: '800', fontSize: '1.05rem', color: '#0f172a' }}>
              Common scams you should know about
            </h2>
          </div>
          <a href="#" style={{ fontSize: '0.875rem', color: '#2563EB', textDecoration: 'none', fontWeight: '600' }}>
            View all scams →
          </a>
        </div>

        <div className="scam-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {scamCards.map((card) => {
            const isHigh = card.risk === 'high';
            const bgTint = isHigh ? '#FFF5F5' : '#FFFBEB';
            const badgeBg = isHigh ? '#FEE2E2' : '#FEF3C7';
            const badgeColor = isHigh ? '#B91C1C' : '#B45309';

            return (
              <div
                key={card.id}
                style={{
                  border: '1px solid #E6EAF2',
                  borderRadius: '0.5rem',
                  background: bgTint,
                  padding: '0.5rem 0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  minWidth: 0,
                  height: '5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src={card.iconUrl} alt="" style={{ width: '2rem', height: '2rem', objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="text-ellipsis-1" style={{ fontFamily: "var(--font-head)", fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>
                      {card.title}
                    </h3>
                    <svg width="0.875rem" height="0.875rem" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
                    <span
                      style={{
                        background: badgeBg,
                        color: badgeColor,
                        padding: '0.125rem 0.5rem',
                        borderRadius: '1rem',
                        fontSize: '0.625rem',
                        fontWeight: '700',
                        fontFamily: "var(--font-body)",
                        textTransform: 'uppercase',
                        flexShrink: 0,
                      }}
                    >
                      {card.risk} RISK
                    </span>
                  </div>
                  <p className="text-ellipsis-1" style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.1875rem' }}>
                    {card.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );

  return isMobile ? renderMobile() : renderDesktop();
}
