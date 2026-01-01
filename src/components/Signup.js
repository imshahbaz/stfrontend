import React, { useState } from 'react';
import { userAPI } from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
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
  VpnKey,
  PersonAdd,
  Check,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import AuthWrapper from './shared/AuthWrapper';
import StatusAlert from './shared/StatusAlert';

const Signup = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

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

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '16px',
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
    }
  };

  return (
    <AuthWrapper
      title="Create Account"
      subtitle="Join the elite community of traders"
      isLogin={false}
    >
      <StatusAlert success={message} error={error} sx={{ mb: 3 }} />

      {!otpSent ? (
        <Box component="form" onSubmit={handleSendOtp} noValidate>
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
            sx={inputStyle}
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={inputStyle}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={inputStyle}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
            }}
          />
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
            }}
            startIcon={<PersonAdd />}
          >
            Send OTP
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleVerifyOtp} noValidate>
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
            inputProps={{ maxLength: 6, pattern: '[0-9]{6}', style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px' } }}
            sx={inputStyle}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <VpnKey color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="success"
            size="large"
            sx={{
              mt: 4,
              mb: 3,
              py: 1.8,
              borderRadius: '16px',
              fontSize: '1rem',
              fontWeight: '800',
              textTransform: 'none',
              boxShadow: theme.shadows[4]
            }}
            startIcon={<Check />}
          >
            Verify & Create Account
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => setOtpSent(false)}
            sx={{ fontWeight: '700' }}
          >
            Change Email / Try Again
          </Button>
        </Box>
      )}

      {!otpSent && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary" fontWeight="500">
            Already have an account?{' '}
            <Link to="/login" style={{
              color: theme.palette.primary.main,
              textDecoration: 'none',
              fontWeight: '800'
            }}>
              Sign in
            </Link>
          </Typography>
        </Box>
      )}
    </AuthWrapper>
  );
};

export default Signup;
