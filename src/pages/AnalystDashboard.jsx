import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreatMap from '../components/ThreatMap';
import NetworkGraph from '../components/NetworkGraph';
import { useHotspots, AREAS, getCategoryDetails } from '../hooks/useHotspots';
import { supabase } from '../utils/supabase';
import { generateIndicatorKey } from '../utils/indicatorUtils';

function LegendItem({ color, label, pct, val }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }}></div>
        <span style={{ color: '#0F1B4C', fontWeight: '600' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', color: '#64748B' }}>
        <span>{pct}</span>
        <span style={{ fontSize: '0.75rem' }}>{val}</span>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, bg, icon, onClick, clickable }) {
  return (
    <div 
      className="card" 
      style={{ height: '5.5rem', padding: '16px', flexDirection: 'row', alignItems: 'center', gap: '16px', cursor: clickable ? 'pointer' : 'default', transition: 'box-shadow 0.2s', boxShadow: clickable ? '0 2px 8px rgba(0,0,0,0.05)' : '0 2px 4px rgba(0,0,0,0.02)' }}
      onClick={onClick}
    >
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

export default function AnalystDashboard() {
  const navigate = useNavigate();
  const [isSampleMode, setIsSampleMode] = useState(false);
  const [selectedArea, setSelectedArea] = useState('All South Chennai');
  const [activeTab, setActiveTab] = useState('Map');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const graphContainerRef = useRef(null);
  const [graphDims, setGraphDims] = useState({ width: 0, height: 0 });
  const { reports: rawReports, hotspots } = useHotspots(isSampleMode, 'analyst');

  // Local optimistic state
  const [optimisticReports, setOptimisticReports] = useState([]);
  useEffect(() => {
    setOptimisticReports(rawReports);
  }, [rawReports]);

  useEffect(() => {
    if (!graphContainerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setGraphDims({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(graphContainerRef.current);
    return () => observer.disconnect();
  }, [activeTab]);

  const handleLogout = () => navigate('/login');

  // Add indicator keys and default status if missing
  const reports = useMemo(() => {
    return optimisticReports.map(r => ({
      ...r,
      indicator_key: r.indicator_key || generateIndicatorKey(r.type, r.content),
      status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase() : 'Pending'
    }));
  }, [optimisticReports]);

  const areaFiltered = useMemo(() => {
    if (selectedArea === 'All South Chennai') return reports;
    return reports.filter(r => (r.area || '').toLowerCase() === selectedArea.toLowerCase());
  }, [reports, selectedArea]);

  // Group by Indicator Key (Campaigns definition: 2+ non-rejected reports)
  const groupedByKey = useMemo(() => {
    const groups = {};
    areaFiltered.forEach(r => {
      const k = r.indicator_key;
      if (!groups[k]) groups[k] = { key: k, reports: [], approved: 0, pending: 0, rejected: 0, firstSeen: r.created_at, lastSeen: r.created_at, type: r.type, content: r.content, areas: new Set() };
      groups[k].reports.push(r);
      groups[k].areas.add(r.area || 'Unknown');
      if (r.status === 'Approved') groups[k].approved++;
      else if (r.status === 'Rejected') groups[k].rejected++;
      else groups[k].pending++;
      
      const t = new Date(r.created_at);
      if (t < new Date(groups[k].firstSeen)) groups[k].firstSeen = r.created_at;
      if (t > new Date(groups[k].lastSeen)) groups[k].lastSeen = r.created_at;
    });
    return Object.values(groups).sort((a,b) => new Date(b.lastSeen) - new Date(a.lastSeen));
  }, [areaFiltered]);

  const campaigns = useMemo(() => {
    return groupedByKey.filter(g => (g.approved + g.pending) >= 2);
  }, [groupedByKey]);

  const topDomains = useMemo(() => {
    const nonRejected = areaFiltered.filter(r => r.status !== 'Rejected');
    const counts = {};
    nonRejected.forEach(r => {
      if (r.type === 'web') {
        const k = r.indicator_key;
        counts[k] = (counts[k] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [areaFiltered]);

  const nonRejectedReports = areaFiltered.filter(r => r.status !== 'Rejected');
  const totalReports = nonRejectedReports.length;
  const uniqueUrls = new Set(nonRejectedReports.filter(r => r.type === 'web').map(r => r.indicator_key));

  let scamCount = 0, suspCount = 0, safeCount = 0;
  nonRejectedReports.forEach(r => {
    if (r.classification === 'Scam') scamCount++;
    else if (r.classification === 'Suspicious') suspCount++;
    else safeCount++;
  });
  const scamPct = totalReports ? Math.round((scamCount / totalReports) * 100) : 0;
  const suspPct = totalReports ? Math.round((suspCount / totalReports) * 100) : 0;
  const safePct = totalReports ? Math.round((safeCount / totalReports) * 100) : 0;

  // Donut slices for Classification
  const scamLen = (scamPct / 100) * 100;
  const suspLen = (suspPct / 100) * 100;
  const safeLen = (safePct / 100) * 100;

  // Top Areas Data for Donut
  const areaData = useMemo(() => {
    const counts = {};
    nonRejectedReports.forEach(r => {
      let a = (r.area || 'Unknown').trim();
      a = a.charAt(0).toUpperCase() + a.slice(1).toLowerCase();
      counts[a] = (counts[a] || 0) + 1;
    });
    let sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    if (sorted.length > 6) {
      const top = sorted.slice(0, 6);
      const otherCount = sorted.slice(6).reduce((sum, item) => sum + item[1], 0);
      sorted = [...top, ['Other', otherCount]];
    }
    return sorted;
  }, [nonRejectedReports]);
  const areaColors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#94A3B8'];

  // Recent Reports Table State
  const [tableTab, setTableTab] = useState('All'); // All, Pending, Approved, Rejected
  const [typeFilter, setTypeFilter] = useState('All');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (key) => {
    setExpandedGroups(prev => ({...prev, [key]: !prev[key]}));
  };

  const filteredGroups = useMemo(() => {
    let filtered = groupedByKey;
    if (tableTab === 'Pending') filtered = filtered.filter(g => g.pending > 0);
    else if (tableTab === 'Approved') filtered = filtered.filter(g => g.approved > 0);
    else if (tableTab === 'Rejected') filtered = filtered.filter(g => g.rejected > 0);
    else {
      filtered = filtered.filter(g => g.approved > 0 || g.pending > 0);
    }
    
    if (typeFilter === 'Web') filtered = filtered.filter(g => g.type === 'web');
    if (typeFilter === 'SMS') filtered = filtered.filter(g => g.type === 'sms');
    
    return filtered;
  }, [groupedByKey, tableTab, typeFilter]);

  const totalPages = Math.ceil(filteredGroups.length / rowsPerPage);
  const currentGroups = filteredGroups.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const [toast, setToast] = useState('');
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleUpdateStatus = async (reportId, newStatus) => {
    const original = optimisticReports.find(r => r.id === reportId);
    if (!original) return;
    
    setOptimisticReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
    
    if (isSampleMode) {
      showToast(`Report ${newStatus.toLowerCase()}`);
      return;
    }

    try {
      const { error } = await supabase.from('reports').update({ 
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'analyst_1'
      }).eq('id', reportId);
      if (error) throw error;
      showToast(`Report ${newStatus.toLowerCase()}`);
    } catch (e) {
      setOptimisticReports(prev => prev.map(r => r.id === reportId ? original : r));
      showToast('Error updating status');
    }
  };

  const handleApproveAll = async () => {
    const pendingIds = currentGroups.flatMap(g => g.reports).filter(r => r.status === 'Pending').map(r => r.id);
    if (pendingIds.length === 0) return;
    if (!window.confirm(`Approve ${pendingIds.length} visible pending reports?`)) return;

    setOptimisticReports(prev => prev.map(r => pendingIds.includes(r.id) ? { ...r, status: 'Approved' } : r));
    
    if (isSampleMode) {
      showToast(`${pendingIds.length} reports approved`);
      return;
    }

    try {
      const { error } = await supabase.from('reports').update({ 
        status: 'Approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'analyst_1'
      }).in('id', pendingIds);
      if (error) throw error;
      showToast(`${pendingIds.length} reports approved`);
    } catch (e) {
      showToast('Error approving some reports');
    }
  };

  const [campaignDrawerOpen, setCampaignDrawerOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <style>
        {`
          .dashboard-shell {
            min-height: 100dvh;
            width: 100%;
            background: #F6F8FC;
            font-family: 'Inter', var(--font-body);
            display: flex;
            flex-direction: column;
          }
          
          html {
            font-size: clamp(12px, min(1vw, 1.6vh), 16px);
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
            position: sticky;
            top: 0;
            z-index: 50;
          }

          .dashboard-content {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            padding: 1.25rem 2rem;
            width: 100%;
            max-width: 1920px;
            margin: 0 auto;
          }

          .grid-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1.25rem;
          }

          .grid-main {
            display: grid;
            grid-template-columns: 6fr 4fr;
            gap: 1.25rem;
          }

          .card {
            background: #fff;
            border-radius: 14px;
            border: 1px solid #E6EAF2;
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
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

          .segmented-control {
            display: flex;
            background: #F1F5F9;
            border-radius: 2rem;
            padding: 0.25rem;
          }
          .segment {
            padding: 0.35rem 1rem;
            border-radius: 1.5rem;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            color: #64748B;
            transition: all 0.2s;
          }
          .segment.active {
            background: #fff;
            color: #3B82F6;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          .drawer {
            position: fixed;
            top: 0;
            right: 0;
            width: 450px;
            height: 100dvh;
            background: #fff;
            box-shadow: -4px 0 15px rgba(0,0,0,0.05);
            z-index: 100;
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
          }
          .drawer.open {
            transform: translateX(0);
          }
          .drawer-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 27, 76, 0.2);
            z-index: 99;
            backdrop-filter: blur(2px);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
          }
          .drawer-overlay.open {
            opacity: 1;
            pointer-events: auto;
          }
        `}
      </style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#0F1B4C', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', zIndex: 9999, fontWeight: '500', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          {toast}
        </div>
      )}

      <div className={`drawer-overlay ${campaignDrawerOpen ? 'open' : ''}`} onClick={() => setCampaignDrawerOpen(false)}></div>
      <div className={`drawer ${campaignDrawerOpen ? 'open' : ''}`}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #E6EAF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0F1B4C', fontFamily: 'var(--font-head)' }}>Campaigns Detected</h2>
          <button onClick={() => setCampaignDrawerOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#64748B' }}>&times;</button>
        </div>
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {campaigns.map(c => {
             const cType = c.type === 'web' ? 'Link/Domain' : 'Phone/SMS/UPI';
             const isActive = new Date(c.lastSeen) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
             return (
              <div key={c.key} style={{ border: '1px solid #E6EAF2', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '700', color: '#0F1B4C', fontSize: '0.95rem' }}>{c.key} cluster</div>
                  <div style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: isActive ? '#D1FAE5' : '#F1F5F9', color: isActive ? '#10B981' : '#64748B', fontWeight: '600' }}>{isActive ? 'Active' : 'Inactive'}</div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1rem' }}>
                  <strong>How detected: </strong> {c.reports.length} reports share indicator <strong>{c.key}</strong> ({cType})
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button style={{ flex: 1, background: '#F1F5F9', border: 'none', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }} onClick={() => { setActiveTab('Map'); setSelectedCampaign(c.key); setCampaignDrawerOpen(false); }}>View Map</button>
                  <button style={{ flex: 1, background: '#F1F5F9', border: 'none', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }} onClick={() => { setActiveTab('Network'); setSelectedCampaign(c.key); setCampaignDrawerOpen(false); }}>View Network</button>
                </div>
              </div>
            )
          })}
          {campaigns.length === 0 && <div style={{ color: '#64748B', textAlign: 'center', marginTop: '2rem' }}>No campaigns detected yet.</div>}
        </div>
      </div>

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

      <main className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

        {/* Row 1: KPI Stats */}
        <div className="grid-stats">
          <StatCard title="Total Reports" value={totalReports} color="#EF4444" bg="#FEE2E2" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          <StatCard title="Unique Domains" value={uniqueUrls.size} color="#8B5CF6" bg="#EDE9FE" icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          <StatCard title="Campaigns Detected" value={campaigns.length} color="#3B82F6" bg="#DBEAFE" icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" clickable onClick={() => setCampaignDrawerOpen(true)} />
          <StatCard title="Linked Indicators" value={groupedByKey.filter(g => g.reports.length > 1).length} color="#10B981" bg="#D1FAE5" icon="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" clickable onClick={() => { setCampaignDrawerOpen(true) }} />
        </div>

        {/* Row 2: Main Panels */}
        <div className="grid-main">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '0', flex: 1, minHeight: '420px' }}>
              <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="card-header">
                    <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Campaign Intelligence
                  </div>
                  <div className="card-subtitle">Geographic distribution of reports in South Chennai</div>
                </div>
                <div className="segmented-control" style={{ background: '#F1F5F9', borderRadius: '0.5rem', padding: '0.25rem' }}>
                   <button onClick={() => setActiveTab('Map')} style={{ padding: '0.25rem 1rem', borderRadius: '0.25rem', border: 'none', background: activeTab === 'Map' ? '#3B82F6' : 'transparent', color: activeTab === 'Map' ? '#fff' : '#64748B', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer', boxShadow: activeTab === 'Map' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>Map</button>
                   <button onClick={() => setActiveTab('Network')} style={{ padding: '0.25rem 1rem', borderRadius: '0.25rem', border: 'none', background: activeTab === 'Network' ? '#3B82F6' : 'transparent', color: activeTab === 'Network' ? '#fff' : '#64748B', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer', boxShadow: activeTab === 'Network' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>Network</button>
                </div>
              </div>
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: '300px' }} ref={graphContainerRef}>
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
                               reports={nonRejectedReports} 
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

            <div className="card" style={{ padding: '16px' }}>
              <div className="card-header" style={{ margin: 0, marginBottom: '1rem' }}>
                <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Campaigns Detected
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {campaigns.length === 0 ? <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>No campaigns</div> : campaigns.map(c => (
                  <div key={c.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#0F1B4C', fontSize: '0.85rem' }}>{c.key} cluster</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{c.reports.length} reports</div>
                    </div>
                    <button style={{ background: '#E0E7FF', color: '#4338CA', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }} onClick={() => { setActiveTab('Network'); setSelectedCampaign(c.key); }}>View</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
             <div className="card">
               <div className="card-header">
                 <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                 Report Classification
               </div>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                 <div style={{ width: '150px', height: '150px', position: 'relative' }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                       <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                       {scamLen > 0 && <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray={`${scamLen} ${100 - scamLen}`} />}
                       {suspLen > 0 && <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#FBBF24" strokeWidth="4" strokeDasharray={`${suspLen} ${100 - suspLen}`} strokeDashoffset={-scamLen} />}
                       {safeLen > 0 && <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray={`${safeLen} ${100 - safeLen}`} strokeDashoffset={-(scamLen + suspLen)} />}
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontWeight: '800', fontSize: '1.25rem', color: '#0F1B4C', fontFamily: 'var(--font-head)' }}>{totalReports}</span>
                      <span style={{ fontSize: '0.6rem', color: '#64748B' }}>Reports</span>
                    </div>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, minWidth: '40%' }}>
                   <LegendItem color="#EF4444" label="Scam" pct={`${scamPct}%`} val={`(${scamCount})`} />
                   <LegendItem color="#FBBF24" label="Suspicious" pct={`${suspPct}%`} val={`(${suspCount})`} />
                   <LegendItem color="#10B981" label="Safe" pct={`${safePct}%`} val={`(${safeCount})`} />
                 </div>
               </div>
             </div>

             <div className="card">
               <div className="card-header" style={{ marginBottom: '1rem' }}>
                 <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 Top Areas
               </div>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                 <div style={{ width: '150px', height: '150px', position: 'relative' }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                       <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                       {(() => {
                         let offset = 0;
                         return areaData.map(([name, count], i) => {
                           const pct = (count / Math.max(1, totalReports)) * 100;
                           if (pct === 0) return null;
                           const color = areaColors[i % areaColors.length];
                           const path = <path key={name} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={color} strokeWidth="4" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-offset} />;
                           offset += pct;
                           return path;
                         });
                       })()}
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontWeight: '800', fontSize: '1.25rem', color: '#0F1B4C', fontFamily: 'var(--font-head)' }}>{areaData.length}</span>
                      <span style={{ fontSize: '0.6rem', color: '#64748B' }}>Areas</span>
                    </div>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, minWidth: '40%' }}>
                   {areaData.map(([name, count], i) => (
                     <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => setSelectedArea(selectedArea === name ? 'All South Chennai' : name)}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: areaColors[i % areaColors.length] }}></div>
                         <span style={{ color: selectedArea === name ? '#3B82F6' : '#0F1B4C', fontWeight: selectedArea === name ? '700' : '600' }}>{name}</span>
                       </div>
                       <div style={{ display: 'flex', gap: '0.5rem', color: '#64748B' }}>
                         <span>{Math.round((count / Math.max(1, totalReports)) * 100)}%</span>
                         <span style={{ fontSize: '0.75rem' }}>({count})</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div className="card-header" style={{ margin: 0 }}>
                  <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                  Top Reported Domains
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                 {topDomains.length === 0 ? <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>No domains reported</div> : topDomains.map(([domain, count], i) => (
                   <div key={domain} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => { setTypeFilter('Web'); setActiveTab('Network'); setSelectedCampaign(domain); }}>
                      <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#3B82F6', flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                         <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '600', fontSize: '0.85rem', color: '#0F1B4C', marginBottom: '4px' }}>{domain}</div>
                         <div style={{ width: '100%', background: '#EEF2F7', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
                            <div style={{ width: `${(count / topDomains[0][1]) * 100}%`, background: '#EF4444', height: '100%', borderRadius: '6px' }}></div>
                         </div>
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#475569', minWidth: '2rem', textAlign: 'right' }}>{count}</div>
                   </div>
                 ))}
              </div>
            </div>

          </div>
        </div>

        {/* Row 4: Recent Reports Table */}
        <div className="card" style={{ padding: '0', flex: 1 }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #E6EAF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="card-header" style={{ margin: 0 }}>
                <svg width="1.25rem" height="1.25rem" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Recent Reports
              </div>
              <div className="card-subtitle" style={{ marginBottom: 0 }}>Grouped by Indicator Key</div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="segmented-control" style={{ background: '#F1F5F9' }}>
                {['All', 'Pending', 'Approved', 'Rejected'].map(t => (
                  <div key={t} className={`segment ${tableTab === t ? 'active' : ''}`} onClick={() => { setTableTab(t); setPage(1); }}>{t}</div>
                ))}
              </div>
              <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid #E6EAF2', outline: 'none' }}>
                <option value="All">All Types</option>
                <option value="Web">Web (Links)</option>
                <option value="SMS">SMS/Text</option>
              </select>
              {tableTab === 'Pending' && (
                <button 
                  onClick={handleApproveAll}
                  style={{ background: '#10B981', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Approve All Pending
                </button>
              )}
            </div>
          </div>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', fontSize: '0.875rem', tableLayout: 'fixed' }}>
              <thead style={{ background: '#F8FAFC' }}>
                <tr style={{ color: '#64748B', textAlign: 'left', fontSize: '0.8rem' }}>
                  <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #E6EAF2', width: '25%' }}>Indicator Key</th>
                  <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #E6EAF2', width: '8%' }}>Type</th>
                  <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #E6EAF2', width: '15%' }}>Areas</th>
                  <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #E6EAF2', width: '12%' }}>Reports</th>
                  <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #E6EAF2', width: '12%' }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #E6EAF2', width: '15%' }}>Last Seen</th>
                  <th style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid #E6EAF2', width: '13%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentGroups.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>No reports match the current filters.</td></tr>
                ) : currentGroups.map(g => {
                  const isExpanded = expandedGroups[g.key];
                  // Determine overall status for group (e.g. if any pending, show pending actions, else show dominant)
                  let overallStatus = 'Pending';
                  if (g.pending > 0) overallStatus = 'Pending';
                  else if (g.approved > 0) overallStatus = 'Approved';
                  else overallStatus = 'Rejected';
                  
                  let sColor = '#F59E0B', sBg = '#FEF3C7';
                  if (overallStatus === 'Approved') { sColor = '#10B981'; sBg = '#D1FAE5'; }
                  if (overallStatus === 'Rejected') { sColor = '#EF4444'; sBg = '#FEE2E2'; }

                  return (
                    <React.Fragment key={g.key}>
                      <tr style={{ borderBottom: '1px solid #E6EAF2', height: '3rem', background: isExpanded ? '#F8FAFC' : '#fff' }}>
                        <td style={{ padding: '0.75rem 1rem', color: '#0F1B4C', fontWeight: '600' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => toggleGroup(g.key)}>
                            <span style={{ display: 'inline-block', width: '1rem', textAlign: 'center', color: '#94A3B8' }}>{isExpanded ? '▼' : '▶'}</span>
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.key}</div>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#F1F5F9', color: '#475569', fontWeight: '600', textTransform: 'uppercase' }}>{g.type}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {Array.from(g.areas).join(', ')}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#3B82F6' }}>
                          x{g.reports.length}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '600', color: sColor, background: sBg }}>{overallStatus}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>
                          {new Date(g.lastSeen).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          {overallStatus === 'Pending' && (
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button onClick={() => g.reports.forEach(r => handleUpdateStatus(r.id, 'Approved'))} style={{ background: '#D1FAE5', color: '#10B981', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>Approve</button>
                              <button onClick={() => g.reports.forEach(r => handleUpdateStatus(r.id, 'Rejected'))} style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>Reject</button>
                            </div>
                          )}
                          {overallStatus === 'Rejected' && (
                            <button onClick={() => g.reports.forEach(r => handleUpdateStatus(r.id, 'Pending'))} style={{ background: '#F1F5F9', color: '#475569', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>Undo</button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && g.reports.map(r => {
                        let cColor = r.classification === 'Scam' ? '#EF4444' : r.classification === 'Safe' ? '#10B981' : '#F59E0B';
                        let cBg = r.classification === 'Scam' ? '#FEE2E2' : r.classification === 'Safe' ? '#D1FAE5' : '#FEF3C7';
                        return (
                          <tr key={r.id} style={{ background: '#F8FAFC', borderBottom: '1px solid #EEF2F7' }}>
                            <td style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', color: '#64748B', fontSize: '0.8rem' }}>#{String(r.id).slice(0,6)}</td>
                            <td colSpan="2" style={{ padding: '0.5rem 1rem', color: '#475569', fontSize: '0.8rem' }}><div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.content}</div></td>
                            <td colSpan="1" style={{ padding: '0.5rem 1rem' }}><span style={{ padding: '2px 6px', borderRadius: '1rem', fontSize: '0.65rem', fontWeight: '600', color: cColor, background: cBg }}>{r.classification}</span></td>
                            <td colSpan="3" style={{ padding: '0.5rem 1rem', color: '#94A3B8', fontSize: '0.75rem', textAlign: 'right' }}>{new Date(r.created_at).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E6EAF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Showing {(page-1)*rowsPerPage + 1}-{Math.min(page*rowsPerPage, filteredGroups.length)} of {filteredGroups.length} groups</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button disabled={page === 1} onClick={() => setPage(p => p-1)} style={{ padding: '0.4rem 1rem', border: '1px solid #E6EAF2', background: '#fff', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#CBD5E1' : '#475569', fontWeight: '600', fontSize: '0.8rem' }}>Prev</button>
                <button disabled={page === totalPages} onClick={() => setPage(p => p+1)} style={{ padding: '0.4rem 1rem', border: '1px solid #E6EAF2', background: '#fff', borderRadius: '6px', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? '#CBD5E1' : '#475569', fontWeight: '600', fontSize: '0.8rem' }}>Next</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
