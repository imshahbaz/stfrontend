import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

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
  return (
    <Router>
      {/* 2. Wrap everything in the AuthProvider */}
      <AuthProvider>
        <div className="App d-flex flex-column min-vh-100">
          <Header />
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* --- User Protected Routes --- */}
            {/* These require the user to be logged in (any role) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/strategies" element={<Strategies />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* --- Admin Only Routes --- */}
            {/* This requires the role in the DTO to be 'admin' */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            {/* Optional: Unauthorized page for non-admins */}
            <Route path="/unauthorized" element={<div>Access Denied</div>} />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;