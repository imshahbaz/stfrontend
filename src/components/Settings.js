import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userPreferenceAPI, userAPI } from '../api/axios';
import {
  Container,
  TextField,
  Button,
  Typography,
  Divider,
  Stack
} from '@mui/material';
import {
  Email,
  Person,
  Save,
  VpnKey,
  Check,
  PersonAdd,
  Lock
} from '@mui/icons-material';
import StatusAlert from './shared/StatusAlert';
import AdminFormContainer from './shared/AdminFormContainer';

const Settings = () => {
  const { user, login, refreshUserData } = useAuth();

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

    // Alphanumeric validation (a-z, 0-9)
    const usernameRegex = /^[a-z0-9]+$/;
    if (!usernameRegex.test(username)) {
      setProfileError('Username can only contain lowercase letters (a-z) and numbers (0-9)');
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

    // Email format validation
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

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Stack spacing={4}>

        {/* Profile Settings Card */}
        <AdminFormContainer title="Profile Settings" onSubmit={handleUpdateUsername}>
          <StatusAlert success={profileSuccess} error={profileError} sx={{ mb: 2, mt: 0 }} />

          <TextField
            margin="normal"
            fullWidth
            label="Email Address"
            value={user?.email || 'Not Provided'}
            InputProps={{
              readOnly: true,
              startAdornment: <Email sx={{ mr: 1, color: 'action.disabled' }} />,
            }}
            size="small"
            disabled
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              startAdornment: <Person sx={{ mr: 1, color: 'primary.main' }} />,
            }}
            size="small"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            startIcon={<Save />}
            disabled={loading}
          >
            Update Profile
          </Button>
        </AdminFormContainer>

        {!isEmailPresent && (
          <AdminFormContainer
            title={otpSent ? "Verify OTP" : "Link Email Address"}
            onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
          >
            <StatusAlert success={securitySuccess} error={securityError} sx={{ mb: 2, mt: 0 }} />

            {!otpSent ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Secure your account by linking an email address.
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'primary.main' }} />,
                  }}
                  size="small"
                  autoComplete="email"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: <Lock sx={{ mr: 1, color: 'primary.main' }} />,
                  }}
                  size="small"
                  autoComplete="new-password"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    startAdornment: <Lock sx={{ mr: 1, color: 'primary.main' }} />,
                  }}
                  size="small"
                  autoComplete="new-password"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3 }}
                  startIcon={<PersonAdd />}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold' }}>
                  A verification code has been sent to {email}
                </Typography>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="6-Digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  inputProps={{ maxLength: 6 }}
                  InputProps={{
                    startAdornment: <VpnKey sx={{ mr: 1, color: 'primary.main' }} />,
                  }}
                  size="small"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3 }}
                  startIcon={<Check />}
                  disabled={loading}
                >
                  Verify & Secure
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  onClick={() => setOtpSent(false)}
                  sx={{ mt: 1 }}
                >
                  Back
                </Button>
              </>
            )}
          </AdminFormContainer>
        )}

      </Stack>
    </Container>
  );
};

export default Settings;
