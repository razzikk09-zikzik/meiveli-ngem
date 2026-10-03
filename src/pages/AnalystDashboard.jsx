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
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-head)' }}>Loading Dashboard...</h2>
    </div>
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const total = Math.max(totalReports, 1);
  const scamPct = Math.round((scamCount / total) * 100);
  const suspPct = Math.round((suspiciousCount / total) * 100);
  const safePct = Math.round((safeCount / total) * 100);

  const conic = `conic-gradient(#EF4444 0% ${scamPct}%, #FBBF24 ${scamPct}% ${scamPct + suspPct}%, #10B981 ${scamPct + suspPct}% 100%)`;

  return (
    <div className="dashboard-shell">
      <style>
        {`
          .dashboard-shell {
            height: 100dvh;
            width: 100vw;
            overflow: hidden;
            background: #F8FAFC;
            font-family: var(--font-body);
            display: flex;
            flex-direction: column;
          }
          
          html {
            font-size: clamp(11px, min(0.95vw, 1.55vh), 17px);
          }

          .topbar {
            height: 4rem;
            max-height: 4rem;
            background: #fff;
            border-bottom: 1px solid #E2E8F0;
            padding: 0 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
          }

          .dashboard-content {
            display: grid;
            grid-template-rows: auto auto minmax(0, 1fr) minmax(0, 1fr);
            gap: 0.75rem;
            padding: 1rem;
            flex: 1;
            min-height: 0;
            width: 100%;
            max-width: 1920px;
            margin: 0 auto;
          }

          .grid-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.75rem;
            min-height: 0;
          }

          .grid-charts, .grid-tables {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 0.75rem;
            min-height: 0;
          }

          .card {
            background: #fff;
            border-radius: 1rem;
            border: 1px solid #E2E8F0;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            min-height: 0;
          }
          
          .card-header {
            font-family: var(--font-head);
            font-weight: 700;
            color: #0F172A;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
          }

          .table-container {
            flex: 1;
            min-height: 0;
            overflow: auto;
          }

          .text-ellipsis-custom {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 250px;
          }

          @media (max-width: 999px), (max-height: 599px) {
            .dashboard-shell {
              height: auto;
              overflow-y: auto;
            }
            .dashboard-content {
              display: flex;
              flex-direction: column;
            }
            .grid-stats, .grid-charts, .grid-tables {
              grid-template-columns: 1fr;
              display: flex;
              flex-direction: column;
            }
          }
        `}
      </style>

      {/* Top Navbar */}
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/assets/logo.png" alt="MEYVIZHI" style={{ height: '40px', objectFit: 'contain' }} />
          <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: '600', alignSelf: 'flex-end', paddingBottom: '0.25rem' }}>See the scam. Trace the threat.</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ position: 'relative', width: '25rem' }}>
            <svg style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} width="1.25rem" height="1.25rem" fill="none" stroke="#94A3B8" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search by URL, domain, keyword, report ID..." style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.75rem', borderRadius: '2rem', border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none', fontSize: '0.875rem' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
              <svg width="1.5rem" height="1.5rem" fill="none" stroke="#64748B" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span style={{ position: 'absolute', top: 0, right: 0, width: '0.5rem', height: '0.5rem', background: '#EF4444', borderRadius: '50%' }}></span>
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={handleLogout}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: '#6366F1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontFamily: 'var(--font-head)' }}>A</div>
              <span style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.875rem' }}>Analyst ▼</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="dashboard-content">
        
        {/* Row 1: Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Dashboard</h2>
            <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>Overview of scam reports and platform activity</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '0.5rem', fontWeight: '600', color: '#475569', cursor: 'pointer', fontSize: '0.875rem' }}>
            <svg width="1rem" height="1rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Last 30 days ▼
          </button>
        </div>

        {/* Row 2: Stats */}
        <div className="grid-stats">
          <StatCard title="Total Reports" value={totalReports} trend="↗ 18%" trendUp color="#EF4444" bg="#FEE2E2" sub="+190 from last month" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          <StatCard title="Unique Websites" value={uniqueUrls} trend="↗ 12%" trendUp color="#8B5CF6" bg="#EDE9FE" sub="+35 from last month" icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          <StatCard title="Scam Messages" value={scamCount} trend="↗ 25%" trendUp color="#3B82F6" bg="#DBEAFE" sub="+122 from last month" icon="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          <StatCard title="Active Users" value={Math.max(10, totalReports * 3)} trend="↗ 14%" trendUp color="#10B981" bg="#D1FAE5" sub="+110 from last month" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </div>

        {/* Row 3: Charts */}
        <div className="grid-charts">
          <div className="card">
            <h3 className="card-header">
              <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
              Reports Over Time
            </h3>
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
               <svg viewBox="0 0 600 200" style={{ width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
                      <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                    </linearGradient>
                  </defs>
                  {[0, 50, 100, 150, 200].map(y => (
                    <g key={y}>
                      <line x1="40" y1={y} x2="600" y2={y} stroke="#F1F5F9" strokeWidth="1" />
                      <text x="30" y={y + 4} fill="#94A3B8" fontSize="10" textAnchor="end">{200 - y}</text>
                    </g>
                  ))}
                  {['Sep 8', 'Sep 12', 'Sep 16', 'Sep 20', 'Sep 24', 'Sep 28', 'Oct 2'].map((label, i) => (
                    <text key={label} x={40 + (i * 93)} y="215" fill="#94A3B8" fontSize="10" textAnchor="middle">{label}</text>
                  ))}
                  
                  <path d="M40,160 C80,120 100,130 133,100 C166,70 190,110 226,90 C260,70 290,90 320,60 C360,20 380,110 413,80 C446,50 480,90 506,100 C540,110 570,60 600,80" fill="none" stroke="#3B82F6" strokeWidth="3" />
                  <path d="M40,160 C80,120 100,130 133,100 C166,70 190,110 226,90 C260,70 290,90 320,60 C360,20 380,110 413,80 C446,50 480,90 506,100 C540,110 570,60 600,80 L600,200 L40,200 Z" fill="url(#blueGrad)" />
                  
                  <circle cx="133" cy="100" r="4" fill="#fff" stroke="#3B82F6" strokeWidth="2" />
                  <circle cx="226" cy="90" r="4" fill="#fff" stroke="#3B82F6" strokeWidth="2" />
                  <circle cx="320" cy="60" r="4" fill="#fff" stroke="#3B82F6" strokeWidth="2" />
                  <circle cx="413" cy="80" r="4" fill="#fff" stroke="#3B82F6" strokeWidth="2" />
                  <circle cx="506" cy="100" r="4" fill="#fff" stroke="#3B82F6" strokeWidth="2" />
               </svg>
            </div>
          </div>
          
          <div className="card">
            <h3 className="card-header">
              <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
              Report Classification
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10%', flexWrap: 'wrap', flex: 1, minHeight: 0 }}>
              <div style={{ position: 'relative', width: '35%', aspectRatio: '1/1', flexShrink: 0, borderRadius: '50%', background: conic, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '80%', height: '80%', background: '#fff', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.25rem', color: '#0F172A', fontFamily: 'var(--font-head)' }}>{totalReports}</span>
                  <span style={{ fontSize: '0.6rem', color: '#64748B' }}>Reports</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                <LegendItem color="#EF4444" label="Scam" pct={`${scamPct}%`} val={`(${scamCount})`} />
                <LegendItem color="#FBBF24" label="Suspicious" pct={`${suspPct}%`} val={`(${suspiciousCount})`} />
                <LegendItem color="#10B981" label="Safe" pct={`${safePct}%`} val={`(${safeCount})`} />
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Tables */}
        <div className="grid-tables">
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-header" style={{ margin: 0 }}>
                <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Recent Reports
              </h3>
              <button style={{ color: '#3B82F6', fontWeight: '600', fontSize: '0.875rem', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>View All <svg width="1rem" height="1rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
            </div>
            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#F8FAFC' }}>
                  <tr style={{ color: '#64748B', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem 1rem', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>ID</th>
                    <th style={{ padding: '0.5rem 1rem', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Type</th>
                    <th style={{ padding: '0.5rem 1rem', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Content / URL</th>
                    <th style={{ padding: '0.5rem 1rem', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Classification</th>
                    <th style={{ padding: '0.5rem 1rem', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Status</th>
                    <th style={{ padding: '0.5rem 1rem', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>No reports found.</td></tr>
                  ) : reports.map(r => (
                    <TableRow key={r.id} id={`#${r.id.slice(0,4)}`} type={r.type} content={r.content} classif={r.classification} status={r.status} time={new Date(r.created_at).toLocaleString()} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="card-header" style={{ margin: 0 }}>
                <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Pending Verification
              </h3>
              <button style={{ color: '#3B82F6', fontWeight: '600', fontSize: '0.875rem', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>View All <svg width="1rem" height="1rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
            </div>
            <div className="table-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reports.filter(r => r.status === 'Pending').length === 0 ? (
                 <div style={{ color: '#64748B', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No pending reports.</div>
              ) : reports.filter(r => r.status === 'Pending').map(r => (
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
    <div className="card" style={{ height: '5.5rem', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600', marginBottom: '0.125rem' }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-head)', lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: trendUp ? '#10B981' : '#EF4444' }}>{trend}</span>
            <span style={{ fontSize: '0.65rem', color: '#94A3B8', marginLeft: 'auto', whiteSpace: 'nowrap' }}>{sub}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, pct, val }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.875rem' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
        <span style={{ color: '#475569', fontWeight: '600' }}>{pct}</span>
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
      <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontWeight: '500' }}>{id}</td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <svg width="1rem" height="1rem" fill="none" viewBox="0 0 24 24" stroke="#475569" strokeWidth={2}>
          {isWeb ? <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                 : <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />}
        </svg>
      </td>
      <td style={{ padding: '0.75rem 1rem', color: '#0F172A', fontWeight: '500' }}>
        <div className="text-ellipsis-custom">{content}</div>
      </td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '600', color: cColor, background: cBg }}>{classif}</span>
      </td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '600', color: sColor, background: sBg }}>{status}</span>
      </td>
      <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{time}</td>
    </tr>
  );
}

function PendingItem({ type, content, time, classif }) {
  const isWeb = type === 'web';
  const cColor = classif === 'Scam' ? '#EF4444' : classif === 'Safe' ? '#10B981' : '#F59E0B';
  const cBg = classif === 'Scam' ? '#FEE2E2' : classif === 'Safe' ? '#D1FAE5' : '#FEF3C7';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="1rem" height="1rem" fill="none" viewBox="0 0 24 24" stroke="#475569" strokeWidth={2}>
            {isWeb ? <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />}
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="text-ellipsis-custom" style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.8rem' }}>{content}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', gap: '0.5rem' }}>
            <span>{time}</span>
          </div>
        </div>
      </div>
      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '600', color: cColor, background: cBg, flexShrink: 0 }}>{classif}</span>
    </div>
  );
}
