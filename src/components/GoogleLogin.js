import { useGoogleLogin } from '@react-oauth/google';
import { Button, useTheme } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { googleAPI } from '../api/axios';

const GoogleLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const onSuccess = useCallback(async (codeResponse) => {
    try {
      const response = await googleAPI.googleCallback(
        codeResponse.code,
        codeResponse.state
      );

      const { user } = response.data.data;

      login(user);
      navigate('/');
    } catch (error) {
      console.error("Login failed:", error);
    }
  }, [login, navigate]);

  const triggerLogin = useGoogleLogin({
    flow: 'auth-code',
    //redirect_uri: 'http://localhost:8080/api/auth/google/callback',
    redirect_uri: 'postmessage',
    onSuccess,
    onError: (error) => console.log('Google Login Failed:', error),
  });

  const handleLoginClick = () => {
    const state = window.crypto.randomUUID();

    document.cookie = `oauth_state=${state}; path=/; SameSite=Lax; max-age=300`;

    triggerLogin({ state: state });
  };

  return (
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
  );
};

export default GoogleLogin;
