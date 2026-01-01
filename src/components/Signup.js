import React, { useState } from 'react';
import { userAPI } from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography } from '@mui/material';
import { Email, Lock, VpnKey, PersonAdd, Check } from '@mui/icons-material';
import AuthWrapper from './shared/AuthWrapper';
import StatusAlert from './shared/StatusAlert';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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
      if (response.status === 200) {
        setOtpSent(response.data.data.otpSent);
        setMessage(response.data.message || 'OTP sent to your email');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setOtpSent(true);
        setMessage('OTP sent to ' + email);
      } else {
        setError(error.response?.data?.message || 'Failed to send OTP');
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await userAPI.verifyOtp(email, otp);
      if (response.status === 201 || response.status === 200) {
        navigate('/login');
      } else {
        setError(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <AuthWrapper
      title="Create Account"
      subtitle="Join Shahbaz Trades today"
      isLogin={false}
    >
      <StatusAlert success={message} error={error} sx={{ mb: 2, mt: 0 }} />

      {!otpSent ? (
        <Box component="form" onSubmit={handleSendOtp}>
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
        <Box component="form" onSubmit={handleVerifyOtp}>
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
            <Link to="/login" style={{ color: 'primary.main', textDecoration: 'none', fontWeight: 'bold' }}>
              Sign in
            </Link>
          </Typography>
        </Box>
      )}
    </AuthWrapper>
  );
};

export default Signup;
