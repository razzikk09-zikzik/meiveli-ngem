import { navItems } from '../data/mock';
import { useLocation, Link } from 'react-router-dom';
import { Home, ShieldAlert, TriangleAlert, BookOpen, FileText } from 'lucide-react';

const iconMap = {
  Home,
  ShieldAlert,
  TriangleAlert,
  BookOpen,
  FileText
};

export default function BottomTabBar() {
  const location = useLocation();

  const getRoute = (id) => id === 'home' ? '/' : `/${id}`;

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#ffffff',
        borderTop: '1px solid #E6EAF2',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 'calc(4rem + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 1000,
      }}
    >
      {navItems.slice(0, 5).map((item) => {
        const route = getRoute(item.id);
        const isActive = location.pathname === route;
        const Icon = iconMap[item.icon];
        return (
          <Link
            key={item.id}
            to={route}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '44px',
              minHeight: '44px',
              textDecoration: 'none',
              color: isActive ? '#2563EB' : '#64748b',
              gap: '0.25rem',
            }}
          >
            {Icon && <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />}
            <span style={{ fontSize: '0.65rem', fontWeight: isActive ? '600' : '500' }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
