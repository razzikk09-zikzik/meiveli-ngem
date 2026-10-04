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

export const getCategoryDetails = (content, type) => {
  const lower = (content || '').toLowerCase();
  if (lower.includes('kyc') || lower.includes('sbi') || lower.includes('hdfc') || lower.includes('pan') || lower.includes('bank')) {
    return { title: 'Bank KYC scam', category: 'Bank KYC', iconUrl: '/assets/bank_kyc_impersonation.png', color: '#DC2626', bg: '#FEF2F2' };
  }
  if (lower.includes('courier') || lower.includes('delivery') || lower.includes('package') || lower.includes('fedex')) {
    return { title: 'Courier scam', category: 'Courier', iconUrl: '/assets/courier_refund_scam.png', color: '#EA580C', bg: '#FFF7ED' };
  }
  if (lower.includes('upi') || lower.includes('qr') || lower.includes('paytm') || lower.includes('rupees') || lower.includes('rs.')) {
    return { title: 'UPI scam', category: 'UPI', iconUrl: '/assets/upi_payment.png', color: '#9333EA', bg: '#F5F3FF' };
  }
  if (lower.includes('job') || lower.includes('work') || lower.includes('earn') || lower.includes('salary')) {
    return { title: 'Job offer scam', category: 'Job offer', iconUrl: '/assets/fake_job_recruitment.png', color: '#D97706', bg: '#FFFBEB' };
  }
  if (type === 'web') {
    return { title: 'Phishing link', category: 'Fake link', iconUrl: '/assets/website_url.png', color: '#0D9488', bg: '#F0FDFA' };
  }
  return { title: 'Suspicious SMS', category: 'Fake link', iconUrl: '/assets/sms.png', color: '#2563EB', bg: '#EFF6FF' };
};

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
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reports' }, (payload) => {
        setReports(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [isSampleMode]);

  const locData = {};
  Object.keys(AREAS).forEach(k => {
    locData[k] = { name: k, ...AREAS[k], reports: 0, categories: {}, latestTime: null, latestContent: null };
  });

  reports.forEach(r => {
    if (r.classification !== 'Scam' && r.classification !== 'Suspicious') return;
    
    let loc = (r.area || '').trim();
    loc = loc ? loc.charAt(0).toUpperCase() + loc.slice(1).toLowerCase() : 'Unknown';
    
    if (loc && locData[loc]) {
      locData[loc].reports += 1;
      
      const catDetails = getCategoryDetails(r.content, r.type);
      const catKey = JSON.stringify(catDetails);
      locData[loc].categories[catKey] = (locData[loc].categories[catKey] || 0) + 1;
      
      if (!locData[loc].latestTime || new Date(r.created_at) > new Date(locData[loc].latestTime)) {
        locData[loc].latestTime = r.created_at;
        locData[loc].latestContent = r.content;
      }
    }
  });

  const hotspots = Object.values(locData)
    .filter(h => h.reports > 0)
    .map(h => {
      let dominantStr = null;
      let maxCount = 0;
      Object.entries(h.categories).forEach(([cStr, count]) => {
        if (count > maxCount) { maxCount = count; dominantStr = cStr; }
      });
      
      let details = {};
      if (dominantStr) {
        details = JSON.parse(dominantStr);
      }

      return {
        ...h,
        dominantType: details.category || 'Unknown',
        title: details.title || 'Scam',
        category: details.category || 'Fake link',
        iconUrl: details.iconUrl || '/assets/sms.png',
        color: details.color || '#2563EB',
        bg: details.bg || '#EFF6FF',
        risk: h.reports >= 10 ? 'high' : h.reports >= 5 ? 'medium' : 'low'
      };
    });

  return { reports, hotspots };
}
