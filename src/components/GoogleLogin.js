import { useGoogleLogin } from '@react-oauth/google';
import { Button, useTheme, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useState } from 'react';
import StatusAlert from './shared/StatusAlert';

const BACKEND_CALLBACK_URL = process.env.REACT_APP_BACKEND_URL + "/api/auth/google/callback";

const GoogleLogin = () => {
  const theme = useTheme();
  const [error, setError] = useState('');
  const currentUrl = window.location.origin;
  const [localLoading, setLocalLoading] = useState(false);

  const triggerLogin = useGoogleLogin({
    flow: 'auth-code',
    ux_mode: 'redirect',
    redirect_uri: BACKEND_CALLBACK_URL,
    state: `redirect|${currentUrl}`,
  });

  const handleLoginClick = () => {
    setError('');
    setLocalLoading(true);
    triggerLogin();
    setTimeout(() => setLocalLoading(false), 1000);
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
