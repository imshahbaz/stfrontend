import React, { useState, useEffect } from 'react';
import {
    Grid, Typography, Box, TextField, FormControlLabel, Checkbox, Button,
    CircularProgress, Alert, Card, CardContent, Chip, TableContainer, Table,
    TableHead, TableBody, TableRow, TableCell, IconButton, Paper, useMediaQuery
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { strategyAPI } from '../../api/axios';
import ConfirmationModal from './ConfirmationModal';

const StrategiesTab = () => {
    const [strategies, setStrategies] = useState([]);
    const [strategyForm, setStrategyForm] = useState({ name: '', scanClause: '', active: false });
    const [editingId, setEditingId] = useState(null);
    const [strategyLoading, setStrategyLoading] = useState(false);
    const [strategySuccess, setStrategySuccess] = useState('');
    const [strategyError, setStrategyError] = useState('');

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: null });

    const isMobile = useMediaQuery('(max-width:900px)');

    useEffect(() => {
        fetchStrategies();
    }, []);

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

    const handleOpenModal = (title, message, onConfirm) => {
        setModalConfig({ title, message, onConfirm });
        setModalOpen(true);
    };

    return (
        <>
            <Grid container spacing={4}>
                <Grid item xs={12} lg={4}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="700">
                        {editingId ? 'Edit Strategy' : 'Add New Strategy'}
                    </Typography>
                    <Box component="form" onSubmit={handleStrategySubmit} sx={{ p: 2, border: `1px solid`, borderColor: 'divider', borderRadius: 2 }}>
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
                                            <Button onClick={() => handleOpenModal('Delete', `Delete ${s.name}?`, () => strategyAPI.deleteStrategy(s.name).then(fetchStrategies))} size="small" variant="outlined" color="error" sx={{ flex: 1 }}>Delete</Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
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
                                                <IconButton onClick={() => handleOpenModal('Delete', `Delete ${s.name}?`, () => strategyAPI.deleteStrategy(s.name).then(fetchStrategies))} color="error"><Delete fontSize="small" /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Grid>
            </Grid>

            <ConfirmationModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
            />
        </>
    );
};

export default StrategiesTab;
