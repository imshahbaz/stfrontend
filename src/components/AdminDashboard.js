import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  DashboardRounded,
  SettingsRounded,
  ListAltRounded,
  StorageRounded,
  TrendingUpRounded,
  AutoGraphRounded
} from '@mui/icons-material';

import StrategiesTab from './admin/StrategiesTab';
import MarginDataTab from './admin/MarginDataTab';
import SystemConfigTab from './admin/SystemConfigTab';
import OrderBlockTab from './admin/OrderBlockTab';
import FvgTab from './admin/FvgTab';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const tabs = [
    { label: 'Strategies', icon: <ListAltRounded />, component: <StrategiesTab /> },
    { label: 'Margin Data', icon: <StorageRounded />, component: <MarginDataTab /> },
    { label: 'System Config', icon: <SettingsRounded />, component: <SystemConfigTab /> },
    { label: 'OB (Order Block)', icon: <TrendingUpRounded />, component: <OrderBlockTab /> },
    { label: 'FVG (Fair Value Gap)', icon: <AutoGraphRounded />, component: <FvgTab /> },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        pt: { xs: 2, md: 6 },
        pb: 12
      }}>
        <Container
          maxWidth="lg"
          disableGutters={isMobile}
          sx={{ px: { xs: 0, sm: 2, md: 3 } }}
        >
          {/* HEADER */}
          <Box sx={{ px: { xs: 2, sm: 0 }, mb: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{
                p: 1.5,
                borderRadius: '16px',
                bgcolor: 'primary.main',
                color: 'white',
                boxShadow: `0 8px 16px ${theme.palette.primary.main}40`,
                display: 'flex'
              }}>
                <DashboardRounded fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: '-1px' }}>
                  Admin Center
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="500">
                  Manage market data and configurations
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* TABS NAVIGATION */}
          <Box sx={{
            position: 'sticky',
            top: { xs: 0, md: 20 },
            zIndex: 10,
            bgcolor: 'background.default',
            px: { xs: 2, sm: 0 },
            mb: 3
          }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: '20px',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'white',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTabs-indicator': {
                    height: 4,
                    borderRadius: '4px 4px 0 0'
                  },
                  '& .MuiTab-root': {
                    minHeight: 64,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      color: 'primary.main',
                    }
                  }
                }}
              >
                {tabs.map((tab, idx) => (
                  <Tab
                    key={idx}
                    icon={tab.icon}
                    label={tab.label}
                    iconPosition="start"
                  />
                ))}
              </Tabs>
            </Paper>
          </Box>

          {/* TAB CONTENT */}
          <Box sx={{ px: { xs: 0, sm: 0 } }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                {tabs[activeTab].component}
              </motion.div>
            </AnimatePresence>
          </Box>

        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default AdminDashboard;