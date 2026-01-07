import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import AdsterraBanner from './components/AdsterraBanner';
import { userPreferenceAPI } from "./api/axios";
import ScrollToTop from './components/shared/ScrollToTop';
import LoadingScreen from './components/LoadingScreen';

// Lazy load page components
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Strategies from './components/Strategies';
import Calculator from './components/Calculator';
import Settings from './components/Settings';
import AdminDashboard from './components/AdminDashboard';
import Unauthorized from './components/Unauthorized';
import ChartPage from './components/ChartPage';
import Heatmap from './components/Heatmap';
import PageNotFound from './components/PageNotFound';
import GoogleCallback from './components/GoogleCallback';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.2 } }}
    transition={{
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }}
    className="w-full flex-grow flex flex-col"
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

function AppContent() {
  const hasHydratedTheme = useRef(false)
  const authContext = useAuth();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!authContext?.user?.theme) return
    if (!hasHydratedTheme.current) {
      const userTheme = authContext.user.theme === 'DARK' ? 'dark' : 'light';
      setTheme(userTheme);
      localStorage.setItem('theme', userTheme);
      document.documentElement.classList.toggle('dark', userTheme === 'dark');

      hasHydratedTheme.current = true;
    }
  }, [authContext?.user]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');

    if (authContext?.user) {
      userPreferenceAPI.updateTheme(newTheme.toUpperCase());
      if (authContext?.login) {
        authContext.login({ ...authContext.user, theme: newTheme.toUpperCase() }, false);
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {(!authContext || authContext.appLoading) ? (
        <LoadingScreen key="loading" />
      ) : (
        <Router key="main">
          <ScrollToTop />
          <div className="flex min-h-screen flex-col bg-background text-foreground relative">
            <Header toggleTheme={toggleTheme} theme={theme} />

            <main className={`flex-grow flex flex-col min-h-0 pb-[100px] md:pb-0 ${import.meta.env.VITE_ENV === 'production' ? 'pt-[60px] md:pt-0' : ''}`}>
              <AnimatedRoutes auth={authContext.appConfig.auth} />
            </main>

            {import.meta.env.VITE_ENV === 'production' && (
              <div className="fixed top-16 left-0 right-0 z-30 flex w-full justify-center px-4 py-2 bg-background/80 backdrop-blur-md border-b border-border/40 md:relative md:top-auto md:left-auto md:right-auto md:z-0 md:px-0 md:py-6 md:border-none md:bg-transparent">
                <AdsterraBanner isMobile={isMobile} />
              </div>
            )}

            <div className="hidden md:block">
              <Footer />
            </div>
          </div>
        </Router>
      )}
    </AnimatePresence>
  );
}

function AnimatedRoutes({ auth }) {
  const location = useLocation();

  if (!auth) return null;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.key}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/google/callback" element={<PageWrapper><GoogleCallback /></PageWrapper>} />
        {auth.email && (
          <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
        )}
        <Route path="/strategies" element={<PageWrapper><Strategies /></PageWrapper>} />
        <Route path="/calculator" element={<PageWrapper><Calculator /></PageWrapper>} />
        <Route path="/heatmap" element={<PageWrapper><Heatmap /></PageWrapper>} />
        <Route path="/chart/:symbol" element={<PageWrapper><ChartPage /></PageWrapper>} />

        <Route element={<ProtectedRoute />}>
          <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
        </Route>

        <Route path="/unauthorized" element={<PageWrapper><Unauthorized showLogin={true} /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><PageNotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;