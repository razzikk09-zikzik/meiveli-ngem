import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export default function AnalystLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Check if user is analyst
      const { data: profile } = await supabase
        .from('analysts')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (profile?.role === 'analyst') {
        navigate('/dashboard');
      } else {
        await supabase.auth.signOut();
        setError('Unauthorized: You are not registered as an analyst.');
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '1rem' }}>
      <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '24rem' }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', textAlign: 'center', color: '#0F172A' }}>Analyst Portal</h2>
        
        {error && (
          <div style={{ padding: '0.75rem', background: '#FEE2E2', color: '#DC2626', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', marginBottom: '0.5rem' }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', background: '#F8FAFC', outline: 'none' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', marginBottom: '0.5rem' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', background: '#F8FAFC', outline: 'none' }} 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '0.5rem', width: '100%', padding: '0.875rem', borderRadius: '0.5rem', border: 'none', background: '#2563EB', color: '#fff', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Authenticating...' : 'Login to Dashboard'}
          </button>
        </form>
        
        <button 
          onClick={() => navigate('/')} 
          style={{ width: '100%', marginTop: '1rem', padding: '0.875rem', borderRadius: '0.5rem', border: 'none', background: 'transparent', color: '#64748B', fontWeight: '600', cursor: 'pointer' }}
        >
          Back to Gateway
        </button>
      </div>
    </div>
  );
}
