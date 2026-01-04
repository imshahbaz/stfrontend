import { useState, useEffect } from 'react';
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
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Dashboard,
  Settings,
  Logout,
  Login,
  TrendingUp,
  Calculate,
  GridView,
  ArrowForwardIos
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ toggleTheme, theme }) => {
  const urlSet = new Set(["/login", "/google/callback"]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileImageLoaded, setProfileImageLoaded] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  // Async load profile image
  useEffect(() => {
    if (user?.profile) {
      const img = new Image();
      img.onload = () => setProfileImageLoaded(true);
      img.onerror = () => setProfileImageError(true);
      img.src = user.profile;
    } else {
      setProfileImageLoaded(false);
      setProfileImageError(false);
    }
  }, [user?.profile]);

  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
    navigate('/');
  };

  const currentTab = location.pathname;

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = [
    { label: 'Settings', icon: <Settings />, path: '/settings', show: !!user },
    { label: 'Admin Dashboard', icon: <Dashboard />, path: '/admin/dashboard', show: user?.role === 'ADMIN' },
  ];

  const drawerContent = (
    <Box
      sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 4, pt: 6, textAlign: 'center' }}>
        <Avatar
          src={profileImageLoaded && !profileImageError ? user?.profile : undefined}
          sx={{
            width: 80,
            height: 80,
            margin: '0 auto',
            mb: 2,
            bgcolor: 'primary.main',
            fontSize: '2rem'
          }}
        >
          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </Avatar>
        <Typography variant="h6" fontWeight="800">
          {user ? (user.name || user.email.split('@')[0]) : 'Guest'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user ? user.role : 'Welcome to Shahbaz Trades'}
        </Typography>
      </Box>
      <Divider sx={{ mx: 2 }} />
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.filter(item => item.show).map((item) => (
          <ListItem
            button
            key={item.label}
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontWeight: 600 }}
            />
            <ArrowForwardIos sx={{ fontSize: 14, color: 'text.disabled' }} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        {user ? (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{ borderRadius: 3, py: 1.5 }}
          >
            Logout
          </Button>
        ) : (
          !urlSet.has(location.pathname) && (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<Login />}
              onClick={() => navigate('/login')}
              sx={{ borderRadius: 3, py: 1.5 }}
            >
              Login
            </Button>
          )
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: 'blur(20px)',
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)',
          borderBottom: `1px solid ${muiTheme.palette.divider}`,
          color: muiTheme.palette.text.primary,
          zIndex: muiTheme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
          >
            <Box
              sx={{
                width: 35,
                height: 35,
                borderRadius: '10px',
                background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.primary.dark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${muiTheme.palette.primary.main}40`
              }}
            >
              <TrendingUp sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                fontWeight: 900,
                textDecoration: 'none',
                color: 'inherit',
                letterSpacing: '-0.5px',
                fontSize: { xs: '1.2rem', md: '1.4rem' }
              }}
            >
              SHAHBAZ<span style={{ color: muiTheme.palette.primary.main }}>TRADES</span>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 } }}>
            <Box
              onClick={toggleTheme}
              sx={{
                width: 52,
                height: 28,
                borderRadius: '20px',
                bgcolor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                cursor: 'pointer',
                position: 'relative',
                border: `1px solid ${muiTheme.palette.divider}`,
                transition: 'background-color 0.3s ease'
              }}
            >
              <motion.div
                initial={false}
                animate={{ x: theme === 'dark' ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: theme === 'dark' ? muiTheme.palette.primary.main : '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === 'dark' ?
                      <Brightness7 sx={{ fontSize: 13, color: '#fff' }} /> :
                      <Brightness4 sx={{ fontSize: 13, color: 'primary.main' }} />
                    }
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </Box>

            {isMobile && (
              <Avatar
                onClick={() => setDrawerOpen(true)}
                src={profileImageLoaded && !profileImageError ? user?.profile : undefined}
                sx={{
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  bgcolor: 'primary.main',
                  fontSize: '1rem'
                }}
              >
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </Avatar>
            )}

            {!isMobile && (
              user ? (
                <>
                  <Button component={Link} to="/settings" color="inherit" sx={{ fontWeight: 600 }}>Settings</Button>
                  {user.role === 'ADMIN' && (
                    <Button component={Link} to="/admin/dashboard" variant="soft" color="primary" sx={{ fontWeight: 600 }}>Admin</Button>
                  )}
                  <Button
                    onClick={handleLogout}
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ borderRadius: '20px', px: 3 }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                !urlSet.has(location.pathname) && (
                  <Button
                    variant="contained"
                    component={Link}
                    to="/login"
                    sx={{ borderRadius: '20px', px: 4, fontWeight: 700 }}
                  >
                    Login
                  </Button>
                )
              )
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 24,
            borderBottomLeftRadius: 24,
            boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
            zIndex: muiTheme.zIndex.drawer + 2
          }
        }}
        sx={{
          zIndex: muiTheme.zIndex.drawer + 2
        }}
      >
        {drawerContent}
      </Drawer>

      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 8,
            right: 8,
            zIndex: 1000,
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: `1px solid ${muiTheme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            backdropFilter: 'blur(10px)',
            backgroundColor: muiTheme.palette.mode === 'dark' ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          }}
          elevation={0}
        >
            <BottomNavigation
            showLabels
            value={currentTab}
            onChange={(event, newValue) => {
              navigate(newValue);
            }}
            sx={{
              height: 65,
              backgroundColor: 'transparent',
              '& .MuiBottomNavigationAction-root': {
                color: 'text.secondary',
                minWidth: 0,
                padding: '6px 2px',
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  marginTop: '2px',
                  '&.Mui-selected': {
                    fontSize: '0.7rem',
                    fontWeight: 800,
                  }
                },
                '&.Mui-selected': {
                  color: 'primary.main',
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.1)',
                    transition: 'transform 0.2s ease-in-out'
                  }
                }
              }
            }}
          >
            <BottomNavigationAction label="Home" value="/" icon={<TrendingUp />} />
            <BottomNavigationAction label="Screener" value="/strategies" icon={<GridView />} />
            <BottomNavigationAction label="Calc" value="/calculator" icon={<Calculate />} />
            <BottomNavigationAction label="Heatmap" value="/heatmap" icon={<GridView />} />
          </BottomNavigation>
        </Paper>
      )}
    </>
  );
};

export default Header;
