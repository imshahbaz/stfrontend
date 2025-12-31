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

const OrderBlockTab = () => {
    const [margins, setMargins] = useState([]);
    const [obForm, setObForm] = useState({ symbol: '', date: null, high: '', low: '' });
    const [obLoading, setObLoading] = useState(false);
    const [obSuccess, setObSuccess] = useState('');
    const [obError, setObError] = useState('');
    const [fetchedOBs, setFetchedOBs] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [editingOBId, setEditingOBId] = useState(null);
    const [currentSymbol, setCurrentSymbol] = useState('');
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [refreshSuccess, setRefreshSuccess] = useState('');
    const [refreshError, setRefreshError] = useState('');

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
            setMargins(response.data.data);
        } catch (error) {
            console.error("Error fetching margin data:", error);
        }
    };

    const fetchOrderBlocks = async () => {
        if (!obForm.symbol) {
            setObError('Please select a symbol to fetch order blocks.');
            return;
        }
        setFetchLoading(true);
        setObSuccess('');
        setObError('');
        try {
            const response = await priceActionAPI.getPriceActionBySymbol(obForm.symbol);
            setFetchedOBs(response.data.data.orderBlocks || []);
            setCurrentSymbol(obForm.symbol);
            setObSuccess('Order blocks fetched successfully!');
            setObError('');
        } catch (error) {
            setObError(error.response?.data?.message || 'Failed to fetch order blocks');
            setObSuccess('');
        } finally {
            setFetchLoading(false);
            setRefreshSuccess('');
            setRefreshError('');
        }
    };

    const handleObFormChange = (e) => {
        const { name, value } = e.target;
        setObForm(prev => ({ ...prev, [name]: value }));
    };

    const handleObDateChange = (newValue) => {
        setObForm(prev => ({ ...prev, date: newValue }));
    };

    const handleObSubmit = async (e) => {
        e.preventDefault();
        setObLoading(true);
        setObSuccess('');
        setObError('');
        try {
            const payload = {
                symbol: obForm.symbol,
                date: obForm.date ? obForm.date.format('YYYY-MM-DD') : '',
                high: parseFloat(obForm.high),
                low: parseFloat(obForm.low)
            };
            if (editingOBId) {
                await priceActionAPI.updateOrderBlock(payload);
                setObSuccess('OB updated successfully!');
                setObError('')
            } else {
                await priceActionAPI.createOrderBlock(payload);
                setObSuccess('OB created successfully!');
                setObError('')
            }
            setObForm({ symbol: '', date: null, high: '', low: '' });
            setEditingOBId(null);
            if (fetchedOBs.length > 0) {
                await fetchOrderBlocks();
            }
        } catch (error) {
            setObError(error.response?.data?.message || 'Failed to save OB');
            setObSuccess('');
        } finally {
            setObLoading(false);
            setRefreshSuccess('');
            setRefreshError('');
        }
    };

    const handleEditOB = (ob, symbol) => {
        setObForm({
            symbol: symbol || currentSymbol, // Use passed symbol or curren
            date: dayjs(ob.date),
            high: ob.high.toString(),
            low: ob.low.toString()
        });
        setEditingOBId(ob.date);
    };

    const handleDeleteOB = async (ob) => {
        const payload = {
            symbol: currentSymbol, // Use current symbol as it must be selected to view list
            date: ob.date,
            high: ob.high,
            low: ob.low
        };
        try {
            await priceActionAPI.deleteOrderBlock(payload);
            setObSuccess('OB deleted successfully!');
            await fetchOrderBlocks();
        } catch (error) {
            setObError(error.response?.data?.message || 'Failed to delete OB');
        }
    };

    const handleCancelOB = () => {
        setObForm({ symbol: '', date: null, high: '', low: '' });
        setEditingOBId(null);
    };

    const handleRefreshMitigationData = async () => {
        setRefreshLoading(true);
        setRefreshSuccess('');
        setRefreshError('');
        try {
            await priceActionAPI.refreshMitigationData();
            setRefreshSuccess('Mitigation data refreshed successfully!');
        } catch (error) {
            setRefreshError(error.response?.data?.message || 'Failed to refresh mitigation data');
        } finally {
            setRefreshLoading(false);
            setObSuccess('');
            setObError('');
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
                        {editingOBId ? 'Edit Order Block' : 'Add New Order Block'}
                    </Typography>
                    <Box component="form" onSubmit={handleObSubmit} sx={{ p: 2, border: `1px solid`, borderColor: 'divider', borderRadius: 2 }}>
                        <Autocomplete
                            fullWidth
                            size="small"
                            options={margins}
                            getOptionLabel={(o) => `${o.symbol} (${o.margin}x)`}
                            value={margins.find(m => m.symbol === obForm.symbol) || null}
                            onChange={(e, v) => setObForm(prev => ({ ...prev, symbol: v?.symbol || '' }))}
                            disabled={!!editingOBId}
                            renderInput={(params) => (
                                <TextField {...params} label="Select Stock" variant="outlined" required sx={{ mb: 2 }} />
                            )}
                        />
                        <DatePicker
                            label="Date"
                            value={obForm.date}
                            onChange={handleObDateChange}
                            disabled={!!editingOBId}
                            slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: 2 }, required: true } }}
                        />
                        <TextField label="High" name="high" type="number" value={obForm.high} onChange={handleObFormChange} fullWidth required sx={{ mb: 2 }} size="small" />
                        <TextField label="Low" name="low" type="number" value={obForm.low} onChange={handleObFormChange} fullWidth required sx={{ mb: 2 }} size="small" />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button type="submit" variant="contained" fullWidth disabled={obLoading} size="small">
                                {obLoading ? <CircularProgress size={20} /> : 'Save OB'}
                            </Button>
                            {editingOBId && <Button variant="outlined" onClick={handleCancelOB} size="small">Cancel</Button>}
                        </Box>
                    </Box>
                    {(obSuccess || obError) && (
                        <Alert severity={obSuccess ? "success" : "error"} sx={{ mt: 2 }}>{obSuccess || obError}</Alert>
                    )}
                </Grid>

                <Grid item xs={12} lg={8}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="700">Existing Order Blocks</Typography>
                    <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                        <Button variant="outlined" onClick={fetchOrderBlocks} disabled={fetchLoading || !obForm.symbol} size="small">
                            {fetchLoading ? <CircularProgress size={16} /> : 'Fetch OBs'}
                        </Button>
                        <Button variant="contained" onClick={handleRefreshMitigationData} disabled={refreshLoading} size="small">
                            {refreshLoading ? <CircularProgress size={16} /> : 'Refresh Data'}
                        </Button>
                    </Box>
                    {(refreshSuccess || refreshError) && (
                        <Alert severity={refreshSuccess ? "success" : "error"} sx={{ mb: 2 }}>{refreshSuccess || refreshError}</Alert>
                    )}
                    {isMobile ? (
                        <Box sx={{ display: 'flex', flexDirection: 'row', overflowX: 'auto', gap: 2, pb: 1 }}>
                            {fetchedOBs.map((ob) => (
                                <Card key={ob.date} variant="outlined" sx={{ minWidth: 250, flexShrink: 0 }}>
                                    <CardContent sx={{ py: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography fontWeight="bold">{ob.date}</Typography>
                                            <Chip label={currentSymbol} size="small" color="primary" />
                                        </Box>
                                        <Typography variant="body2">High: {ob.high}, Low: {ob.low}</Typography>
                                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                            <Button onClick={() => handleEditOB(ob, currentSymbol)} size="small" variant="outlined" color="primary" sx={{ flex: 1 }}>Edit</Button>
                                            <Button onClick={() => handleOpenModal('Delete OB', `Delete OB for ${ob.date}?`, () => handleDeleteOB(ob))} size="small" variant="outlined" color="error" sx={{ flex: 1 }}>Delete</Button>
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
                                    {fetchedOBs.map((ob) => (
                                        <TableRow key={ob.date} hover>
                                            <TableCell>{currentSymbol}</TableCell>
                                            <TableCell>{ob.date}</TableCell>
                                            <TableCell>{ob.high}</TableCell>
                                            <TableCell>{ob.low}</TableCell>
                                            <TableCell align="right">
                                                <IconButton onClick={() => handleEditOB(ob, currentSymbol)}><Edit fontSize="small" /></IconButton>
                                                <IconButton onClick={() => handleOpenModal('Delete OB', `Delete OB for ${ob.date}?`, () => handleDeleteOB(ob))} color="error"><Delete fontSize="small" /></IconButton>
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

export default OrderBlockTab;
