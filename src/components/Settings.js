import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userPreferenceAPI } from '../api/axios';
import {
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import { Email, Person, Save, Settings as SettingsIcon } from '@mui/icons-material';
import StatusAlert from './shared/StatusAlert';

const Settings = () => {
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setUserId(user.userId);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const response = await userPreferenceAPI.updateUsername(userId, username);
      if (response.status === 200 && response.data.success) {
        login({ ...user, username });
        setSuccessMessage(response.data.message || 'Settings updated successfully');
      }
      else {
        setErrorMessage(response.data.error || 'Failed to update settings');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to update settings');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ flexGrow: 1, py: 5 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SettingsIcon sx={{ mr: 1 }} />
                  Account Settings
                </Box>
              }
              sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText' }}
            />
            <CardContent sx={{ p: 3 }}>
              <StatusAlert success={successMessage} error={errorMessage} sx={{ mb: 2, mt: 0 }} />

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="email"
                  label="Email Address"
                  value={email}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                  helperText="Email address cannot be changed"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  inputProps={{ minLength: 3, maxLength: 50 }}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                  helperText="Choose a username (3-50 characters)"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  startIcon={<Save />}
                >
                  Save Changes
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Settings;
