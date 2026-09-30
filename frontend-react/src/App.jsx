import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';

function AuthWrapper({ children }) {
  const location = useLocation();
  const userId = localStorage.getItem('judol_user_id');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromURL = params.get('user_id');
    
    if (idFromURL) {
        localStorage.setItem('judol_user_id', idFromURL);
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const isPublicPage = location.pathname === '/';
  
  if (!userId && !isPublicPage) {
      window.location.href = '/';
      return null;
  }

  return children;
}

function App() {
  return (
    <Router>
      <AuthWrapper>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
          <Route path="/logs" element={<Layout><LogsPage /></Layout>} />
          <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
        </Routes>
      </AuthWrapper>
    </Router>
  );
}

export default App;
