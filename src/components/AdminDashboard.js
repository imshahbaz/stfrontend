import React, { useState, useEffect } from 'react';
import { strategyAPI, marginAPI, configAPI } from '../api/axios';
import {
  Container, Box, Typography, Card, CardContent, Button, Grid, Alert,
  CircularProgress, TextField, FormControlLabel, Checkbox, TableContainer,
  Table, TableHead, TableBody, TableRow, TableCell, IconButton, Paper,
  useMediaQuery, Chip, Modal, Fade, Tabs, Tab, Divider
} from '@mui/material';
import {
  CloudUpload, Dashboard, Edit, Delete, Warning,
  Settings, ListAlt, Storage
} from '@mui/icons-material';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Strategy management state
  const [strategies, setStrategies] = useState([]);
  const [strategyForm, setStrategyForm] = useState({ name: '', scanClause: '', active: false });
  const [editingId, setEditingId] = useState(null);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [strategySuccess, setStrategySuccess] = useState('');
  const [strategyError, setStrategyError] = useState('');

  // Config management state
  const [configJson, setConfigJson] = useState('');
  const [configLoading, setConfigLoading] = useState(false);
  const [configFetching, setConfigFetching] = useState(false);
  const [configSuccess, setConfigSuccess] = useState('');
  const [, setConfigError] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: null, isConfirm: false });

  const isMobile = useMediaQuery('(max-width:900px)');

  useEffect(() => {
    fetchStrategies();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue !== 2) {
      setConfigJson('')
      setConfigSuccess('');
    }
  };

  const handleOpenModal = (title, message, onConfirm = null, isConfirm = false) => {
    setModalConfig({ title, message, onConfirm, isConfirm });
    setModalOpen(true);
  };
  const handleCloseModal = () => setModalOpen(false);

  const fetchStrategies = async () => {
    try {
      const response = await strategyAPI.getStrategiesAdmin();
      setStrategies(response.data);
    } catch (error) { console.error(error); }
  };

  const handleStrategyFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStrategyForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleStrategySubmit = async (e) => {
    e.preventDefault();
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
      fetchStrategies();
      handleCancel();
    } catch (error) {
      setStrategyError(error.response?.data?.message || 'Failed to save strategy');
    } finally { setStrategyLoading(false); }
  };

  const handleCancel = () => {
    setStrategyForm({ name: '', scanClause: '', active: false });
    setEditingId(null);
  };

  const fetchConfig = async () => {
    setConfigFetching(true);
    try {
      const response = await configAPI.getConfig();
      setConfigJson(JSON.stringify(response.data, null, 2));
      setConfigSuccess('Config fetched successfully!');
    } catch (error) {
      setConfigError('Failed to fetch config');
    } finally {
      setConfigFetching(false);
    }
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    setConfigLoading(true);
    try {
      const parsedConfig = JSON.parse(configJson);
      await configAPI.updateConfig(parsedConfig);
      setConfigSuccess('Config updated successfully!');
    } catch (error) {
      setConfigError(error instanceof SyntaxError ? 'Invalid JSON' : 'Update failed');
    } finally { setConfigLoading(false); }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* HEADER */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Dashboard fontSize="large" /> Admin Center
          </Typography>
          <Typography variant="body2" color="text.secondary">Manage NSE data, strategies, and system configurations.</Typography>
        </Box>
      </Box>

      {/* TABS */}
      <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<ListAlt />} label="Strategies" iconPosition="start" />
          <Tab icon={<Storage />} label="Margin Data" iconPosition="start" />
          <Tab icon={<Settings />} label="System Config" iconPosition="start" />
        </Tabs>
        <Divider />

        <Box sx={{ p: isMobile ? 2 : 4 }}>
          {/* TAB 0: STRATEGIES */}
          {activeTab === 0 && (
            <Grid container spacing={4}>
              <Grid item xs={12} lg={4}>
                <Typography variant="subtitle1" gutterBottom fontWeight="700">
                  {editingId ? 'Edit Strategy' : 'Add New Strategy'}
                </Typography>
                <Box component="form" onSubmit={handleStrategySubmit} sx={{ p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                  <TextField label="Name" name="name" value={strategyForm.name} onChange={handleStrategyFormChange} fullWidth required sx={{ mb: 2 }} disabled={!!editingId} size="small" />
                  <TextField label="Scan Clause" name="scanClause" value={strategyForm.scanClause} onChange={handleStrategyFormChange} fullWidth required multiline rows={4} sx={{ mb: 2 }} size="small" />
                  <FormControlLabel control={<Checkbox checked={strategyForm.active} onChange={handleStrategyFormChange} name="active" />} label="Active" sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button type="submit" variant="contained" fullWidth disabled={strategyLoading} size="small">
                      {strategyLoading ? <CircularProgress size={20} /> : editingId ? 'Update' : 'Add'}
                    </Button>
                    {editingId && <Button variant="outlined" onClick={handleCancel} size="small">Cancel</Button>}
                  </Box>
                </Box>
                {(strategySuccess || strategyError) && (
                  <Alert severity={strategySuccess ? "success" : "error"} sx={{ mt: 2 }}>{strategySuccess || strategyError}</Alert>
                )}
              </Grid>

              <Grid item xs={12} lg={8}>
                <Typography variant="subtitle1" gutterBottom fontWeight="700">Existing Strategies</Typography>
                {isMobile ? (
                  // Mobile List View with Horizontal Scrolling
                  <Box sx={{ display: 'flex', flexDirection: 'row', overflowX: 'auto', gap: 2, pb: 1 }}>
                    {strategies.map((s) => (
                      <Card key={s.name} variant="outlined" sx={{ minWidth: 250, flexShrink: 0 }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography fontWeight="bold">{s.name}</Typography>
                            <Chip label={s.active ? "Active" : "Inactive"} size="small" color={s.active ? "success" : "default"} />
                          </Box>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Button onClick={() => { setStrategyForm(s); setEditingId(s.name); }} size="small" variant="outlined" color="primary" sx={{ flex: 1 }}>Edit</Button>
                            <Button onClick={() => handleOpenModal('Delete', `Delete ${s.name}?`, () => strategyAPI.deleteStrategy(s.name).then(fetchStrategies), true)} size="small" variant="outlined" color="error" sx={{ flex: 1 }}>Delete</Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  // Desktop Table View
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f9fafb' }}>
                        <TableRow>
                          <TableCell><b>Name</b></TableCell>
                          <TableCell><b>Status</b></TableCell>
                          <TableCell align="right"><b>Actions</b></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {strategies.map((s) => (
                          <TableRow key={s.name} hover>
                            <TableCell>{s.name}</TableCell>
                            <TableCell><Chip label={s.active ? "Active" : "Off"} size="small" color={s.active ? "success" : "default"} /></TableCell>
                            <TableCell align="right">
                              <IconButton onClick={() => { setStrategyForm(s); setEditingId(s.name); }}><Edit fontSize="small" /></IconButton>
                              <IconButton onClick={() => handleOpenModal('Delete', `Delete ${s.name}?`, () => strategyAPI.deleteStrategy(s.name).then(fetchStrategies), true)} color="error"><Delete fontSize="small" /></IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Grid>
            </Grid>
          )}

          {/* TAB 1: MARGIN DATA */}
          {activeTab === 1 && (
            <Box sx={{ maxWidth: 500, mx: 'auto', py: 4 }}>
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}>
                <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6">CSV Data Sync</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Refresh margin data from NSE CSV files.</Typography>
                <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                  {file ? file.name : 'Select File'}
                  <input type="file" hidden accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
                </Button>
                <Button variant="contained" fullWidth disabled={!file || uploading} onClick={async () => {
                  const fd = new FormData(); fd.append('file', file);
                  setUploading(true);
                  try { await marginAPI.loadFromCsv(fd); setSuccessMessage('Upload Success!'); }
                  catch (e) { setErrorMessage('Failed'); } finally { setUploading(false); }
                }}>
                  {uploading ? 'Processing...' : 'Upload & Load'}
                </Button>
                {(successMessage || errorMessage) && (
                  <Alert severity={successMessage ? "success" : "error"} sx={{ mt: 2 }}>{successMessage || errorMessage}</Alert>
                )}
              </Paper>
            </Box>
          )}

          {/* TAB 2: CONFIG */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography fontWeight="700">JSON Configuration</Typography>
                <Button size="small" onClick={() => configAPI.reloadConfig().then(() => setConfigSuccess('Reloaded'))}>Reload</Button>
                <Button size="small" onClick={async () => { await fetchConfig(); }} disabled={configFetching}>
                  {configFetching ? <CircularProgress size={16} /> : 'Fetch'}
                </Button>
              </Box>
              <TextField fullWidth multiline rows={15} value={configJson} onChange={(e) => setConfigJson(e.target.value)} size="small" sx={{ mb: 2, '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: 13 } }} />
              <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleConfigSubmit} disabled={configLoading}>Save System Config</Button>
              {configSuccess && <Alert severity="success" sx={{ mt: 1 }}>{configSuccess}</Alert>}
            </Box>
          )}
        </Box>
      </Paper>

      {/* DELETE MODAL */}
      <Modal open={modalOpen} onClose={handleCloseModal} closeAfterTransition>
        <Fade in={modalOpen}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 350, bgcolor: 'background.paper', borderRadius: 2, p: 4, boxShadow: 24 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Warning color="error" /> {modalConfig.title}</Typography>
            <Typography sx={{ my: 2 }}>{modalConfig.message}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button variant="contained" color="error" onClick={() => { modalConfig.onConfirm(); handleCloseModal(); }}>Delete</Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;