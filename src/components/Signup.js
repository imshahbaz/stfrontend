import React, { useState, useEffect } from 'react';
import { userAPI } from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Email, Lock, VpnKey, PersonAdd, Check } from '@mui/icons-material';
import TruecallerLogin from './TruecallerLogin';

const Signup = () => {
  const navigate = useNavigate();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setMessage('');
    try {
      const response = await userAPI.signup(email, password, confirmPassword);
      setOtpSent(response.data.otpSent);
      setMessage(response.data.message || 'OTP sent to your email');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await userAPI.verifyOtp(email, otp);
      if (response.status === 201) {
        navigate('/login');
      }
      else {
        setError(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5, mb: 5, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ minWidth: 400, boxShadow: 3 }}>
        <CardContent sx={{ p: 5 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h2" color="primary" gutterBottom>
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join Shahbaz Trades today
            </Typography>
          </Box>
          <TruecallerLogin login={login} user={user} loading={loading} isLogin={false} />
          <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
            <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'divider' }} />
            <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', fontWeight: 'bold' }}>
              OR
            </Typography>
            <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'divider' }} />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          {!otpSent ? (
            <Box component="form" onSubmit={handleSendOtp} sx={{ mt: 1 }}>
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                startIcon={<PersonAdd />}
              >
                Send OTP
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleVerifyOtp} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="otp"
                label="Enter 6-digit OTP"
                name="otp"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputProps={{ maxLength: 6, pattern: '[0-9]{6}' }}
                InputProps={{
                  startAdornment: <VpnKey sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="success"
                sx={{ mt: 3, mb: 2 }}
                startIcon={<Check />}
              >
                Verify & Create Account
              </Button>
            </Box>
          )}

          {!otpSent && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'primary.main', textDecoration: 'none' }}>
                  Sign in
                </Link>
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Signup;
