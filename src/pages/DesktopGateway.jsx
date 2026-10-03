import { useNavigate } from 'react-router-dom';

export default function DesktopGateway() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F8FAFC',
      padding: '2rem'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '1.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
        padding: '3rem',
        maxWidth: '32rem',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          width: '4rem', height: '4rem', background: '#EEF2FF', borderRadius: '1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
        }}>
          <svg width="2rem" height="2rem" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <path d="M12 18h.01"></path>
          </svg>
        </div>
        
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.875rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem' }}>
          Please use your phone
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.5', marginBottom: '2.5rem' }}>
          MEYVIZHI is designed as a mobile-first experience. Please visit this site on your smartphone to report and analyze scams.
        </p>

        <div style={{ borderTop: '1px solid #E2E8F0', margin: '2rem 0' }}></div>

        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.125rem', fontWeight: '700', color: '#0F172A', marginBottom: '1rem' }}>
          Are you an Analyst?
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Access the secure portal to review verified threats and community reports.
        </p>
        
        <button
          onClick={() => navigate('/login')}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '0.75rem',
            border: 'none',
            background: '#0F172A',
            color: '#fff',
            fontFamily: 'var(--font-head)',
            fontWeight: '700',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.opacity = 0.9}
          onMouseLeave={(e) => e.target.style.opacity = 1}
        >
          Access Analyst Dashboard
        </button>
      </div>
    </div>
  );
}
