import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import AdsterraBanner from './components/AdsterraBanner';
import { userPreferenceAPI } from "./api/axios";
import ScrollToTop from './components/shared/ScrollToTop';

// Lazy load page components
import Home from './components/Home';
const Login = lazy(() => import('./components/Login'));
const Signup = lazy(() => import('./components/Signup'));
const Strategies = lazy(() => import('./components/Strategies'));
const Calculator = lazy(() => import('./components/Calculator'));
const Settings = lazy(() => import('./components/Settings'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const Unauthorized = lazy(() => import('./components/Unauthorized'));
const ChartPage = lazy(() => import('./components/ChartPage'));
const HeatmapV2 = lazy(() => import('./components/HeatmapV2'));
const PageNotFound = lazy(() => import('./components/PageNotFound'));
const GoogleCallback = lazy(() => import('./components/GoogleCallback'));

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
  const authContext = useAuth();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (authContext?.user?.theme) {
      const userTheme = authContext.user.theme === 'DARK' ? 'dark' : 'light';
      if (theme !== userTheme) {
        setTheme(userTheme);
        localStorage.setItem('theme', userTheme);
      }
    }
  }, [authContext?.user, theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    if (authContext?.user) {
      userPreferenceAPI.updateTheme(newTheme.toUpperCase());
      if (authContext?.login) {
        authContext.login({ ...authContext.user, theme: newTheme.toUpperCase() });
      }
    }
  };

  if (!authContext || authContext.loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col bg-background text-foreground relative">
        <Header toggleTheme={toggleTheme} theme={theme} />

        <main className="flex-grow flex flex-col min-h-0 pb-[100px] md:pb-0">
          <AnimatedRoutes auth={authContext.appConfig.auth} />
        </main>
        
        {import.meta.env.VITE_ENV === 'production' && (
          <div className="hidden md:flex w-full justify-center py-4 bg-background">
            <AdsterraBanner />
          </div>
        )}

        <div className="hidden md:block">
          <Footer />
        </div>
      </div>
    </Router>
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
        <Route path="/heatmap" element={<PageWrapper><HeatmapV2 /></PageWrapper>} />
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