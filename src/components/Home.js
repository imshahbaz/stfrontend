import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Grid, Fade } from '@mui/material';
import { TrendingUp, Calculate, Map as MapIcon } from '@mui/icons-material';
import ActionCard from './shared/ActionCard';

const Home = () => {
  const navigate = useNavigate();

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
      icon: MapIcon,
      path: '/heatmap'
    }
  ];

  return (
    <Fade in={true} timeout={1000}>
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" component="h1" color="primary" gutterBottom fontWeight="900" sx={{ fontSize: { xs: '2.5rem', md: '3.75rem' } }}>
            Shahbaz Trades
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto', fontWeight: 500 }}>
            Your premier destination for seamless trading experiences and advanced market analysis.
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
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
    </Fade>
  );
};

export default Home;
