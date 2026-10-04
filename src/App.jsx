import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import HomePage from './pages/HomePage';
import ResultPage from './pages/ResultPage';
import ReportPage from './pages/ReportPage';
import ThreatsPage from './pages/ThreatsPage';
import GuidePage from './pages/GuidePage';
import LeaderboardPage from './pages/LeaderboardPage';
import BottomTabBar from './components/BottomTabBar';
import MobileTopBar from './components/MobileTopBar';
import SettingsModal from './components/SettingsModal';
import MobileLoginPage from './pages/MobileLoginPage';
import { supabase } from './utils/supabase';

import DesktopGateway from './pages/DesktopGateway';
import AnalystLogin from './pages/AnalystLogin';
import AnalystDashboard from './pages/AnalystDashboard';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <LanguageProvider initialLanguage="en">
    <BrowserRouter>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      
      {!isMobile ? (
        <Routes>
          <Route path="/" element={<DesktopGateway />} />
          <Route path="/login" element={<AnalystLogin />} />
          <Route path="/dashboard" element={<AnalystDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        authLoading ? (
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
        ) : !user ? (
          <MobileLoginPage />
        ) : (
          <div className="app-shell">
            <div className="main-content">
              <MobileTopBar onOpenSettings={() => setShowSettings(true)} />
              <main className="page-scroll" style={{ paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/result" element={<ResultPage />} />
                  <Route path="/report" element={<ReportPage />} />
                  <Route path="/threats" element={<ThreatsPage />} />
                  <Route path="/guide" element={<GuidePage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <BottomTabBar />
            </div>
          </div>
        )
      )}
    </BrowserRouter>
    </LanguageProvider>
  );
}

