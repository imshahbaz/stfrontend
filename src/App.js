import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography } from '@mui/material';
import createAppTheme from './theme';

// 1. Import Auth Context and Protected Route
import { AuthProvider } from './context/AuthContext';
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

function App() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const muiTheme = createAppTheme(theme);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router>
        {/* 2. Wrap everything in the AuthProvider */}
        <AuthProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header toggleTheme={toggleTheme} theme={theme} />
            <Box sx={{ flexGrow: 1 }}>
              <Routes>
                {/* --- Public Routes --- */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/strategies" element={<Strategies />} />
                <Route path="/calculator" element={<Calculator />} />

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

                {/* Optional: Unauthorized page for non-admins */}
                <Route path="/unauthorized" element={<Typography variant="h4" align="center">Access Denied</Typography>} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;