import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState('dark');
  const navigate = useNavigate();

  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.body.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.classList.toggle('dark', newTheme === 'dark');

    // If logged in, save to backend
    if (user) {
      // Assuming an API call to save theme
      // fetch('/api/theme', { method: 'POST', body: JSON.stringify({ theme: newTheme.toUpperCase() }) });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header>
      <nav className={`navbar navbar-expand-lg ${theme === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-light'} shadow-2`}>
        <div className="container">
          <Link className="navbar-brand mt-2 mt-lg-0" to="/">
            <i className="fas fa-chart-line fa-lg text-primary me-2"></i>
            <span className="fw-bold text-primary">Shahbaz Trades</span>
          </Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
            data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
            aria-label="Toggle navigation">
            <i className="fas fa-bars"></i>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link" href="#" onClick={toggleTheme}>
                  <i className="fas fa-moon me-1"></i> Toggle Theme
                </a>
              </li>

              {user ? (
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown"
                    role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="fas fa-user me-1"></i> {user?.username}
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                    {user?.role === 'ADMIN' && (
                      <>
                        <li><Link className="dropdown-item" to="/admin/dashboard">
                          <i className="fas fa-tachometer-alt me-2"></i> Admin Dashboard
                        </Link></li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                    )}
                    <li><Link className="dropdown-item" to="/settings">
                      <i className="fas fa-cog me-2"></i> Settings
                    </Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><a className="dropdown-item" href="#" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i> Logout
                    </a></li>
                  </ul>
                </li>
              ) : (
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="fas fa-sign-in-alt me-1"></i> Login
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
