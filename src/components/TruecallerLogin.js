import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { truecallerAPI } from '../api/axios';
import useTruecallerPolling from '../hooks/useTruecallerPolling';
import {
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { PhoneAndroid } from '@mui/icons-material';

const TruecallerLogin = ({ login, user, loading, isLoading: externalIsLoading = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const isLoading = externalIsLoading || internalIsLoading;
  const { startPolling, clearPolling } = useTruecallerPolling(
    (data) => {
      setInternalIsLoading(false);
      login(data);
      navigate('/', { replace: true });
    },
    (error) => {
      console.error('Truecaller polling error:', error);
      setInternalIsLoading(false);
    }
  );

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const generateNonce = () => crypto.randomUUID();

  const handleLogin = () => {
    const requestId = generateNonce();

    setInternalIsLoading(true);
    window.location.href = truecallerAPI.truecallerLogin(requestId);

    setTimeout(() => {
      if (document.hasFocus()) {
        setInternalIsLoading(false);
        clearPolling();
      } else {
        startPolling(requestId);
      }
    }, 1000);
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={
        isLoading ? (
          <CircularProgress size={20} />
        ) : (
          <PhoneAndroid />
        )
      }
      onClick={handleLogin}
      disabled={isLoading}
      sx={{
        py: 1.8,
        borderRadius: '16px',
        fontSize: '1rem',
        fontWeight: '700',
        textTransform: 'none',
        borderColor: theme.palette.divider,
        color: theme.palette.text.primary,
        '&:hover': {
          borderColor: theme.palette.primary.main,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        },
        '& .MuiButton-startIcon': {
          color: '#0087FF',
        },
        opacity: isLoading ? 0.7 : 1,
      }}
    >
      {isLoading ? 'Verifying...' : 'Continue with Truecaller'}
    </Button>
  );
};

export default TruecallerLogin;