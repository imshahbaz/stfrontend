import React, { useState } from 'react';
import { authAPI } from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Email,
  Lock,
  Login as LoginIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import AuthWrapper from './shared/AuthWrapper';
import StatusAlert from './shared/StatusAlert';

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const response = await authAPI.login(email, password);
      if (response.status === 200) {
        login(response.data.data);
        navigate('/');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <AuthWrapper
      title="Welcome Back"
      subtitle="Sign in to continue your trading journey"
      isLogin={true}
    >
      <StatusAlert error={error} sx={{ mb: 3 }} />

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '16px',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color="action" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '16px',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ textAlign: 'right', mt: 1 }}>
          <Typography
            component={Link}
            to="/forgot-password"
            variant="caption"
            fontWeight="700"
            color="primary"
            sx={{ textDecoration: 'none' }}
          >
            Forgot Password?
          </Typography>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{
            mt: 4,
            mb: 3,
            py: 1.8,
            borderRadius: '16px',
            fontSize: '1rem',
            fontWeight: '800',
            textTransform: 'none',
            boxShadow: `0 8px 16px ${theme.palette.primary.main}40`,
            '&:hover': {
              boxShadow: `0 12px 24px ${theme.palette.primary.main}50`,
            }
          }}
          startIcon={<LoginIcon />}
        >
          Sign In
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary" fontWeight="500">
          New to Shahbaz Trades?{' '}
          <Link to="/signup" style={{
            color: theme.palette.primary.main,
            textDecoration: 'none',
            fontWeight: '800'
          }}>
            Create Account
          </Link>
        </Typography>
      </Box>
    </AuthWrapper>
  );
};

export default Login;
