import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Fade,
} from '@mui/material';
import { TrendingUp, Calculate } from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Fade in={true} timeout={1000}>
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 5 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h2" component="h1" color="primary" gutterBottom>
            Welcome to Shahbaz Trades Application
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Your premier destination for seamless trading experiences.
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6} lg={4}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate('/strategies')}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <TrendingUp sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h3" color="primary" gutterBottom>
                  Strategy
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Scan and analyze the market with our advanced strategy tools.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate('/calculator')}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Calculate sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h3" color="primary" gutterBottom>
                  Calculator
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Calculate returns and analyze trades with our advanced calculator.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
};

export default Home;
