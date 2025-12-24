import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import { Lock } from '@mui/icons-material';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ flexGrow: 1, py: 5 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <Lock sx={{ fontSize: 64, color: 'error.main' }} />
        </Box>
        <Typography variant="h4" component="h1" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You do not have permission to access this page. Please contact an administrator if you believe this is an error.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/')}>
            Go to Home
          </Button>
          <Button variant="outlined" onClick={() => navigate('/login')}>
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Unauthorized;
