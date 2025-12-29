import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  Paper
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Dashboard,
  Settings,
  Logout,
  Login,
  TrendingUp
} from '@mui/icons-material';
import AdsterraBanner from './AdsterraBanner';

const Header = ({ toggleTheme, theme }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Logic to determine active tab for Bottom Nav
  const currentTab = location.pathname;

  return (
    <>
      {/* TOP NAVBAR (Logo & Theme Toggle) */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: 'blur(10px)',
          backgroundColor: theme === 'dark' ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.95)',
          borderBottom: `1px solid ${muiTheme.palette.divider}`,
          color: muiTheme.palette.text.primary,
          zIndex: muiTheme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp color="primary" sx={{ fontSize: 28 }} />
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{ fontWeight: 800, textDecoration: 'none', color: 'inherit', fontSize: { xs: '1.1rem', md: '1.25rem' } }}
            >
              SHAHBAZ<span style={{ color: muiTheme.palette.primary.main }}>TRADES</span>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={toggleTheme} color="inherit" size="small">
              {theme === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {!isMobile && (
              user ? (
                <>
                  <Button component={Link} to="/settings" color="inherit" startIcon={<Settings />}>Settings</Button>
                  {user.role === 'ADMIN' && (
                    <Button component={Link} to="/admin/dashboard" color="inherit" startIcon={<Dashboard />}>Admin</Button>
                  )}
                  <Button onClick={handleLogout} color="error" startIcon={<Logout />}>Logout</Button>
                </>
              ) : (
                /* Hide Login button if we are already on the /login page on desktop */
                location.pathname !== '/login' && (
                  <Button variant="contained" component={Link} to="/login" startIcon={<Login />}>
                    Login
                  </Button>
                )
              )
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* MOBILE BOTTOM NAVIGATION */}
      {isMobile && (
        <>
          {process.env.NODE_ENV === 'production' &&
            <Box sx={{
              position: 'fixed',
              bottom: 56,
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              py: 2,
              bgcolor: 'background.default'
            }}>
              <AdsterraBanner isMobile={isMobile} />
            </Box>}
          <Paper
            sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, borderTop: `1px solid ${muiTheme.palette.divider}` }}
            elevation={3}
          >
            <BottomNavigation
              showLabels
              value={currentTab}
              onChange={(event, newValue) => navigate(newValue)}
            >
              <BottomNavigationAction
                label="Markets"
                value="/"
                icon={<TrendingUp />}
              />

              {user ? (
                [
                  user.role === 'ADMIN' && (
                    <BottomNavigationAction
                      key="admin"
                      label="Admin"
                      value="/admin/dashboard"
                      icon={<Dashboard />}
                    />
                  ),
                  <BottomNavigationAction
                    key="settings"
                    label="Settings"
                    value="/settings"
                    icon={<Settings />}
                  />,
                  <BottomNavigationAction
                    key="logout"
                    label="Logout"
                    onClick={handleLogout}
                    icon={<Logout color="error" />}
                  />
                ]
              ) : (
                <BottomNavigationAction
                  label="Login"
                  value="/login"
                  icon={<Login />}
                />
              )}
            </BottomNavigation>
          </Paper>
        </>
      )}
    </>
  );
};

export default Header;