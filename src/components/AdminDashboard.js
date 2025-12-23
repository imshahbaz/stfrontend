import { useState } from 'react';
import api from '../api/axios';
import {
  Container,
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CloudUpload, Dashboard } from '@mui/icons-material';

const AdminDashboard = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setShowResult(false);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await api.post(`${process.env.REACT_APP_BACKEND_URL}/api/margin/load-from-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        setSuccessMessage('CSV data loaded successfully!');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to load CSV data');
    } finally {
      setUploading(false);
      setShowResult(true);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ flexGrow: 1, py: 5 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" color="primary" gutterBottom>
          <Dashboard sx={{ mr: 1, verticalAlign: 'middle' }} />
          Admin Dashboard
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Margin Data Management */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CloudUpload sx={{ mr: 1 }} />
                  Margin Data Management
                </Box>
              }
              sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText' }}
            />
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload CSV files to load margin data into the system.
              </Typography>

              <Box component="form" onSubmit={handleSubmit} encType="multipart/form-data">
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <CloudUpload sx={{ mr: 1 }} />
                  Select CSV File
                  <input
                    type="file"
                    hidden
                    accept=".csv"
                    onChange={handleFileChange}
                    required
                  />
                </Button>
                {file && (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Selected: {file.name}
                  </Typography>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={uploading}
                  startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
                >
                  {uploading ? 'Uploading...' : 'Upload and Load Data'}
                </Button>
              </Box>

              {showResult && (
                <Box sx={{ mt: 3 }}>
                  {successMessage && (
                    <Alert severity="success">
                      {successMessage}
                    </Alert>
                  )}
                  {errorMessage && (
                    <Alert severity="error">
                      {errorMessage}
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
