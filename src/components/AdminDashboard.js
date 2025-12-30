import React, { useState } from 'react';
import {
  Container, Box, Typography, Paper, Tabs, Tab, Divider, useMediaQuery
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  Dashboard, Settings, ListAlt, Storage, TrendingUp
} from '@mui/icons-material';

import StrategiesTab from './admin/StrategiesTab';
import MarginDataTab from './admin/MarginDataTab';
import SystemConfigTab from './admin/SystemConfigTab';
import OrderBlockTab from './admin/OrderBlockTab';
import FvgTab from './admin/FvgTab';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const isMobile = useMediaQuery('(max-width:900px)');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* HEADER */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="800" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Dashboard fontSize="large" /> Admin Center
            </Typography>
            <Typography variant="body2" color="text.secondary">Manage NSE data, strategies, and system configurations.</Typography>
          </Box>
        </Box>

        {/* TABS */}
        <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons="auto"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab icon={<ListAlt />} label="Strategies" iconPosition="start" />
            <Tab icon={<Storage />} label="Margin Data" iconPosition="start" />
            <Tab icon={<Settings />} label="System Config" iconPosition="start" />
            <Tab icon={<TrendingUp />} label="OB Management" iconPosition="start" />
            <Tab icon={<TrendingUp />} label="Fvg Management" iconPosition="start" />
          </Tabs>
          <Divider />

          <Box sx={{ p: isMobile ? 2 : 4 }}>
            {activeTab === 0 && <StrategiesTab />}
            {activeTab === 1 && <MarginDataTab />}
            {activeTab === 2 && <SystemConfigTab />}
            {activeTab === 3 && <OrderBlockTab />}
            {activeTab === 4 && <FvgTab />}
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default AdminDashboard;