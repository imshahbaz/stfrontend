import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, CircularProgress, Button, Paper, useTheme, useMediaQuery } from '@mui/material';
import { Google as GoogleIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import useGooglePolling from '../hooks/useGooglePolling';
import StatusAlert from './shared/StatusAlert';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { login, user } = useAuth();
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
    if (user) {
      navigate('/', { replace: true });
      return;
    }
    if (code && state) {
      startPolling(code, state);
    } else {
      setError('Missing session data.');
    }
    return () => clearPolling();
  }, [code, state, startPolling, clearPolling, user, navigate]);

  return (
    <Box sx={{
      height: '100dvh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: theme.palette.background.default,
      overflow: 'hidden', // Prevents any accidental scrolling
      position: 'fixed', // Locks the background on mobile
      top: 0,
      left: 0
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ width: '100%', maxWidth: isMobile ? '100%' : 450, height: isMobile ? '100%' : 'auto' }}
      >
        <Paper sx={{
          p: 4,
          borderRadius: isMobile ? 0 : '24px',
          textAlign: 'center',
          height: isMobile ? '100%' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center', // Centers content vertically on mobile
          alignItems: 'center',
          border: isMobile ? 'none' : `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'white',
          boxShadow: isMobile ? 'none' : theme.shadows[2]
        }}>
          <GoogleIcon sx={{ fontSize: 56, color: '#DB4437', mb: 3 }} />

          <Box sx={{ mb: 4 }}>
            {isPolling && !error ? (
              <>
                <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
                <Typography variant="h6" fontWeight="700">
                  {status}
                </Typography>
              </>
            ) : (
              <Typography variant="h5" fontWeight="800" color={error ? "error" : "text.primary"}>
                {error ? "Verification Failed" : "Authorized"}
              </Typography>
            )}
          </Box>

          <Box sx={{ width: '100%', maxWidth: 320 }}>
            <StatusAlert error={error} sx={{ mb: 4 }} />
          </Box>

          {error && (
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/login')}
              sx={{
                borderRadius: '16px',
                fontWeight: 'bold',
                py: 1.5,
                px: 4,
                textTransform: 'none'
              }}
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