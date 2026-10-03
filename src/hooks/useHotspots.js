import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const AREAS = {
  'Velachery': { lat: 12.9815, lng: 80.2180 },
  'Sholinganallur': { lat: 12.9010, lng: 80.2279 },
  'Adyar': { lat: 13.0012, lng: 80.2565 },
  'Perungudi': { lat: 12.9654, lng: 80.2461 },
  'Medavakkam': { lat: 12.9231, lng: 80.1925 },
  'Tharamani': { lat: 12.9850, lng: 80.2425 }
};

const SAMPLE_DATA = [
  ...Array(15).fill({ area: 'Velachery', classification: 'Scam', type: 'web' }),
  ...Array(8).fill({ area: 'Sholinganallur', classification: 'Suspicious', type: 'sms' }),
  ...Array(5).fill({ area: 'Adyar', classification: 'Scam', type: 'web' }),
  ...Array(3).fill({ area: 'Perungudi', classification: 'Suspicious', type: 'sms' }),
  ...Array(2).fill({ area: 'Medavakkam', classification: 'Scam', type: 'web' }),
];

export function useHotspots(isSampleMode = false) {
  const [reports, setReports] = useState([]);
  
  useEffect(() => {
    if (isSampleMode) {
      setReports(SAMPLE_DATA);
      return;
    }

    const fetchInitial = async () => {
      const { data } = await supabase.from('reports').select('id, type, content, area, classification, status, created_at').order('created_at', { ascending: false }).limit(200);
      if (data) setReports(data);
    };

    fetchInitial();

    const sub = supabase.channel('realtime_reports')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, (payload) => {
        setReports(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [isSampleMode]);

  const locData = {};
  Object.keys(AREAS).forEach(k => {
    locData[k] = { name: k, ...AREAS[k], reports: 0, types: {}, latestTime: null };
  });

  reports.forEach(r => {
    // Only map scams and suspicious
    if (r.classification !== 'Scam' && r.classification !== 'Suspicious') return;
    
    let loc = (r.area || '').trim();
    if (loc) {
      loc = loc.charAt(0).toUpperCase() + loc.slice(1).toLowerCase();
    } else {
      loc = 'Unknown';
    }
    
    if (loc && locData[loc]) {
      locData[loc].reports += 1;
      
      const typeStr = r.type === 'web' ? 'Phishing URL' : 'SMS Scam';
      locData[loc].types[typeStr] = (locData[loc].types[typeStr] || 0) + 1;
      
      if (!locData[loc].latestTime || new Date(r.created_at) > new Date(locData[loc].latestTime)) {
        locData[loc].latestTime = r.created_at;
      }
    }
  });

  // Calculate dominant type and risk level
  const hotspots = Object.values(locData)
    .filter(h => h.reports > 0)
    .map(h => {
      let dominant = 'Unknown';
      let maxCount = 0;
      Object.entries(h.types).forEach(([t, count]) => {
        if (count > maxCount) { maxCount = count; dominant = t; }
      });
      return {
        ...h,
        dominantType: dominant,
        risk: h.reports >= 10 ? 'high' : h.reports >= 5 ? 'medium' : 'low'
      };
    });

  return { reports, hotspots };
}
