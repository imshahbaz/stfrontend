import { useGoogleLogin } from '@react-oauth/google';
import { Button, useTheme, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { googleAPI } from '../api/axios';
import StatusAlert from './shared/StatusAlert';

const BACKEND_CALLBACK_URL = process.env.REACT_APP_BACKEND_URL + "/api/auth/google/callback";

const GoogleLogin = () => {
  const { login ,refreshUserData} = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [error, setError] = useState('');
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const currentUrl = window.location.origin;
  const [localLoading, setLocalLoading] = useState(false);

  const onSuccess = useCallback(async (codeResponse) => {
    setLocalLoading(true);
    setError('');
    try {
      const response = await googleAPI.googleCallback(
        codeResponse.code,
        "standard"
      );
      const { user } = response.data.data;
      await login(user);
      await refreshUserData()
      navigate('/');
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLocalLoading(false)
    }
  }, [login, navigate,refreshUserData]);

  const triggerLogin = useGoogleLogin({
    flow: 'auth-code',
    ux_mode: isIOS ? 'redirect' : 'popup',
    redirect_uri: isIOS ? BACKEND_CALLBACK_URL : 'postmessage',
    state: isIOS ? `redirect|${currentUrl}` : 'standard',
    onSuccess,
    onError: (error) => {
      setError('Google login failed. Please try again.');
    },
  });

  const handleLoginClick = () => {
    setError('');
    triggerLogin();
  };

  return (
    <>
      <Button
        fullWidth
        variant="outlined"
        startIcon={localLoading ? <></> : <GoogleIcon />}
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
        disabled={localLoading}
      >
        {localLoading ? <CircularProgress size={20} /> : "Continue with Google"}
      </Button>
      <StatusAlert error={error} />
    </>
  );
};

export default GoogleLogin;
