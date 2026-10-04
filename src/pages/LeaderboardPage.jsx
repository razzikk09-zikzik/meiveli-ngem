import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useLanguage } from '../context/LanguageContext';
import { Trophy, Medal, AlertCircle } from 'lucide-react';

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, avatar_url, points')
        .order('points', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.25rem', paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '32rem', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#FEF3C7', color: '#D97706', width: '3rem', height: '3rem', borderRadius: '50%', marginBottom: '0.75rem' }}>
          <Trophy size={24} strokeWidth={2.5} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>
          {t('leaderboard')}
        </h1>
        <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Community heroes protecting our neighborhoods.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>{t('loading')}</div>
      ) : profiles.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #CBD5E1', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          <AlertCircle size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <p style={{ fontSize: '0.875rem' }}>{t('noProfiles')}</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #E6EAF2', overflow: 'hidden' }}>
          {profiles.map((profile, index) => {
            const isTop3 = index < 3;
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: index !== profiles.length - 1 ? '1px solid #F1F5F9' : 'none',
                  background: isTop3 ? (index === 0 ? '#FFFAF0' : index === 1 ? '#F8FAFC' : '#FFF7ED') : '#fff'
                }}
              >
                {/* Rank */}
                <div style={{ width: '2.5rem', display: 'flex', justifyContent: 'center', fontWeight: '800', color: isTop3 ? '#D97706' : '#94A3B8', fontSize: isTop3 ? '1.125rem' : '0.9375rem' }}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>

                {/* Avatar */}
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#E2E8F0', overflow: 'hidden', margin: '0 0.875rem', flexShrink: 0 }}>
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1.25rem', fontWeight: 'bold' }}>
                      {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '0.9375rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile.name || 'Anonymous Hero'}
                  </div>
                </div>

                {/* Points */}
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.25rem', background: isTop3 ? '#FEF3C7' : '#F1F5F9', padding: '0.25rem 0.625rem', borderRadius: '1rem', color: isTop3 ? '#B45309' : '#64748b', fontWeight: '700', fontSize: '0.8125rem' }}>
                  <Medal size={14} />
                  {profile.points}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
