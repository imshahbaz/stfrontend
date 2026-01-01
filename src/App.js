import { useState, useEffect } from 'react';
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
import { userPreferenceAPI } from "../src/api/axios";

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    style={{ width: '100%', height: '100%' }}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading, login } = useAuth();
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (user?.theme) {
      const userTheme = user.theme === 'DARK' ? 'dark' : 'light';
      setTheme(userTheme);
      localStorage.setItem('theme', userTheme);
    } else if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (user) {
      userPreferenceAPI.updateTheme(newTheme.toUpperCase());
      login({ ...user, theme: newTheme.toUpperCase() });
    }
  };

  const muiTheme = createAppTheme(theme);
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  if (loading) {
    return (
      <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router>
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
            pb: isMobile ? '100px' : 0, // Padding for floating bottom nav
            display: 'flex',
            flexDirection: 'column'
          }}>
            <AnimatedRoutes />
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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* --- Public Routes --- */}
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
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
      </Routes>
    </AnimatePresence>
  );
}

export default App;
