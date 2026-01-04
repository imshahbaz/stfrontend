import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Backdrop, CircularProgress, useMediaQuery } from '@mui/material';
import createAppTheme from './theme';
import { motion, AnimatePresence } from 'framer-motion';

// 1. Import Auth Context and Protected Route
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import Strategies from './components/Strategies';
import Calculator from './components/Calculator';
import Settings from './components/Settings';
import AdminDashboard from './components/AdminDashboard';
import Unauthorized from './components/Unauthorized';
import ChartPage from './components/ChartPage';
import HeatmapV2 from './components/HeatmapV2';
import AdsterraBanner from './components/AdsterraBanner';
import PageNotFound from './components/PageNotFound';
import GoogleCallback from './components/GoogleCallback';
import { userPreferenceAPI } from "../src/api/axios";
import ScrollToTop from './components/shared/ScrollToTop';
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.2 } }}
    transition={{
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] // Native-like cubic bezier
    }}
    style={{
      width: '100%',
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column'
    }}
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
  const { user, loading, login, configLoading, appConfig } = useAuth();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (user?.theme) {
      const userTheme = user.theme === 'DARK' ? 'dark' : 'light';
      if (theme !== userTheme) {
        setTheme(userTheme);
        localStorage.setItem('theme', userTheme);
      }
    }
  }, [user, theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (user) {
      userPreferenceAPI.updateTheme(newTheme.toUpperCase());
      login({ ...user, theme: newTheme.toUpperCase() });
    }
  };

  const muiTheme = useMemo(() => createAppTheme(theme), [theme]);
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  if (loading || configLoading) {
    return (
      <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }
  const { auth } = appConfig;
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router>
        <ScrollToTop />
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
          position: 'relative'
        }}>
          <Header toggleTheme={toggleTheme} theme={theme} />

          <Box sx={{
            flexGrow: 1,
            pb: isMobile ? '100px' : 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}>
            <AnimatedRoutes auth={auth} />
          </Box>

          {process.env.NODE_ENV === 'production' && !isMobile && (
            <Box sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              py: 2,
              bgcolor: 'background.default'
            }}>
              <AdsterraBanner isMobile={isMobile} />
            </Box>
          )}

          {!isMobile && <Footer />}
        </Box>
      </Router>
    </ThemeProvider>
  );
}

function AnimatedRoutes(props) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.key}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/google/callback" element={<PageWrapper><GoogleCallback /></PageWrapper>} />
        {props.auth.email &&
          (<Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />)}
        <Route path="/strategies" element={<PageWrapper><Strategies /></PageWrapper>} />
        <Route path="/calculator" element={<PageWrapper><Calculator /></PageWrapper>} />
        <Route path="/heatmap" element={<PageWrapper><HeatmapV2 /></PageWrapper>} />
        <Route path="/chart/:symbol" element={<PageWrapper><ChartPage /></PageWrapper>} />

        {/* --- User Protected Routes --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
        </Route>

        {/* --- Admin Only Routes --- */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
        </Route>

        {/* Unauthorized page for non-admins */}
        <Route path="/unauthorized" element={<PageWrapper><Unauthorized showLogin={true} /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><PageNotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
