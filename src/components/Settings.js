import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userPreferenceAPI, userAPI } from '../api/axios';
import {
  Container,
  TextField,
  Button,
  Typography,
  Stack,
  Box,
  useTheme,
  Paper,
  InputAdornment,
  Avatar,
  IconButton
} from '@mui/material';
import {
  EmailRounded,
  PersonRounded,
  SaveRounded,
  VpnKeyRounded,
  CheckRounded,
  PersonAddRounded,
  LockRounded,
  BadgeRounded,
  SecurityRounded,
  FingerprintRounded
} from '@mui/icons-material';
import StatusAlert from './shared/StatusAlert';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user, login, refreshUserData } = useAuth();
  const theme = useTheme();

  // Profile Form States
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');

  // Security Form States (Linking)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Message States
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setUserId(user.userId || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const isEmailPresent = user?.email && user.email !== '';

  const handleUpdateUsername = async (e) => {
    if (e) e.preventDefault();

    const usernameRegex = /^[a-z0-9]+$/;
    if (!usernameRegex.test(username)) {
      setProfileError('Username can only contain lowercase letters and numbers');
      return;
    }

    setProfileSuccess('');
    setProfileError('');
    setLoading(true);
    try {
      const response = await userPreferenceAPI.updateUsername(userId, username);
      if (response.status === 200 && response.data.success) {
        login({ ...user, username });
        setProfileSuccess('Username updated successfully');
      } else {
        setProfileError(response.data.error || 'Failed to update settings');
      }
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSecurityError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setSecurityError('Passwords do not match');
      return;
    }
    setSecurityError('');
    setSecuritySuccess('');
    setLoading(true);
    try {
      const response = await userAPI.linkEmail(userId, email, password, confirmPassword);
      if (response.status === 200) {
        setOtpSent(response.data.data.otpSent);
        setSecuritySuccess('Verification OTP sent successfully');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setOtpSent(true);
        setSecuritySuccess('OTP sent to ' + email);
      } else {
        setSecurityError(error.response?.data?.message || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');
    setLoading(true);
    try {
      const response = await userAPI.verifyUpdateOtp(email, otp);
      if (response.status === 201 || response.status === 200) {
        setSecuritySuccess('Email linked successfully');
        setOtpSent(false);
        setPassword('');
        setConfirmPassword('');
        setOtp('');
        await refreshUserData();
      } else {
        setSecurityError(response.data.message || 'Verification failed');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setOtpSent(true);
        setSecuritySuccess('OTP already sent to ' + email);
        return
      }
      setSecurityError(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '16px',
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'background.default',
      pt: { xs: 4, md: 8 },
      pb: 12
    }}>
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* PROFILE HEADER */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 6, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  boxShadow: `0 12px 24px ${theme.palette.primary.main}40`,
                  border: `4px solid ${theme.palette.background.paper}`
                }}
              >
                {username?.charAt(0).toUpperCase() || <PersonRounded />}
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'secondary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'secondary.dark' },
                  boxShadow: theme.shadows[4],
                  border: `2px solid ${theme.palette.background.paper}`
                }}
                size="small"
              >
                <FingerprintRounded fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: '-1px' }}>
              Account Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              Manage your profile and security credentials
            </Typography>
          </Box>

          <Stack spacing={4}>
            {/* PERSONAL INFO SECTION */}
            <Paper elevation={0} sx={{
              p: 3,
              borderRadius: '24px',
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'white'
            }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <BadgeRounded color="primary" />
                <Typography variant="h6" fontWeight="800">Personal Info</Typography>
              </Stack>

              <Box component="form" onSubmit={handleUpdateUsername}>
                <StatusAlert success={profileSuccess} error={profileError} sx={{ mb: 3 }} />

                <TextField
                  fullWidth
                  label="Email Address"
                  value={user?.email || 'Not Provided'}
                  disabled
                  sx={{ ...fieldStyle, mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailRounded color="disabled" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  required
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={fieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonRounded color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    borderRadius: '16px',
                    fontWeight: 800,
                    textTransform: 'none',
                    boxShadow: `0 8px 16px ${theme.palette.primary.main}30`
                  }}
                  startIcon={<SaveRounded />}
                >
                  Save Changes
                </Button>
              </Box>
            </Paper>

            {/* SECURITY SECTION */}
            {!isEmailPresent && (
              <Paper elevation={0} sx={{
                p: 3,
                borderRadius: '24px',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'white'
              }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <SecurityRounded color="primary" />
                  <Typography variant="h6" fontWeight="800">
                    {otpSent ? "Verify Security" : "Security Linking"}
                  </Typography>
                </Stack>

                <StatusAlert success={securitySuccess} error={securityError} sx={{ mb: 3 }} />

                <Box component="form" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
                  {!otpSent ? (
                    <Stack spacing={2.5}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Secure your account access by linking a verified email.
                      </Typography>
                      <TextField
                        fullWidth
                        required
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={fieldStyle}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailRounded color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        required
                        label="New Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={fieldStyle}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockRounded color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        required
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        sx={fieldStyle}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockRounded color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        sx={{
                          py: 1.5,
                          borderRadius: '16px',
                          fontWeight: 800,
                          textTransform: 'none'
                        }}
                        startIcon={<PersonAddRounded />}
                      >
                        {loading ? 'Sending...' : 'Initialize Verification'}
                      </Button>
                    </Stack>
                  ) : (
                    <Stack spacing={3}>
                      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: '12px', mb: 1 }}>
                        <Typography variant="body2" fontWeight="600">
                          A 6-digit verification code has been sent to <strong>{email}</strong>
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        required
                        label="Verification Code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' } }}
                        sx={fieldStyle}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <VpnKeyRounded color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        sx={{
                          py: 1.5,
                          borderRadius: '16px',
                          fontWeight: 800,
                          textTransform: 'none'
                        }}
                        startIcon={<CheckRounded />}
                      >
                        Complete Linking
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => setOtpSent(false)}
                        sx={{ fontWeight: '700' }}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  )}
                </Box>
              </Paper>
            )}
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Settings;
