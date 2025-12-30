import React, { useState, useEffect } from 'react';
import {
    Grid, Typography, Box, TextField, Button, CircularProgress, Alert,
    Card, CardContent, Chip, TableContainer, Table, TableHead, TableBody,
    TableRow, TableCell, IconButton, Paper, Autocomplete, useMediaQuery
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { priceActionAPI, marginAPI } from '../../api/axios';
import ConfirmationModal from './ConfirmationModal';

const FvgTab = () => {
    const [margins, setMargins] = useState([]);
    const [fvgForm, setFvgForm] = useState({ symbol: '', date: null, high: '', low: '' });
    const [fvgLoading, setFvgLoading] = useState(false);
    const [fvgSuccess, setFvgSuccess] = useState('');
    const [fvgError, setFvgError] = useState('');
    const [fetchedFVGs, setFetchedFVGs] = useState([]);
    const [fetchFVGLoading, setFetchFVGLoading] = useState(false);
    const [editingFVGId, setEditingFVGId] = useState(null);
    const [currentFVGSymbol, setCurrentFVGSymbol] = useState('');
    const [refreshFvgLoading, setRefreshFvgLoading] = useState(false);
    const [refreshFvgSuccess, setRefreshFvgSuccess] = useState('');
    const [refreshFvgError, setRefreshFvgError] = useState('');

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: null });

    const isMobile = useMediaQuery('(max-width:900px)');

    useEffect(() => {
        fetchMargins();
    }, []);

    const fetchMargins = async () => {
        try {
            const response = await marginAPI.getAllMargins();
            setMargins(response.data);
        } catch (error) {
            console.error("Error fetching margin data:", error);
        }
    };

    const fetchFVGs = async () => {
        if (!fvgForm.symbol) {
            setFvgError('Please select a symbol to fetch FVGs.');
            return;
        }
        setFetchFVGLoading(true);
        setFvgSuccess('');
        setFvgError('');
        try {
            const response = await priceActionAPI.getPriceActionBySymbol(fvgForm.symbol);
            setFetchedFVGs(response.data.data.fvg || []);
            setCurrentFVGSymbol(fvgForm.symbol);
            setFvgSuccess('FVGs fetched successfully!');
        } catch (error) {
            setFvgError(error.response?.data?.message || 'Failed to fetch FVGs');
        } finally {
            setFetchFVGLoading(false);
        }
    };

    const handleFvgFormChange = (e) => {
        const { name, value } = e.target;
        setFvgForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFvgDateChange = (newValue) => {
        setFvgForm(prev => ({ ...prev, date: newValue }));
    };

    const handleFvgSubmit = async (e) => {
        e.preventDefault();
        setFvgLoading(true);
        setFvgSuccess('');
        setFvgError('');
        try {
            const payload = {
                symbol: fvgForm.symbol,
                date: fvgForm.date ? fvgForm.date.format('YYYY-MM-DD') : '',
                high: parseFloat(fvgForm.high),
                low: parseFloat(fvgForm.low)
            };
            if (editingFVGId) {
                await priceActionAPI.updateFVG(payload);
                setFvgSuccess('FVG updated successfully!');
            } else {
                await priceActionAPI.createFVG(payload);
                setFvgSuccess('FVG created successfully!');
            }
            setFvgForm({ symbol: '', date: null, high: '', low: '' });
            setEditingFVGId(null);
            if (fetchedFVGs.length > 0) {
                await fetchFVGs();
            }
        } catch (error) {
            setFvgError(error.response?.data?.message || 'Failed to save FVG');
        } finally { setFvgLoading(false); }
    };

    const handleEditFVG = (fvg, symbol) => {
        setFvgForm({
            symbol: symbol || currentFVGSymbol,
            date: dayjs(fvg.date),
            high: fvg.high.toString(),
            low: fvg.low.toString()
        });
        setEditingFVGId(fvg.date);
    };

    const handleDeleteFVG = async (fvg) => {
        const payload = {
            symbol: currentFVGSymbol,
            date: fvg.date,
            high: fvg.high,
            low: fvg.low
        };
        try {
            await priceActionAPI.deleteFVG(payload);
            setFvgSuccess('FVG deleted successfully!');
            await fetchFVGs();
        } catch (error) {
            setFvgError(error.response?.data?.message || 'Failed to delete FVG');
        }
    };

    const handleCancelFVG = () => {
        setFvgForm({ symbol: '', date: null, high: '', low: '' });
        setEditingFVGId(null);
    };

    const handleRefreshFvgMitigationData = async () => {
        setRefreshFvgLoading(true);
        setRefreshFvgSuccess('');
        setRefreshFvgError('');
        try {
            await priceActionAPI.refreshFvgMitigationData();
            setRefreshFvgSuccess('FVG mitigation data refreshed successfully!');
        } catch (error) {
            setRefreshFvgError(error.response?.data?.message || 'Failed to refresh FVG mitigation data');
        } finally {
            setRefreshFvgLoading(false);
        }
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
                        {editingFVGId ? 'Edit FVG' : 'Add New FVG'}
                    </Typography>
                    <Box component="form" onSubmit={handleFvgSubmit} sx={{ p: 2, border: `1px solid`, borderColor: 'divider', borderRadius: 2 }}>
                        <Autocomplete
                            fullWidth
                            size="small"
                            options={margins}
                            getOptionLabel={(o) => `${o.symbol} (${o.margin}x)`}
                            value={margins.find(m => m.symbol === fvgForm.symbol) || null}
                            onChange={(e, v) => setFvgForm(prev => ({ ...prev, symbol: v?.symbol || '' }))}
                            disabled={!!editingFVGId}
                            renderInput={(params) => (
                                <TextField {...params} label="Select Stock" variant="outlined" required sx={{ mb: 2 }} />
                            )}
                        />
                        <DatePicker
                            label="Date"
                            value={fvgForm.date}
                            onChange={handleFvgDateChange}
                            disabled={!!editingFVGId}
                            slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: 2 }, required: true } }}
                        />
                        <TextField label="High" name="high" type="number" value={fvgForm.high} onChange={handleFvgFormChange} fullWidth required sx={{ mb: 2 }} size="small" />
                        <TextField label="Low" name="low" type="number" value={fvgForm.low} onChange={handleFvgFormChange} fullWidth required sx={{ mb: 2 }} size="small" />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button type="submit" variant="contained" fullWidth disabled={fvgLoading} size="small">
                                {fvgLoading ? <CircularProgress size={20} /> : 'Save FVG'}
                            </Button>
                            {editingFVGId && <Button variant="outlined" onClick={handleCancelFVG} size="small">Cancel</Button>}
                        </Box>
                    </Box>
                    {(fvgSuccess || fvgError) && (
                        <Alert severity={fvgSuccess ? "success" : "error"} sx={{ mt: 2 }}>{fvgSuccess || fvgError}</Alert>
                    )}
                </Grid>

                <Grid item xs={12} lg={8}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="700">Existing FVGs</Typography>
                    <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                        <Button variant="outlined" onClick={fetchFVGs} disabled={fetchFVGLoading || !fvgForm.symbol} size="small">
                            {fetchFVGLoading ? <CircularProgress size={16} /> : 'Fetch FVGs'}
                        </Button>
                        <Button variant="contained" onClick={handleRefreshFvgMitigationData} disabled={refreshFvgLoading} size="small">
                            {refreshFvgLoading ? <CircularProgress size={16} /> : 'Refresh Data'}
                        </Button>
                    </Box>
                    {(refreshFvgSuccess || refreshFvgError) && (
                        <Alert severity={refreshFvgSuccess ? "success" : "error"} sx={{ mb: 2 }}>{refreshFvgSuccess || refreshFvgError}</Alert>
                    )}
                    {isMobile ? (
                        <Box sx={{ display: 'flex', flexDirection: 'row', overflowX: 'auto', gap: 2, pb: 1 }}>
                            {fetchedFVGs.map((fvg) => (
                                <Card key={fvg.date} variant="outlined" sx={{ minWidth: 250, flexShrink: 0 }}>
                                    <CardContent sx={{ py: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography fontWeight="bold">{fvg.date}</Typography>
                                            <Chip label={currentFVGSymbol} size="small" color="primary" />
                                        </Box>
                                        <Typography variant="body2">High: {fvg.high}, Low: {fvg.low}</Typography>
                                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                            <Button onClick={() => handleEditFVG(fvg, currentFVGSymbol)} size="small" variant="outlined" color="primary" sx={{ flex: 1 }}>Edit</Button>
                                            <Button onClick={() => handleOpenModal('Delete FVG', `Delete FVG for ${fvg.date}?`, () => handleDeleteFVG(fvg))} size="small" variant="outlined" color="error" sx={{ flex: 1 }}>Delete</Button>
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
                                        <TableCell><b>Symbol</b></TableCell>
                                        <TableCell><b>Date</b></TableCell>
                                        <TableCell><b>High</b></TableCell>
                                        <TableCell><b>Low</b></TableCell>
                                        <TableCell align="right"><b>Actions</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fetchedFVGs.map((fvg) => (
                                        <TableRow key={fvg.date} hover>
                                            <TableCell>{currentFVGSymbol}</TableCell>
                                            <TableCell>{fvg.date}</TableCell>
                                            <TableCell>{fvg.high}</TableCell>
                                            <TableCell>{fvg.low}</TableCell>
                                            <TableCell align="right">
                                                <IconButton onClick={() => handleEditFVG(fvg, currentFVGSymbol)}><Edit fontSize="small" /></IconButton>
                                                <IconButton onClick={() => handleOpenModal('Delete FVG', `Delete FVG for ${fvg.date}?`, () => handleDeleteFVG(fvg))} color="error"><Delete fontSize="small" /></IconButton>
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

export default FvgTab;
