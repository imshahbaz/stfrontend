import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Backdrop, CircularProgress, useMediaQuery } from '@mui/material';
import createAppTheme from './theme';

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

function App() {
  return (<AuthProvider>
    <AppContent />
  </AuthProvider>)
}

function AppContent() {
  const { user, loading, login } = useAuth();
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (user?.theme) {
      const userTheme = user.theme === 'DARK' ? 'dark' : 'light'
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
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header toggleTheme={toggleTheme} theme={theme} />
          <Box sx={{ flexGrow: 1, pb: { xs: '4.5rem', md: 0 }, }}>
            <Routes>
              {/* --- Public Routes --- */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/strategies" element={<Strategies />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/heatmap" element={<HeatmapV2 />} />
              <Route path="/chart/:symbol" element={<ChartPage />} />

              {/* --- User Protected Routes --- */}
              {/* These require the user to be logged in (any role) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* --- Admin Only Routes --- */}
              {/* This requires the role in the DTO to be 'admin' */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>

              {/* Unauthorized page for non-admins */}
              <Route path="/unauthorized" element={<Unauthorized showLogin={!user} />} />
            </Routes>
          </Box>

          {/* ADSTERRA BANNER PLACEMENT */}
          {process.env.NODE_ENV === 'production' && !isMobile &&
            <Box sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              py: 2,
              bgcolor: 'background.default'
            }}>
              <AdsterraBanner isMobile={isMobile} />
            </Box>}

          {!isMobile && <Footer />}
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;