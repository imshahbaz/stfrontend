import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/axios';
import {
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  Collapse,
} from '@mui/material';
import { Email, Person, Save, Close, Settings as SettingsIcon } from '@mui/icons-material';

const Settings = () => {
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const response = await authAPI.updateUsername(email, username);
      setSuccessMessage('Settings updated successfully');
      // Update the context with the new username
      login({ ...user, username });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to update settings');
    }
  };

  return (
    <Container maxWidth="md" sx={{ flexGrow: 1, py: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ minWidth: 400, maxWidth: 600, boxShadow: 3 }}>
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
            <Collapse in={!!successMessage}>
              <Alert
                severity="success"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setSuccessMessage('')}
                  >
                    <Close fontSize="inherit" />
                  </IconButton>
                }
                sx={{ mb: 2 }}
              >
                {successMessage}
              </Alert>
            </Collapse>

            <Collapse in={!!errorMessage}>
              <Alert
                severity="error"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setErrorMessage('')}
                  >
                    <Close fontSize="inherit" />
                  </IconButton>
                }
                sx={{ mb: 2 }}
              >
                {errorMessage}
              </Alert>
            </Collapse>

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
      </Box>
    </Container>
  );
};

export default Settings;
