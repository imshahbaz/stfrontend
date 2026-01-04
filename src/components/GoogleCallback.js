import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, CircularProgress, Button, Paper, useTheme } from '@mui/material';
import { Google as GoogleIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import useGooglePolling from '../hooks/useGooglePolling';
import StatusAlert from './shared/StatusAlert';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const theme = useTheme(); // Restored
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const onSuccess = useCallback(async (user) => {
    await login(user);
    navigate('/', { replace: true });
  }, [login, navigate]);

  const onError = useCallback((msg) => {
    setError(msg);
  }, []);

  const { status, isPolling, startPolling, clearPolling } = useGooglePolling(onSuccess, onError);

  useEffect(() => {
    if (code && state) {
      startPolling(code, state);
    } else {
      setError('Missing session data.');
    }
    return () => clearPolling();
  }, [code, state, startPolling, clearPolling]);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      bgcolor: theme.palette.background.default, // Using theme here fixes the lint error
      p: 2 
    }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Paper sx={{ 
          p: 4, 
          borderRadius: '24px', 
          textAlign: 'center', 
          maxWidth: 400,
          border: `1px solid ${theme.palette.divider}`, // Using theme here fixes the lint error
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'white'
        }}>
          <GoogleIcon sx={{ fontSize: 48, color: '#DB4437', mb: 2 }} />
          
          <Box sx={{ mb: 3 }}>
            {isPolling && !error ? (
              <>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="body1" fontWeight="600">{status}</Typography>
              </>
            ) : (
              <Typography variant="h6" color={error ? "error" : "text.primary"}>
                {error ? "Verification Failed" : "Redirecting..."}
              </Typography>
            )}
          </Box>

          <StatusAlert error={error} sx={{ mb: 3 }} />

          {error && (
            <Button 
              variant="outlined" 
              startIcon={<ArrowBackIcon />} 
              onClick={() => navigate('/login')}
              sx={{ borderRadius: '12px', fontWeight: 'bold' }}
            >
              Back to Login
            </Button>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

export default GoogleCallback;