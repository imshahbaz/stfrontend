import React, { useState } from 'react';
import { authAPI } from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, TextField, Button, Typography } from '@mui/material';
import { Email, Lock, Login as LoginIcon } from '@mui/icons-material';
import AuthWrapper from './shared/AuthWrapper';
import StatusAlert from './shared/StatusAlert';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      subtitle="Sign in to your account"
      isLogin={true}
    >
      <StatusAlert error={error} sx={{ mb: 2, mt: 0 }} />

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />,
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          startIcon={<LoginIcon />}
        >
          Sign In
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2">
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'primary.main', textDecoration: 'none', fontWeight: 'bold' }}>
            Sign up
          </Link>
        </Typography>
      </Box>
    </AuthWrapper>
  );
};

export default Login;
