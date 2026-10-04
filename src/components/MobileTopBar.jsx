import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../utils/supabase';
import { LogOut } from 'lucide-react';

export default function MobileTopBar({ onOpenSettings }) {
  const { language, setLanguage, t } = useLanguage();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error logging in:', error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowDropdown(false);
  };

  return (
    <header
      style={{
        height: '3.5rem',
        background: '#ffffff',
        borderBottom: '1px solid #E6EAF2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        flexShrink: 0,
      }}
    >
      <button onClick={onOpenSettings} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
        <img src="/assets/logo.png" alt="MEYVIZHI logo" style={{ height: '32px', objectFit: 'contain' }} />
      </button>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', borderRadius: '1.25rem', padding: '0.125rem' }}>
          <button
            onClick={() => setLanguage('en')}
            style={{
              padding: '0.375rem 0.625rem', borderRadius: '1rem', border: 'none', background: language === 'en' ? '#2563EB' : 'transparent', color: language === 'en' ? '#fff' : '#64748b', fontFamily: "var(--font-head)", fontWeight: '700', fontSize: '0.75rem',
            }}
          >EN</button>
          <button
            onClick={() => setLanguage('ta')}
            style={{
              padding: '0.375rem 0.625rem', borderRadius: '1rem', border: 'none', background: language === 'ta' ? '#2563EB' : 'transparent', color: language === 'ta' ? '#fff' : '#64748b', fontFamily: "var(--font-tamil)", fontWeight: '500', fontSize: '0.75rem',
            }}
          >தமிழ்</button>
        </div>

        {/* User Profile / Login */}
        <div style={{ position: 'relative' }}>
          {user ? (
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                width: '2rem', height: '2rem', borderRadius: '50%', overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#2563EB', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {user.user_metadata?.full_name?.charAt(0) || 'U'}
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={handleLogin}
              style={{
                background: '#F1F5F9', border: 'none', padding: '0.375rem 0.75rem', borderRadius: '1rem',
                color: '#2563EB', fontFamily: "var(--font-head)", fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer'
              }}
            >
              {t('login')}
            </button>
          )}

          {showDropdown && user && (
            <>
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
                onClick={() => setShowDropdown(false)}
              />
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                background: 'white', border: '1px solid #E6EAF2', borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '0.25rem', zIndex: 100,
                minWidth: '10rem'
              }}>
                <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #F1F5F9', marginBottom: '0.25rem' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.user_metadata?.full_name || 'Citizen'}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                    padding: '0.5rem 0.75rem', background: 'none', border: 'none',
                    color: '#EF4444', fontSize: '0.875rem', fontWeight: '500',
                    cursor: 'pointer', textAlign: 'left', borderRadius: '0.25rem'
                  }}
                >
                  <LogOut size={16} />
                  {t('logout')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
