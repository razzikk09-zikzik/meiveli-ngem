import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import ScamMap from '../components/ScamMap';

export default function AnalystDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
      
      // Fetch Real Data from Supabase
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

  return (
    <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'var(--font-body)' }}>
      <style>
        {`
          .dashboard-container {
            display: flex;
            width: 100vw;
            overflow-x: hidden;
          }
          .dashboard-sidebar {
            width: 16rem;
            transition: width 0.3s ease;
          }
          .dashboard-sidebar.collapsed {
            width: 5rem;
          }
          .sidebar-text {
            display: inline-block;
            white-space: nowrap;
            transition: opacity 0.2s;
          }
          .dashboard-sidebar.collapsed .sidebar-text {
            opacity: 0;
            display: none;
          }
          .dashboard-sidebar.collapsed .sidebar-header {
             justify-content: center;
          }
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
            grid-template-columns: 1.5fr 1fr;
            gap: 1.5rem;
          }
          @media (max-width: 1024px) {
            .grid-charts, .grid-tables {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ background: '#fff', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem', flexShrink: 0 }}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
          {/* Logo SVG */}
          <svg width="2rem" height="2rem" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0, cursor: 'pointer' }} onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <path d="M16 26C24.8366 26 32 16 32 16C32 16 24.8366 6 16 6C7.16344 6 0 16 0 16C0 16 7.16344 26 16 26Z" fill="#1D4ED8"/>
            <circle cx="16" cy="16" r="6" fill="#EFF6FF" />
            <circle cx="16" cy="16" r="3" fill="#1E3A8A" />
          </svg>
          <h1 className="sidebar-text" style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
            MEYVIZHI
          </h1>
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavItem collapsed={sidebarCollapsed} icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" label="Dashboard" active />
          <NavItem collapsed={sidebarCollapsed} icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" label="Reports" />
          <NavItem collapsed={sidebarCollapsed} icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" label="Websites" />
          <NavItem collapsed={sidebarCollapsed} icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" label="Users" />
        </nav>

        <button 
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}
        >
          <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="sidebar-text">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.25rem' }}>Dashboard</h2>
            <p style={{ color: '#64748B' }}>Overview of scam reports and platform activity (Live from Supabase)</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '0.5rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
            <svg width="1rem" height="1rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Live Data
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid-stats" style={{ marginBottom: '2rem' }}>
          <StatCard title="Total Reports" value={totalReports} trend="Live" trendUp color="#EF4444" bg="#FEE2E2" sub="Fetched from database" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          <StatCard title="Unique Websites" value={uniqueUrls} trend="Live" trendUp color="#8B5CF6" bg="#EDE9FE" sub="Identified scam links" icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          <StatCard title="Scam Messages" value={scamCount} trend="High Risk" trendUp={false} color="#EF4444" bg="#FEE2E2" sub="Flagged by AI" icon="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          <StatCard title="Suspicious" value={suspiciousCount} trend="Medium Risk" trendUp={false} color="#F59E0B" bg="#FEF3C7" sub="Needs verification" icon="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </div>

        {/* Charts Row */}
        <div className="grid-charts" style={{ marginBottom: '2rem' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: '700', color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
              Live Threat Heatmap
            </h3>
            {/* Reuse Map Component */}
            <div style={{ flex: 1, minHeight: '300px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #E6EAF2', position: 'relative' }}>
              <ScamMap />
            </div>
          </div>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: '700', color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
              Report Classification
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              {/* Mock Donut */}
              <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#10B981" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#FBBF24" strokeWidth="4" strokeDasharray={`${(suspiciousCount/Math.max(totalReports,1))*100} 100`} strokeDashoffset="-22" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray={`${(scamCount/Math.max(totalReports,1))*100} 100`} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.25rem', color: '#0F172A' }}>{totalReports}</span>
                  <span style={{ fontSize: '0.625rem', color: '#64748B' }}>Reports</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <LegendItem color="#EF4444" label="Scam" value={scamCount} />
                <LegendItem color="#FBBF24" label="Suspicious" value={suspiciousCount} />
                <LegendItem color="#10B981" label="Safe" value={safeCount} />
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
                Recent Reports (Database)
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', color: '#64748B', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}>Type</th>
                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}>Content / URL</th>
                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}>Classification</th>
                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>No reports in database yet.</td></tr>
                  ) : reports.slice(0, 5).map(r => (
                    <TableRow key={r.id} type={r.type} content={r.content} classif={r.classification} time={new Date(r.created_at).toLocaleString()} />
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

function NavItem({ icon, label, active, collapsed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: active ? '#EEF2FF' : 'transparent', color: active ? '#4F46E5' : '#64748B', fontWeight: '600', cursor: 'pointer' }}>
      <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      <span className="sidebar-text">{label}</span>
    </div>
  );
}

function StatCard({ title, value, trend, trendUp, color, bg, sub, icon }) {
  return (
    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E2E8F0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="1.5rem" height="1.5rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
      <div style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: '600', marginBottom: '0.25rem' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-head)' }}>{value}</span>
        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: trendUp ? '#10B981' : '#EF4444' }}>{trend}</span>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem' }}>{sub}</div>
    </div>
  );
}

function LegendItem({ color, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontWeight: '600', color: '#0F172A', width: '4.5rem' }}>{label}</span>
      <span style={{ color: '#64748B', fontSize: '0.875rem' }}>{value}</span>
    </div>
  );
}

function TableRow({ type, content, classif, time }) {
  const isWeb = type === 'web';
  const cColor = classif === 'Scam' ? '#EF4444' : classif === 'Safe' ? '#10B981' : '#F59E0B';
  const cBg = classif === 'Scam' ? '#FEE2E2' : classif === 'Safe' ? '#D1FAE5' : '#FEF3C7';
  
  return (
    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
      <td style={{ padding: '1rem 1.5rem' }}>
        <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="#475569" strokeWidth={2}>
          {isWeb ? <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                 : <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />}
        </svg>
      </td>
      <td style={{ padding: '1rem 1.5rem', color: '#0F172A', fontWeight: '500', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{content}</td>
      <td style={{ padding: '1rem 1.5rem' }}>
        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600', color: cColor, background: cBg }}>{classif}</span>
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
          <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{content}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', gap: '0.5rem' }}>
            <span>{time}</span>
          </div>
        </div>
      </div>
      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600', color: cColor, background: cBg, flexShrink: 0 }}>{classif}</span>
    </div>
  );
}
