import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export default function AnalystDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'var(--font-body)' }}>
      {/* Sidebar */}
      <aside style={{ width: '16rem', background: '#fff', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
          MEYVIZHI
        </h1>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavItem icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" label="Dashboard" active />
          <NavItem icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" label="Reports" />
          <NavItem icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" label="Websites" />
          <NavItem icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" label="Users" />
        </nav>

        <button 
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}
        >
          <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.25rem' }}>Dashboard</h2>
            <p style={{ color: '#64748B' }}>Overview of scam reports and platform activity</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '0.5rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
            <svg width="1rem" height="1rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Last 30 days
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <StatCard title="Total Reports" value="1,248" trend="+18%" trendUp color="#EF4444" bg="#FEE2E2" sub="+190 from last month" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          <StatCard title="Unique Websites" value="328" trend="+12%" trendUp color="#8B5CF6" bg="#EDE9FE" sub="+35 from last month" icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          <StatCard title="Unique Messages" value="612" trend="+25%" trendUp color="#3B82F6" bg="#DBEAFE" sub="+122 from last month" icon="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          <StatCard title="Active Users" value="892" trend="+14%" trendUp color="#10B981" bg="#D1FAE5" sub="+110 from last month" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: '700', color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
              Reports Over Time
            </h3>
            {/* Mock Chart */}
            <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem', position: 'relative' }}>
              <svg viewBox="0 0 400 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <path d="M0,130 C30,100 60,110 90,80 C120,50 150,90 180,70 C210,50 240,40 270,80 C300,120 330,20 360,50 C380,70 400,60 400,60" fill="none" stroke="#3B82F6" strokeWidth="4" />
                <path d="M0,130 C30,100 60,110 90,80 C120,50 150,90 180,70 C210,50 240,40 270,80 C300,120 330,20 360,50 C380,70 400,60 400,60 L400,150 L0,150 Z" fill="rgba(59, 130, 246, 0.1)" />
                <circle cx="90" cy="80" r="4" fill="#3B82F6" />
                <circle cx="180" cy="70" r="4" fill="#3B82F6" />
                <circle cx="270" cy="80" r="4" fill="#3B82F6" />
                <circle cx="360" cy="50" r="4" fill="#3B82F6" />
              </svg>
            </div>
          </div>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: '700', color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
              Report Classification
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              {/* Mock Donut */}
              <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#10B981" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#FBBF24" strokeWidth="4" strokeDasharray="60 100" strokeDashoffset="-22" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray="42 100" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.25rem', color: '#0F172A' }}>1,248</span>
                  <span style={{ fontSize: '0.625rem', color: '#64748B' }}>Reports</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <LegendItem color="#EF4444" label="Scam" value="42% (524)" />
                <LegendItem color="#FBBF24" label="Suspicious" value="36% (449)" />
                <LegendItem color="#10B981" label="Safe" value="22% (275)" />
              </div>
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Recent Reports
              </h3>
              <button style={{ color: '#3B82F6', fontWeight: '600', fontSize: '0.875rem', border: 'none', background: 'transparent', cursor: 'pointer' }}>View All →</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', color: '#64748B', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}>ID</th>
                  <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}>Type</th>
                  <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}>Content / URL</th>
                  <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}>Classification</th>
                  <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                <TableRow id="#1248" type="web" content="sbi-kyc-update.xyz" classif="Scam" status="Pending" time="2 hours ago" />
                <TableRow id="#1247" type="msg" content="Your account will be blocked..." classif="Suspicious" status="Pending" time="5 hours ago" />
                <TableRow id="#1246" type="web" content="tinyurl.com/abcd123" classif="Scam" status="Under Review" time="8 hours ago" />
                <TableRow id="#1245" type="msg" content="KYC update required. Click..." classif="Suspicious" status="Pending" time="10 hours ago" />
                <TableRow id="#1244" type="web" content="amazon-reward.in" classif="Scam" status="Verified" time="12 hours ago" />
              </tbody>
            </table>
          </div>

          <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Pending Verification
              </h3>
              <button style={{ color: '#3B82F6', fontWeight: '600', fontSize: '0.875rem', border: 'none', background: 'transparent', cursor: 'pointer' }}>View All →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <PendingItem type="web" content="sbi-kyc-update.xyz" count="12 reports" time="2 hours ago" classif="Scam" />
              <PendingItem type="msg" content="Your parcel is on hold..." count="8 reports" time="5 hours ago" classif="Suspicious" />
              <PendingItem type="web" content="tinyurl.com/abcd123" count="7 reports" time="8 hours ago" classif="Scam" />
              <PendingItem type="msg" content="KYC update required..." count="6 reports" time="10 hours ago" classif="Suspicious" />
              <PendingItem type="web" content="amazon-reward.in" count="5 reports" time="12 hours ago" classif="Scam" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: active ? '#EEF2FF' : 'transparent', color: active ? '#4F46E5' : '#64748B', fontWeight: '600', cursor: 'pointer' }}>
      <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      {label}
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
      <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: color }} />
      <span style={{ fontWeight: '600', color: '#0F172A', width: '4.5rem' }}>{label}</span>
      <span style={{ color: '#64748B', fontSize: '0.875rem' }}>{value}</span>
    </div>
  );
}

function TableRow({ id, type, content, classif, status, time }) {
  const isWeb = type === 'web';
  const cColor = classif === 'Scam' ? '#EF4444' : '#F59E0B';
  const cBg = classif === 'Scam' ? '#FEE2E2' : '#FEF3C7';
  
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
      <td style={{ padding: '1rem 1.5rem', color: '#0F172A', fontWeight: '500' }}>{content}</td>
      <td style={{ padding: '1rem 1.5rem' }}>
        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600', color: cColor, background: cBg }}>{classif}</span>
      </td>
      <td style={{ padding: '1rem 1.5rem' }}>
        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600', color: sColor, background: sBg }}>{status}</span>
      </td>
      <td style={{ padding: '1rem 1.5rem', color: '#64748B', fontSize: '0.875rem' }}>{time}</td>
    </tr>
  );
}

function PendingItem({ type, content, count, time, classif }) {
  const isWeb = type === 'web';
  const cColor = classif === 'Scam' ? '#EF4444' : '#F59E0B';
  const cBg = classif === 'Scam' ? '#FEE2E2' : '#FEF3C7';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="#475569" strokeWidth={2}>
            {isWeb ? <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />}
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.875rem' }}>{content}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', gap: '0.5rem' }}>
            <span>{count}</span>
            <span>•</span>
            <span>{time}</span>
          </div>
        </div>
      </div>
      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600', color: cColor, background: cBg }}>{classif}</span>
    </div>
  );
}
