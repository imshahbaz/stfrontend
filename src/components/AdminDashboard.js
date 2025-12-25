import React, { useState, useEffect } from 'react';
import { strategyAPI, marginAPI } from '../api/axios';
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
  TextField,
  FormControlLabel,
  Checkbox,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Paper,
  Collapse,
  useMediaQuery,
  Chip
} from '@mui/material';
import { CloudUpload, Dashboard, Add, Edit, Delete, ExpandMore, ExpandLess } from '@mui/icons-material';

const AdminDashboard = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showResult, setShowResult] = useState(false);

  // Strategy management state
  const [strategies, setStrategies] = useState([]);
  const [strategyForm, setStrategyForm] = useState({ name: '', scanClause: '', active: false });
  const [editingId, setEditingId] = useState(null);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [strategySuccess, setStrategySuccess] = useState('');
  const [strategyError, setStrategyError] = useState('');
  const [tableExpanded, setTableExpanded] = useState(false);

  const isMobile = useMediaQuery('(max-width:600px)');

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
      const response = await marginAPI.loadFromCsv(formData);
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

  const fetchStrategies = async () => {
    try {
      const response = await strategyAPI.getStrategiesAdmin();
      setStrategies(response.data);
    } catch (error) {
      console.error('Error fetching strategies:', error);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  const handleStrategyFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStrategyForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleStrategySubmit = async (e) => {
    e.preventDefault();
    if (!strategyForm.name || !strategyForm.scanClause) {
      setStrategyError('Name and Scan Clause are required.');
      return;
    }

    setStrategyLoading(true);
    setStrategySuccess('');
    setStrategyError('');

    try {
      if (editingId) {
        await strategyAPI.updateStrategy(strategyForm);
        setStrategySuccess('Strategy updated successfully!');
      } else {
        await strategyAPI.createStrategy(strategyForm);
        setStrategySuccess('Strategy created successfully!');
      }
      const response = await strategyAPI.getStrategiesAdmin();
      setStrategies(response.data);
      setStrategyForm({ name: '', scanClause: '', active: false });
      setEditingId(null);
    } catch (error) {
      setStrategyError(error.response?.data?.message || 'Failed to save strategy');
    } finally {
      setStrategyLoading(false);
    }
  };

  const handleEdit = (strategy) => {
    setStrategyForm({ name: strategy.name, scanClause: strategy.scanClause, active: strategy.active });
    setEditingId(strategy.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this strategy?')) return;

    try {
      await strategyAPI.deleteStrategy(id);
      setStrategies(prev => prev.filter(s => s.name !== id));
      setStrategySuccess('Strategy deleted successfully!');
    } catch (error) {
      setStrategyError(error.response?.data?.message || 'Failed to delete strategy');
    }
  };

  const handleCancel = () => {
    setStrategyForm({ name: '', scanClause: '', active: false });
    setEditingId(null);
  };

  return (
    <Container maxWidth="lg" sx={{ flexGrow: 1, py: 5 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
          <Dashboard sx={{ mr: 1, verticalAlign: 'middle' }} />
          Admin Dashboard
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3 }}>
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
                  <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                    Selected: {file.name}
                  </Typography>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={uploading}
                  startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
                >
                  {uploading ? 'Uploading...' : 'Upload and Load Data'}
                </Button>
              </Box>

              {showResult && (
                <Box sx={{ mt: 3 }}>
                  {successMessage && <Alert severity="success">{successMessage}</Alert>}
                  {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Add sx={{ mr: 1 }} />
                  {editingId ? 'Edit Strategy' : 'New Strategy'}
                </Box>
              }
              sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText' }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box component="form" onSubmit={handleStrategySubmit} sx={{ mb: 3 }}>
                <TextField
                  label="Name"
                  name="name"
                  value={strategyForm.name}
                  onChange={handleStrategyFormChange}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Scan Clause"
                  name="scanClause"
                  value={strategyForm.scanClause}
                  onChange={handleStrategyFormChange}
                  fullWidth
                  required
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={strategyForm.active}
                      onChange={handleStrategyFormChange}
                      name="active"
                    />
                  }
                  label="Active"
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth={isMobile}
                    disabled={strategyLoading}
                    startIcon={strategyLoading ? <CircularProgress size={20} color="inherit" /> : editingId ? <Edit /> : <Add />}
                  >
                    {strategyLoading ? 'Saving...' : editingId ? 'Update' : 'Add Strategy'}
                  </Button>
                  {editingId && (
                    <Button variant="outlined" fullWidth={isMobile} onClick={handleCancel}>
                      Cancel
                    </Button>
                  )}
                </Box>
              </Box>

              {(strategySuccess || strategyError) && (
                <Box sx={{ mb: 3 }}>
                  {strategySuccess && <Alert severity="success">{strategySuccess}</Alert>}
                  {strategyError && <Alert severity="error">{strategyError}</Alert>}
                </Box>
              )}

              <Button
                onClick={() => setTableExpanded(!tableExpanded)}
                startIcon={tableExpanded ? <ExpandLess /> : <ExpandMore />}
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
              >
                {tableExpanded ? 'Hide Strategy List' : 'View Strategy List'}
              </Button>

              <Collapse in={tableExpanded}>
                {isMobile ? (
                  /* MOBILE LIST: HORIZONTAL SCROLL CARDS */
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexWrap: 'nowrap', 
                      overflowX: 'auto', 
                      gap: 2, 
                      mt: 1,
                      pb: 2,
                      '&::-webkit-scrollbar': { height: '6px' },
                      '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '10px' }
                    }}
                  >
                    {strategies.map((strategy) => (
                      <Box key={strategy.name} sx={{ minWidth: '85vw', display: 'flex' }}>
                        <Card variant="outlined" sx={{ borderRadius: 2, width: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CardContent sx={{ pb: '16px !important', flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {strategy.name}
                              </Typography>
                              <Chip 
                                label={strategy.active ? "Active" : "Inactive"} 
                                color={strategy.active ? "success" : "default"} 
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              <Button 
                                variant="outlined" 
                                startIcon={<Edit />} 
                                fullWidth 
                                size="small"
                                onClick={() => handleEdit(strategy)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outlined" 
                                color="error" 
                                startIcon={<Delete />} 
                                fullWidth 
                                size="small"
                                onClick={() => handleDelete(strategy.name)}
                              >
                                Delete
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                    {strategies.length === 0 && (
                      <Typography variant="body2" sx={{ textAlign: 'center', py: 2, width: '100%' }}>
                        No strategies found.
                      </Typography>
                    )}
                  </Box>
                ) : (
                  /* DESKTOP TABLE: UNTOUCHED */
                  <TableContainer component={Paper} elevation={0} variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: 'grey.100' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Active</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {strategies.map((strategy) => (
                          <TableRow key={strategy.name} hover>
                            <TableCell>{strategy.name}</TableCell>
                            <TableCell>{strategy.active ? 'Yes' : 'No'}</TableCell>
                            <TableCell sx={{ textAlign: 'right' }}>
                              <IconButton onClick={() => handleEdit(strategy)} size="small">
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton onClick={() => handleDelete(strategy.name)} size="small" color="error">
                                <Delete fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;