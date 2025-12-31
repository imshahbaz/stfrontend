import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { truecallerAPI } from '../api/axios';
import useTruecallerPolling from '../hooks/useTruecallerPolling';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import { PhoneAndroid } from '@mui/icons-material';

const TruecallerLogin = ({ login, user, loading, isLoading: externalIsLoading = false }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const isLoading = externalIsLoading || internalIsLoading;
  const { status: pollingStatus, startPolling, clearPolling } = useTruecallerPolling(
    (data) => {
      setStatus('Login Successful!');
      setInternalIsLoading(false);
      login(data.data);
    },
    (error) => {
      console.error('Truecaller polling error:', error);
      setStatus('Verification failed. Please try again.');
      setInternalIsLoading(false);
    }
  );

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    setStatus(pollingStatus);
  }, [pollingStatus]);

  const generateNonce = () => crypto.randomUUID();

  const handleLogin = () => {
    const requestId = generateNonce();

    setStatus('Opening Truecaller...');
    setInternalIsLoading(true);
    window.location.href = truecallerAPI.truecallerLogin(requestId);

    setTimeout(() => {
      if (document.hasFocus()) {
        setStatus('Truecaller app not found. Please try another method.');
        setInternalIsLoading(false);
        clearPolling();
      } else {
        startPolling(requestId);
      }
    }, 1000);
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 2 }}>
      <Button
        fullWidth
        onClick={handleLogin}
        disabled={isLoading}
        startIcon={
          isLoading ? (
            <CircularProgress size={20} sx={{ color: 'white' }} />
          ) : (
            <PhoneAndroid sx={{ color: 'white' }} />
          )
        }
        sx={{
          backgroundColor: '#0087FF',
          color: 'white',
          fontWeight: 'medium',
          fontFamily: 'Roboto, Inter, sans-serif',
          boxShadow: 2,
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: '#0073DB',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          opacity: isLoading ? 0.7 : 1,
          mb: 1,
        }}
      >
        {isLoading ? 'Verifying...' : '1-Tap Login with Truecaller'}
      </Button>
      {status && !isLoading && (
        <Typography variant="body2" color="text.secondary">
          {status}
        </Typography>
      )}
    </Box>
  );
};

export default TruecallerLogin;