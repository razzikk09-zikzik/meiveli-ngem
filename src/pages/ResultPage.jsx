import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { analyzeWithGemini, VERDICT_META } from '../utils/analyze';
import { supabase } from '../utils/supabase';

const SIGNAL_ICONS = {
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  domain: 'M13.832 16.568c1.153-.5 2.132-1.138 3.168-1.68.87-.478 1.736-1.05 2.5-1.732M13.832 16.568a5.982 5.982 0 0 1-2.832-.832 5.982 5.982 0 0 1-2.5-2.5 5.985 5.985 0 0 1-.832-2.832m7.164 6.164c-1.367.59-2.898.928-4.5.928a9 9 0 1 1 9-9c0 1.602-.337 3.133-.928 4.5',
  brand: 'M3 21h18M4 18h16M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 3l9 5H3l9-5z',
  urgency: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  credentials: 'M15 7a2 2 0 0 1 4 0v4M5 11h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2zm5-4a2 2 0 0 1 4 0v4H10V7z',
  money: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  contact: 'M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z',
};

function SignalIcon({ type }) {
  return (
    <svg width="1.125rem" height="1.125rem" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={SIGNAL_ICONS[type] || SIGNAL_ICONS.link} />
    </svg>
  );
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const text = location.state?.text || '';
  const [result, setResult] = useState(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!text && !location.state?.imageBase64) return;
    let cancelled = false;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    const imageBase64 = location.state?.imageBase64 || null;

    analyzeWithGemini(text, imageBase64)
      .then((data) => {
        if (cancelled) return;
        if (data && typeof data.score === 'number' && data.verdict) {
          setResult(data);
          
          // Log to Supabase
          let classification = 'Safe';
          if (data.verdict === 'scam') classification = 'Scam';
          if (data.verdict === 'suspicious') classification = 'Suspicious';
          const type = (data.urls && data.urls.length > 0) ? 'web' : 'msg';
          const content = (data.urls && data.urls.length > 0) ? data.urls[0] : (text ? text.slice(0, 100) : 'Image Upload');
          
          supabase.from('reports').insert({
            type,
            content,
            classification,
            status: 'Pending'
          }).then(({error}) => { if (error) console.error("Supabase insert error:", error); });
          
        } else {
          setResult({
            score: 0,
            verdict: 'safe',
            signals: [],
            urls: [],
          });
        }
      })
      .catch((err) => { 
        console.error("Analysis error:", err);
        if (!cancelled) {
          setResult({
            score: 0,
            verdict: 'suspicious',
            signals: [
              {
                key: 'brand',
                title: 'AI Analysis Failed',
                detail: 'Our AI engine is currently unavailable (API Error). Advanced scanning was disabled.'
              }
            ],
            urls: [],
          });
        }
      })
      .finally(() => clearTimeout(timer));

    return () => { cancelled = true; controller.abort(); clearTimeout(timer); };
  }, [text]);

  // Direct visit without text or image
  if (!text && !location.state?.imageBase64) {
    return (
      <div style={{ padding: '1rem', maxWidth: '32rem', margin: '0 auto' }}>
        <div style={{ background: '#fff', border: '1px solid #E6EAF2', borderRadius: '0.875rem', padding: '2rem 1rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.25rem', fontWeight: '800' }}>Nothing to check yet</h1>
          <p style={{ color: '#475569', fontSize: '0.875rem', margin: '0.5rem 0 1.25rem' }}>Paste a message on the home screen to analyse it.</p>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '2rem', border: 'none', background: 'linear-gradient(90deg, #1D6FF2 0%, #7C5CF5 100%)', color: '#fff', fontFamily: 'var(--font-head)', fontWeight: '700', cursor: 'pointer' }}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Loading state while Gemini analyzes
  if (!result) {
    return (
      <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
        <div style={{
          width: '2.5rem', height: '2.5rem', borderRadius: '50%',
          border: '3px solid #E2E8F0', borderTopColor: '#2563EB',
          animation: 'spin 1s linear infinite'
        }} />
        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '1.125rem', color: '#0f172a' }}>Analyzing...</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Our AI is inspecting the message for threats.</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const r = result;
  const meta = VERDICT_META[r.verdict] || VERDICT_META.suspicious;

  const shareWarning = async () => {
    const msg = `⚠ MEYVIZHI warning: this message was flagged as "${meta.title}" (${meta.sub}). Don't click links or share OTPs.\n\n"${text.slice(0, 140)}"`;
    try {
      if (navigator.share) await navigator.share({ title: 'MEYVIZHI warning', text: msg });
      else { await navigator.clipboard.writeText(msg); setShared(true); setTimeout(() => setShared(false), 2000); }
    } catch { /* user cancelled */ }
  };

  return (
    <div style={{ padding: '1rem', paddingBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', maxWidth: '32rem', margin: '0 auto', width: '100%' }}>
      {/* Back link */}
      <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', padding: '0', cursor: 'pointer', alignSelf: 'flex-start' }}>
        <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        <span style={{ fontFamily: 'var(--font-head)', fontWeight: '600', fontSize: '0.875rem', color: '#1e293b' }}>Check another message</span>
      </button>

      {/* Verdict banner */}
      <div style={{ background: meta.bannerBg, border: `1px solid ${meta.bannerBorder}`, borderRadius: '0.875rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <svg width="2rem" height="2rem" viewBox="0 0 24 24" fill={meta.iconColor} style={{ flexShrink: 0 }}>
          <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm1-8a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" />
        </svg>
        <div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '1.25rem', color: meta.color }}>{meta.title}</div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: '600', fontSize: '0.875rem', color: meta.color }}>{meta.sub}</div>
        </div>
      </div>

      {/* Risk meter */}
      <div style={{ background: '#fff', border: '1px solid #E6EAF2', borderRadius: '0.875rem', padding: '1rem' }}>
        <div style={{ position: 'relative', height: '0.5rem', borderRadius: '1rem', background: 'linear-gradient(90deg, #22C55E 0%, #EAB308 50%, #EF4444 100%)' }}>
          <div style={{
            position: 'absolute', top: '50%', left: `${r.score}%`, transform: 'translate(-50%, -50%)',
            width: '1.125rem', height: '1.125rem', borderRadius: '50%', background: '#fff',
            border: `3px solid ${meta.iconColor}`, boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#16A34A' }}>Safe</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#D97706' }}>Suspicious</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#DC2626' }}>Scam</span>
        </div>
      </div>

      {/* Analysed message */}
      <div style={{ background: '#fff', border: '1px solid #E6EAF2', borderRadius: '0.875rem', padding: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '0.9375rem', color: '#0f172a', marginBottom: '0.5rem' }}>Analysed message</h2>
        {location.state?.imageBase64 && (
          <img src={location.state.imageBase64} alt="Uploaded screenshot" style={{ width: '100%', maxWidth: '16rem', borderRadius: '0.5rem', marginBottom: '0.75rem', border: '1px solid #E6EAF2' }} />
        )}
        <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.55, wordBreak: 'break-word' }}>{text || (location.state?.imageBase64 ? 'Image scan' : '')}</p>
      </div>

      {/* What we found */}
      {r.signals.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E6EAF2', borderRadius: '0.875rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '0.9375rem', color: '#0f172a' }}>What we found</h2>
          {r.signals.map((s) => (
            <div key={s.key} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
              <SignalIcon type={s.key} />
              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '0.875rem', color: '#0f172a' }}>{s.title}</div>
                <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.0625rem' }}>{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Similar reports */}
      {r.similarReports && (
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '0.875rem', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <svg width="1.125rem" height="1.125rem" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '0.875rem', color: '#C2410C' }}>{r.similarReports}</span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <button
          onClick={() => navigate('/report')}
          style={{ width: '100%', padding: '0.875rem', borderRadius: '2rem', border: 'none', background: '#DC2626', color: '#fff', fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)' }}
        >
          <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          Report this scam
        </button>
        <button
          onClick={shareWarning}
          style={{ width: '100%', padding: '0.875rem', borderRadius: '2rem', border: '1.5px solid #7C5CF5', background: '#fff', color: '#6D28D9', fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}
        >
          <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
          {shared ? 'Copied to clipboard!' : 'Share warning'}
        </button>
      </div>

      {/* What to do next */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '0.875rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '0.9375rem', color: '#1e40af' }}>
          {r.verdict === 'safe' ? 'Stay alert' : 'What to do next'}
        </h2>
        {(r.verdict === 'safe'
          ? ['Never share OTP or PINs with anyone', 'Verify unexpected messages with the sender', 'Report anything suspicious to help others']
          : ['Do not click the link', 'Do not share any OTP or details', 'Report it to help others']
        ).map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: '#2563EB', color: '#fff', fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e3A8A' }}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
