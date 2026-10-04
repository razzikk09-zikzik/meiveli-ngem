import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useHotspots, AREAS } from '../hooks/useHotspots';
import ThreatMap from '../components/ThreatMap';
import NetworkGraph from '../components/NetworkGraph';

export default function AnalystDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSampleMode, setIsSampleMode] = useState(false);
  
  const { reports, hotspots } = useHotspots(isSampleMode);
  
  const [selectedArea, setSelectedArea] = useState('All South Chennai');
  const [activeTab, setActiveTab] = useState('Map');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [graphDims, setGraphDims] = useState({ width: 600, height: 400 });
  const graphContainerRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (graphContainerRef.current) {
      const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
          setGraphDims({ width: entry.contentRect.width, height: entry.contentRect.height });
        }
      });
      observer.observe(graphContainerRef.current);
      return () => observer.disconnect();
    }
  }, [activeTab]);

  const handleUpdateClassification = async (id, newClassif, newStatus) => {
    if (isSampleMode) return; // don't update mock data in DB
    try {
      await supabase.from('reports').update({ classification: newClassif, status: newStatus }).eq('id', id);
    } catch (error) {
      console.error("Failed to update report", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-head)' }}>Loading Dashboard...</h2>
    </div>
  );

  // Compute filtered reports
  const filteredReports = (selectedArea === 'All South Chennai' || selectedArea === 'All')
    ? reports 
    : reports.filter(r => r.area === selectedArea);

  const totalReports = filteredReports.length;
  
  const uniqueUrls = new Set();
  let scamCount = 0, suspCount = 0, safeCount = 0;
  
  filteredReports.forEach(r => {
    if (r.type === 'web' && r.content) uniqueUrls.add(r.content);
    if (r.classification === 'Scam') scamCount++;
    else if (r.classification === 'Suspicious') suspCount++;
    else if (r.classification === 'Safe') safeCount++;
  });

  // KPI Calculations
  const campaignsDetected = Math.ceil(totalReports / 5); // Mock metric
  const linkedIndicators = uniqueUrls.size + Math.floor(totalReports / 3);

  // Top Domains
  const domainCounts = {};
  filteredReports.filter(r => r.type === 'web' && r.content).forEach(r => {
    let domain = r.content;
    try { domain = new URL(r.content.startsWith('http') ? r.content : `https://${r.content}`).hostname; } catch(e){}
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
  });
  const topDomains = Object.entries(domainCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);

  // Top Areas
  const sortedHotspots = [...hotspots].sort((a,b) => b.reports - a.reports).slice(0, 4);

  // Donut chart logic
  const totalCls = Math.max(totalReports, 1);
  const scamPct = Math.round((scamCount / totalCls) * 100);
  const suspPct = Math.round((suspCount / totalCls) * 100);
  const safePct = Math.round((safeCount / totalCls) * 100);

  const scamLen = (scamPct / 100) * 100;
  const suspLen = (suspPct / 100) * 100;
  const safeLen = (safePct / 100) * 100;
  const c = 2 * Math.PI * 15.9155; // circumference for r=15.9155 (which is 100)

  return (
    <div className="dashboard-shell">
      <style>
        {`
          .dashboard-shell {
            height: 100dvh;
            width: 100vw;
            overflow: hidden;
            background: #F6F8FC;
            font-family: 'Inter', var(--font-body);
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
            border-bottom: 1px solid #E6EAF2;
            padding: 0 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
          }

          .dashboard-content {
            display: grid;
            grid-template-rows: auto auto minmax(0, 1.5fr) minmax(0, 1fr);
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

          .grid-main {
            display: grid;
            grid-template-columns: 6fr 4fr;
            gap: 0.75rem;
            min-height: 0;
          }

          .card {
            background: #fff;
            border-radius: 14px;
            border: 1px solid #E6EAF2;
            padding: 16px;
            display: flex;
            flex-direction: column;
            min-height: 0;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          }
          
          .card-header {
            font-family: var(--font-head);
            font-weight: 700;
            color: #0F1B4C;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.25rem;
            font-size: 1.1rem;
          }

          .card-subtitle {
            font-size: 0.85rem;
            color: #64748B;
            margin-bottom: 1rem;
            margin-top: -0.25rem;
            padding-left: 1.75rem;
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
            max-width: 200px;
          }

          /* Segmented Control */
          .segmented-control {
            display: flex;
            background: #F1F5F9;
            border-radius: 20px;
            padding: 2px;
            border: 1px solid #E2E8F0;
          }
          .segment {
            padding: 4px 12px;
            font-size: 0.75rem;
            font-weight: 600;
            border-radius: 18px;
            cursor: pointer;
            transition: all 0.2s;
            color: #64748B;
          }
          .segment.active {
            background: #3B82F6;
            color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
            .grid-stats, .grid-main {
              grid-template-columns: 1fr;
              display: flex;
              flex-direction: column;
            }
          }
        `}
      </style>

      {/* Top Navbar */}
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/assets/logo.png" alt="MEYVIZHI" style={{ height: '40px', objectFit: 'contain' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          
          <div className="segmented-control">
             <div className={`segment ${!isSampleMode ? 'active' : ''}`} onClick={() => setIsSampleMode(false)}>Live Data</div>
             <div className={`segment ${isSampleMode ? 'active' : ''}`} onClick={() => setIsSampleMode(true)}>Sample Data</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
              <svg width="1.5rem" height="1.5rem" fill="none" stroke="#64748B" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span style={{ position: 'absolute', top: 0, right: 0, width: '0.5rem', height: '0.5rem', background: '#EF4444', borderRadius: '50%' }}></span>
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={handleLogout}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: '#6366F1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontFamily: 'var(--font-head)' }}>A</div>
              <span style={{ fontWeight: '600', color: '#0F1B4C', fontSize: '0.875rem' }}>Analyst ▼</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="dashboard-content">
        
        {/* Row 1: Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.9rem', fontWeight: '800', color: '#0F1B4C', margin: 0, marginBottom: '0.2rem' }}>Analyst Dashboard</h2>
            <span style={{ fontSize: '1rem', color: '#64748B' }}>Real-time insights from reported cyber threats in South Chennai</span>
          </div>
          
          <select 
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #E6EAF2', borderRadius: '0.5rem', fontWeight: '600', color: '#0F1B4C', cursor: 'pointer', fontSize: '0.875rem', outline: 'none' }}
          >
            <option value="All South Chennai">📍 All South Chennai</option>
            {Object.keys(AREAS).map(area => <option key={area} value={area}>{area}</option>)}
          </select>
        </div>

        {/* Row 2: KPI Stats (No trends) */}
        <div className="grid-stats">
          <StatCard title="Total Reports" value={totalReports} color="#EF4444" bg="#FEE2E2" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          <StatCard title="Unique Domains" value={uniqueUrls.size} color="#8B5CF6" bg="#EDE9FE" icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          <StatCard title="Campaigns Detected" value={campaignsDetected} color="#3B82F6" bg="#DBEAFE" icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          <StatCard title="Linked Indicators" value={linkedIndicators} color="#10B981" bg="#D1FAE5" icon="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </div>

        {/* Row 3: Main Dashboard Panels */}
        <div className="grid-main">
          
          <div className="card" style={{ padding: '0' }}>
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="card-header">
                  <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Campaign Intelligence
                </div>
                <div className="card-subtitle">Geographic distribution of reports in South Chennai</div>
              </div>
              <div className="segmented-control">
                 <button onClick={() => setActiveTab('Map')} style={{ padding: '0.25rem 1rem', borderRadius: '0.25rem', border: 'none', background: activeTab === 'Map' ? '#3B82F6' : 'transparent', color: activeTab === 'Map' ? '#fff' : '#64748B', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer', boxShadow: activeTab === 'Map' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>Map</button>
                 <button onClick={() => setActiveTab('Network')} style={{ padding: '0.25rem 1rem', borderRadius: '0.25rem', border: 'none', background: activeTab === 'Network' ? '#3B82F6' : 'transparent', color: activeTab === 'Network' ? '#fff' : '#64748B', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer', boxShadow: activeTab === 'Network' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>Network</button>
              </div>
            </div>
            
            <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }} ref={graphContainerRef}>
               {reports.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>No reports to map.</div>
               ) : (
                  <>
                     <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.9)', padding: '2px 10px', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#475569', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        Based on {totalReports} reports
                     </div>
                     <div style={{ position: 'absolute', inset: 0, visibility: activeTab === 'Map' ? 'visible' : 'hidden' }}>
                        <ThreatMap hotspots={hotspots} selectedArea={selectedArea} mode="analyst" onSelect={(spot) => {
                           if (spot.type === 'campaign_from_map') {
                              setActiveTab('Network');
                              setSelectedCampaign(spot.location);
                           }
                        }} />
                     </div>
                     <div style={{ position: 'absolute', inset: 0, visibility: activeTab === 'Network' ? 'visible' : 'hidden' }}>
                        {activeTab === 'Network' && (
                           <NetworkGraph 
                             reports={filteredReports} 
                             selectedCampaign={selectedCampaign} 
                             onSelect={(spot) => {}}
                             width={graphDims.width}
                             height={graphDims.height}
                           />
                        )}
                     </div>
                  </>
               )}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: 0 }}>
             <div className="card" style={{ flex: 1 }}>
               <div className="card-header">
                 <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                 Report Classification
               </div>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', flex: 1, minHeight: 0 }}>
                 
                 {/* Fully scalable Donut via SVG viewBox */}
                 <div style={{ flex: 1, minHeight: 0, minWidth: '40%', height: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', maxHeight: '150px' }}>
                       {/* Background Track */}
                       <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                       
                       {/* Scam Segment */}
                       {scamLen > 0 && <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray={`${scamLen} ${100 - scamLen}`} />}
                       
                       {/* Suspicious Segment */}
                       {suspLen > 0 && <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#FBBF24" strokeWidth="4" strokeDasharray={`${suspLen} ${100 - suspLen}`} strokeDashoffset={-scamLen} />}
                       
                       {/* Safe Segment */}
                       {safeLen > 0 && <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray={`${safeLen} ${100 - safeLen}`} strokeDashoffset={-(scamLen + suspLen)} />}
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontWeight: '800', fontSize: '1.25rem', color: '#0F1B4C', fontFamily: 'var(--font-head)' }}>{totalReports}</span>
                      <span style={{ fontSize: '0.6rem', color: '#64748B' }}>Reports</span>
                    </div>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '40%' }}>
                   <LegendItem color="#EF4444" label="Scam" pct={`${scamPct}%`} val={`(${scamCount})`} />
                   <LegendItem color="#FBBF24" label="Suspicious" pct={`${suspPct}%`} val={`(${suspCount})`} />
                   <LegendItem color="#10B981" label="Safe" pct={`${safePct}%`} val={`(${safeCount})`} />
                 </div>
               </div>
             </div>

             <div className="card" style={{ flex: 1 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                 <div className="card-header" style={{ margin: 0 }}>
                   <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   Top Areas
                 </div>
                 <button style={{ color: '#3B82F6', fontWeight: '600', fontSize: '0.85rem', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>View All →</button>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  {sortedHotspots.length === 0 ? <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>No data</div> : sortedHotspots.map((h, i) => (
                    <div key={h.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', color: '#475569' }}>
                        <span>{h.name}</span>
                        <span>{h.reports}</span>
                      </div>
                      <div style={{ width: '100%', background: '#EEF2F7', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${(h.reports / sortedHotspots[0].reports) * 100}%`, background: i === 0 ? '#EF4444' : '#FBBF24', height: '100%', borderRadius: '6px' }}></div>
                      </div>
                    </div>
                  ))}
               </div>
             </div>
          </div>

        </div>

        {/* Row 4: Tables */}
        <div className="grid-main">
          
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="card-header" style={{ margin: 0 }}>
                  <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Recent Reports
                </div>
                <div className="card-subtitle" style={{ marginBottom: 0 }}>Latest reported links, messages and threats</div>
              </div>
              <button style={{ color: '#3B82F6', fontWeight: '600', fontSize: '0.85rem', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>View All →</button>
            </div>
            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', tableLayout: 'fixed' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#F8FAFC' }}>
                  <tr style={{ color: '#64748B', textAlign: 'left', fontSize: '0.8rem' }}>
                    <th style={{ padding: '0.5rem 1rem', fontWeight: '600', borderBottom: '1px solid #E6EAF2', width: '6%' }}>ID</th>
                    <th style={{ padding: '0.5rem 1rem', fontWeight: '600', borderBottom: '1px solid #E6EAF2', width: '6%' }}>Type</th>
                    <th style={{ padding: '0.5rem 1rem', fontWeight: '600', borderBottom: '1px solid #E6EAF2', width: '28%' }}>Content / URL</th>
                    <th style={{ padding: '0.5rem 1rem', fontWeight: '600', borderBottom: '1px solid #E6EAF2', width: '12%' }}>Area</th>
                    <th style={{ padding: '0.5rem 1rem', fontWeight: '600', borderBottom: '1px solid #E6EAF2', width: '12%' }}>Classification</th>
                    <th style={{ padding: '0.5rem 1rem', fontWeight: '600', borderBottom: '1px solid #E6EAF2', width: '10%' }}>Status</th>
                    <th style={{ padding: '0.5rem 1rem', fontWeight: '600', borderBottom: '1px solid #E6EAF2', width: '14%' }}>Time</th>
                    <th style={{ padding: '0.5rem 1rem', fontWeight: '600', borderBottom: '1px solid #E6EAF2', width: '12%', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length === 0 ? (
                    <tr><td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>No reports found.</td></tr>
                  ) : filteredReports.map(r => (
                    <TableRow 
                      key={r.id || Math.random()} 
                      rawId={r.id}
                      id={`#${String(r.id || '000').slice(0,4)}`} 
                      type={r.type} 
                      content={r.content || 'N/A'} 
                      area={r.area || 'Unknown'} 
                      classif={r.classification} 
                      status={r.status || 'Pending'} 
                      time={r.created_at ? new Date(r.created_at).toLocaleString() : 'Just now'} 
                      onUpdate={handleUpdateClassification}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div className="card-header" style={{ margin: 0 }}>
                <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                Top Reported Domains
              </div>
              <button style={{ color: '#3B82F6', fontWeight: '600', fontSize: '0.85rem', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>View All →</button>
            </div>
            <div className="table-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
               {topDomains.length === 0 ? <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>No domains reported</div> : topDomains.map(([domain, count], i) => (
                 <div key={domain} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#3B82F6', flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                       <div className="text-ellipsis-custom" style={{ fontWeight: '600', fontSize: '0.85rem', color: '#0F1B4C', marginBottom: '4px' }}>{domain}</div>
                       <div style={{ width: '100%', background: '#EEF2F7', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
                          <div style={{ width: `${(count / topDomains[0][1]) * 100}%`, background: '#EF4444', height: '100%', borderRadius: '6px' }}></div>
                       </div>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#475569' }}>{count}</div>
                 </div>
               ))}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, color, bg, icon }) {
  return (
    <div className="card" style={{ height: '5.5rem', padding: '16px', flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="1.5rem" height="1.5rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600', marginBottom: '4px' }}>{title}</div>
        <span style={{ fontSize: '1.9rem', fontWeight: '800', color: '#0F1B4C', fontFamily: 'var(--font-head)', lineHeight: 1 }}>{value}</span>
      </div>
    </div>
  );
}

function LegendItem({ color, label, pct, val }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontWeight: '600', color: '#0F1B4C', fontSize: '0.875rem' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
        <span style={{ color: '#475569', fontWeight: '600' }}>{pct}</span>
        <span style={{ color: '#94A3B8' }}>{val}</span>
      </div>
    </div>
  );
}

function TableRow({ rawId, id, type, content, area, classif, status, time, onUpdate }) {
  const isWeb = type === 'web';
  const cColor = classif === 'Scam' ? '#EF4444' : classif === 'Safe' ? '#10B981' : '#F59E0B';
  const cBg = classif === 'Scam' ? '#FEE2E2' : classif === 'Safe' ? '#D1FAE5' : '#FEF3C7';
  
  let normStatus = status;
  if (status && status.toLowerCase() === 'pending') normStatus = 'Pending';
  
  let sColor, sBg;
  if (normStatus === 'Pending') { sColor = '#F59E0B'; sBg = '#FEF3C7'; }
  else if (normStatus === 'Under Review') { sColor = '#3B82F6'; sBg = '#DBEAFE'; }
  else { sColor = '#10B981'; sBg = '#D1FAE5'; }

  return (
    <tr style={{ borderBottom: '1px solid #E6EAF2', height: '2.6rem' }}>
      <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontWeight: '500' }}>{id}</td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <svg width="1rem" height="1rem" fill="none" viewBox="0 0 24 24" stroke="#475569" strokeWidth={2}>
          {isWeb ? <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                 : <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />}
        </svg>
      </td>
      <td style={{ padding: '0.75rem 1rem', color: '#0F1B4C', fontWeight: '500' }}>
        <div className="text-ellipsis-custom" style={{ maxWidth: '100%' }}>{content}</div>
      </td>
      <td style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.8rem' }}>{area}</td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '600', color: cColor, background: cBg }}>{classif}</span>
      </td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '600', color: sColor, background: sBg }}>{normStatus}</span>
      </td>
      <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{time}</td>
      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
        {normStatus === 'Pending' && rawId && (
          <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => onUpdate(rawId, 'Scam', 'Verified')}
              style={{ background: '#D1FAE5', color: '#10B981', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.target.style.background = '#A7F3D0'}
              onMouseOut={(e) => e.target.style.background = '#D1FAE5'}
            >
              Approve
            </button>
            <button 
              onClick={() => onUpdate(rawId, 'Safe', 'Verified')}
              style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.target.style.background = '#FECACA'}
              onMouseOut={(e) => e.target.style.background = '#FEE2E2'}
            >
              Reject
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
