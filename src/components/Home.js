import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Grid, useTheme, useMediaQuery } from '@mui/material';
import { TrendingUp, Calculate, GridView } from '@mui/icons-material';
import ActionCard from './shared/ActionCard';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const actions = [
    {
      title: 'Screener',
      description: 'Scan and analyze the market with our advanced strategy tools.',
      icon: TrendingUp,
      path: '/strategies'
    },
    {
      title: 'Calculator',
      description: 'Calculate returns and analyze trades with our advanced calculator.',
      icon: Calculate,
      path: '/calculator'
    },
    {
      title: 'Market Heat Map',
      description: 'Visualize real-time performance of Nifty indices.',
      icon: GridView,
      path: '/heatmap'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 8 }, pb: 12 }}>
      {/* Header Section */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 6
        }}
      >
        <Box>
          <Typography
            variant={isMobile ? "h4" : "h2"}
            fontWeight="900"
            sx={{
              letterSpacing: '-1px',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            {user ? `Hey, ${user.name || user.email.split('@')[0]}! 👋` : 'Welcome! 👋'}
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight="500">
            Let's see what the markets are doing today.
          </Typography>
        </Box>

      </Box>



      {/* Action Cards Grid */}
      <Grid
        container
        spacing={3}
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {actions.map((action, idx) => (
          <ActionCard
            key={idx}
            title={action.title}
            description={action.description}
            icon={action.icon}
            onClick={() => navigate(action.path)}
          />
        ))}
      </Grid>
    </Container>
  );
};

export default Home;

