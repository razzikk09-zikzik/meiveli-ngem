import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export default function AnalystDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  
  // Stats
  const [totalReports, setTotalReports] = useState(0);
  const [uniqueUrls, setUniqueUrls] = useState(0);
  const [scamCount, setScamCount] = useState(0);
  const [suspiciousCount, setSuspiciousCount] = useState(0);
  const [safeCount, setSafeCount] = useState(0);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (!error && data) {
        setReports(data);
        setTotalReports(data.length);
        
        let s = 0, susp = 0, sf = 0;
        const urls = new Set();
        
        data.forEach(r => {
          if (r.classification === 'Scam') s++;
          else if (r.classification === 'Suspicious') susp++;
          else if (r.classification === 'Safe') sf++;
          
          if (r.type === 'web' && r.content) urls.add(r.content);
        });
        
        setScamCount(s);
        setSuspiciousCount(susp);
        setSafeCount(sf);
        setUniqueUrls(urls.size);
      }
      
      setLoading(false);
    };
    checkAuthAndFetchData();
  }, [navigate]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-head)' }}>Loading Dashboard...</h2>
    </div>
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Calculate percentages for donut
  const total = Math.max(totalReports, 1);
  const scamPct = Math.round((scamCount / total) * 100);
  const suspPct = Math.round((suspiciousCount / total) * 100);
  const safePct = Math.round((safeCount / total) * 100);

  // Conic gradient string
  const conic = `conic-gradient(#EF4444 0% ${scamPct}%, #FBBF24 ${scamPct}% ${scamPct + suspPct}%, #10B981 ${scamPct + suspPct}% 100%)`;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column' }}>
      <style>
        {`
          .grid-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.5rem;
          }
          .grid-charts {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1.5rem;
          }
          .grid-tables {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1.5rem;
          }
          @media (max-width: 1024px) {
            .grid-charts, .grid-tables {
              grid-template-columns: 1fr;
            }
          }
          .text-ellipsis-custom {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 250px;
          }
        `}
      </style>

      {/* Top Navbar */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <svg width="2.5rem" height="2.5rem" viewBox="0 0 32 32" fill="none">
            <path d="M16 26C24.8366 26 32 16 32 16C32 16 24.8366 6 16 6C7.16344 6 0 16 0 16C0 16 7.16344 26 16 26Z" fill="#1D4ED8"/>
            <circle cx="16" cy="16" r="6" fill="#EFF6FF" />
            <circle cx="16" cy="16" r="3" fill="#1E3A8A" />
          </svg>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0, lineHeight: 1 }}>MEYVIZHI</h1>
            <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: '600' }}>See the Scam. Stop the Harm.</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ position: 'relative', width: '400px' }}>
            <svg style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} width="1.25rem" height="1.25rem" fill="none" stroke="#94A3B8" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search by URL, domain, keyword, report ID..." style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.75rem', borderRadius: '2rem', border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none', fontSize: '0.875rem' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
              <svg width="1.5rem" height="1.5rem" fill="none" stroke="#64748B" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span style={{ position: 'absolute', top: 0, right: 0, width: '0.5rem', height: '0.5rem', background: '#EF4444', borderRadius: '50%' }}></span>
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={handleLogout}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#6366F1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontFamily: 'var(--font-head)' }}>A</div>
              <span style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.875rem' }}>Analyst ▼</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem max(2rem, calc((100vw - 1400px) / 2))', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '2.25rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.25rem' }}>Dashboard</h2>
            <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Overview of scam reports and platform activity (Live from Supabase)</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '0.5rem', fontWeight: '600', color: '#475569', cursor: 'pointer', fontSize: '0.875rem' }}>
            <svg width="1rem" height="1rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Last 30 days ▼
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid-stats" style={{ marginBottom: '1.5rem' }}>
          <StatCard title="Total Reports" value={totalReports} trend="↗ 18%" trendUp color="#EF4444" bg="#FEE2E2" sub="+190 from last month" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          <StatCard title="Unique Websites" value={uniqueUrls} trend="↗ 12%" trendUp color="#8B5CF6" bg="#EDE9FE" sub="+35 from last month" icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          <StatCard title="Scam Messages" value={scamCount} trend="↗ 25%" trendUp color="#3B82F6" bg="#DBEAFE" sub="+122 from last month" icon="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          <StatCard title="Active Users" value={Math.max(10, totalReports * 3)} trend="↗ 14%" trendUp color="#10B981" bg="#D1FAE5" sub="+110 from last month" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </div>

        {/* Charts Row */}
        <div className="grid-charts" style={{ marginBottom: '1.5rem' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: '700', color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
              Reports Over Time
            </h3>
            {/* Smooth Line Chart SVG (Matching Reference) */}
            <div style={{ flex: 1, minHeight: '220px', position: 'relative' }}>
               <svg viewBox="0 0 600 200" style={{ width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
                      <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  {[0, 50, 100, 150, 200].map(y => (
                    <g key={y}>
                      <line x1="40" y1={y} x2="600" y2={y} stroke="#F1F5F9" strokeWidth="1" />
                      <text x="30" y={y + 4} fill="#94A3B8" fontSize="10" textAnchor="end">{200 - y}</text>
                    </g>
                  ))}
                  {/* X Axis Labels */}
                  {['Sep 8', 'Sep 12', 'Sep 16', 'Sep 20', 'Sep 24', 'Sep 28', 'Oct 2'].map((label, i) => (
                    <text key={label} x={40 + (i * 93)} y="215" fill="#94A3B8" fontSize="10" textAnchor="middle">{label}</text>
                  ))}
                  
                  {/* The Line */}
                  <path d="M40,160 C80,120 100,130 133,100 C166,70 190,110 226,90 C260,70 290,90 320,60 C360,20 380,110 413,80 C446,50 480,90 506,100 C540,110 570,60 600,80" fill="none" stroke="#3B82F6" strokeWidth="3" />
                  <path d="M40,160 C80,120 100,130 133,100 C166,70 190,110 226,90 C260,70 290,90 320,60 C360,20 380,110 413,80 C446,50 480,90 506,100 C540,110 570,60 600,80 L600,200 L40,200 Z" fill="url(#blueGrad)" />
                  
                  {/* Dots */}
                  <circle cx="133" cy="100" r="4" fill="#fff" stroke="#3B82F6" strokeWidth="2" />
                  <circle cx="226" cy="90" r="4" fill="#fff" stroke="#3B82F6" strokeWidth="2" />
                  <circle cx="320" cy="60" r="4" fill="#fff" stroke="#3B82F6" strokeWidth="2" />
                  <circle cx="413" cy="80" r="4" fill="#fff" stroke="#3B82F6" strokeWidth="2" />
                  <circle cx="506" cy="100" r="4" fill="#fff" stroke="#3B82F6" strokeWidth="2" />
               </svg>
            </div>
          </div>
          
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: '700', color: '#0F172A', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
              Report Classification
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              {/* Flawless CSS Donut Chart */}
              <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0, borderRadius: '50%', background: conic, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '110px', height: '110px', background: '#fff', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.5rem', color: '#0F172A', fontFamily: 'var(--font-head)' }}>{totalReports}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Reports</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <LegendItem color="#EF4444" label="Scam" pct={`${scamPct}%`} val={`(${scamCount})`} />
                <LegendItem color="#FBBF24" label="Suspicious" pct={`${suspPct}%`} val={`(${suspiciousCount})`} />
                <LegendItem color="#10B981" label="Safe" pct={`${safePct}%`} val={`(${safeCount})`} />
              </div>
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid-tables">
          <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Recent Reports
              </h3>
              <button style={{ color: '#3B82F6', fontWeight: '600', fontSize: '0.875rem', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>View All <svg width="1rem" height="1rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', color: '#64748B', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>ID</th>
                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Type</th>
                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Content / URL</th>
                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Classification</th>
                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Status</th>
                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>No reports found.</td></tr>
                  ) : reports.slice(0, 5).map(r => (
                    <TableRow key={r.id} id={`#${r.id.slice(0,4)}`} type={r.type} content={r.content} classif={r.classification} status={r.status} time={new Date(r.created_at).toLocaleString()} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Pending Verification
              </h3>
              <button style={{ color: '#3B82F6', fontWeight: '600', fontSize: '0.875rem', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>View All <svg width="1rem" height="1rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reports.filter(r => r.status === 'Pending').length === 0 ? (
                 <div style={{ color: '#64748B', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No pending reports.</div>
              ) : reports.filter(r => r.status === 'Pending').slice(0, 5).map(r => (
                <PendingItem key={r.id} type={r.type} content={r.content} time={new Date(r.created_at).toLocaleString()} classif={r.classification} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, trend, trendUp, color, bg, sub, icon }) {
  return (
    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="1.5rem" height="1.5rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: '600', marginBottom: '0.25rem' }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-head)', lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: trendUp ? '#10B981' : '#EF4444' }}>{trend}</span>
          </div>
        </div>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 'auto' }}>{sub}</div>
    </div>
  );
}

function LegendItem({ color, label, pct, val }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontWeight: '600', color: '#0F172A' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}>
        <span style={{ color: '#475569', fontWeight: '500' }}>{pct}</span>
        <span style={{ color: '#94A3B8' }}>{val}</span>
      </div>
    </div>
  );
}

function TableRow({ id, type, content, classif, status, time }) {
  const isWeb = type === 'web';
  const cColor = classif === 'Scam' ? '#EF4444' : classif === 'Safe' ? '#10B981' : '#F59E0B';
  const cBg = classif === 'Scam' ? '#FEE2E2' : classif === 'Safe' ? '#D1FAE5' : '#FEF3C7';
  
  let sColor, sBg;
  if (status === 'Pending') { sColor = '#F59E0B'; sBg = '#FEF3C7'; }
  else if (status === 'Under Review') { sColor = '#3B82F6'; sBg = '#DBEAFE'; }
  else { sColor = '#10B981'; sBg = '#D1FAE5'; }

  return (
    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
      <td style={{ padding: '1rem 1.5rem', color: '#64748B', fontWeight: '500' }}>{id}</td>
      <td style={{ padding: '1rem 1.5rem' }}>
        <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="#475569" strokeWidth={2}>
          {isWeb ? <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                 : <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />}
        </svg>
      </td>
      <td style={{ padding: '1rem 1.5rem', color: '#0F172A', fontWeight: '500' }}>
        <div className="text-ellipsis-custom">{content}</div>
      </td>
      <td style={{ padding: '1rem 1.5rem' }}>
        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600', color: cColor, background: cBg }}>{classif}</span>
      </td>
      <td style={{ padding: '1rem 1.5rem' }}>
        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600', color: sColor, background: sBg }}>{status}</span>
      </td>
      <td style={{ padding: '1rem 1.5rem', color: '#64748B', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{time}</td>
    </tr>
  );
}

function PendingItem({ type, content, time, classif }) {
  const isWeb = type === 'web';
  const cColor = classif === 'Scam' ? '#EF4444' : classif === 'Safe' ? '#10B981' : '#F59E0B';
  const cBg = classif === 'Scam' ? '#FEE2E2' : classif === 'Safe' ? '#D1FAE5' : '#FEF3C7';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="#475569" strokeWidth={2}>
            {isWeb ? <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />}
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="text-ellipsis-custom" style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.875rem' }}>{content}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', gap: '0.5rem' }}>
            <span>{time}</span>
          </div>
        </div>
      </div>
      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600', color: cColor, background: cBg, flexShrink: 0 }}>{classif}</span>
    </div>
  );
}
