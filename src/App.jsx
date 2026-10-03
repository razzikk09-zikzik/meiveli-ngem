import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import HomePage from './pages/HomePage';
import ResultPage from './pages/ResultPage';
import ReportPage from './pages/ReportPage';
import ThreatsPage from './pages/ThreatsPage';
import GuidePage from './pages/GuidePage';
import HelpPage from './pages/HelpPage';
import BottomTabBar from './components/BottomTabBar';
import MobileTopBar from './components/MobileTopBar';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [language, setLanguage] = useState('ta');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <BrowserRouter>
      <div className="app-shell">
        {!isMobile && (
          <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />
        )}
        <div className="main-content">
          {isMobile ? (
            <MobileTopBar language={language} onLanguageToggle={setLanguage} />
          ) : (
            <TopBar language={language} onLanguageToggle={setLanguage} />
          )}
          <main className="page-scroll" style={{ paddingBottom: isMobile ? 'calc(4.5rem + env(safe-area-inset-bottom))' : '1rem' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/result" element={<ResultPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/threats" element={<ThreatsPage />} />
              <Route path="/guide" element={<GuidePage />} />
              <Route path="/help" element={<HelpPage />} />
            </Routes>
          </main>
          {isMobile && <BottomTabBar />}
        </div>
      </div>
    </BrowserRouter>
  );
}
