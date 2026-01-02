import { useGoogleLogin } from '@react-oauth/google';
import { Button, useTheme } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { googleAPI } from '../api/axios';
import StatusAlert from './shared/StatusAlert';

const GoogleLogin = () => {
  const { login, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [error, setError] = useState('');

  const onSuccess = useCallback(async (codeResponse) => {
    setError('');
    try {
      const response = await googleAPI.googleCallback(
        codeResponse.code,
        codeResponse.state
      );

      const { user } = response.data.data;

      login(user);
      await refreshUserData();
      navigate('/');
    } catch (error) {
      setError('Login failed. Please try again.');
    }
  }, [login, refreshUserData, navigate]);

  const triggerLogin = useGoogleLogin({
    flow: 'auth-code',
    redirect_uri: 'postmessage',
    onSuccess,
    onError: (error) => {
      setError('Google login failed. Please try again.');
    },
  });

  const handleLoginClick = () => {
    setError('');
    const state = window.crypto.randomUUID();

    document.cookie = `oauth_state=${state}; path=/; SameSite=Lax; max-age=300`;

    triggerLogin({ state: state });
  };

  return (
    <>
      <Button
        fullWidth
        variant="outlined"
        startIcon={<GoogleIcon />}
        onClick={handleLoginClick}
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
            color: '#DB4437',
          }
        }}
      >
        Continue with Google
      </Button>
      <StatusAlert error={error} />
    </>
  );
};

export default GoogleLogin;
