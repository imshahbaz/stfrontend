import React, { useState, useEffect } from 'react';
import {
    Grid, Box, TextField, Button, CircularProgress, IconButton, Autocomplete, Chip, Typography
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { priceActionAPI, marginAPI } from '../../api/axios';
import ConfirmationModal from './ConfirmationModal';
import AdminFormContainer from '../shared/AdminFormContainer';
import AdminListContainer from '../shared/AdminListContainer';
import AdminTable from '../shared/AdminTable';
import StatusAlert from '../shared/StatusAlert';

const GenericPriceActionTab = ({
    type, // 'fvg' or 'ob'
    title,
    fetchKey, // 'fvg' or 'orderBlocks'
    apiMethods,
    refreshApiMethod
}) => {
    const [margins, setMargins] = useState([]);
    const [form, setForm] = useState({ symbol: '', date: null, high: '', low: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [currentSymbol, setCurrentSymbol] = useState('');
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [refreshSuccess, setRefreshSuccess] = useState('');
    const [refreshError, setRefreshError] = useState('');

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: null });

    useEffect(() => {
        fetchMargins();
    }, []);

    const fetchMargins = async () => {
        try {
            const response = await marginAPI.getAllMargins();
            setMargins(response.data.data);
        } catch (err) {
            console.error("Error fetching margin data:", err);
        }
    };

    const fetchItems = async () => {
        if (!form.symbol) {
            setError(`Please select a symbol to fetch ${title}s.`);
            return;
        }
        setFetchLoading(true);
        setSuccess('');
        setError('');
        try {
            const response = await priceActionAPI.getPriceActionBySymbol(form.symbol);
            setItems(response.data.data[fetchKey] || []);
            setCurrentSymbol(form.symbol);
            setSuccess(`${title}s fetched successfully!`);
        } catch (err) {
            setError(err.response?.data?.message || `Failed to fetch ${title}s`);
        } finally {
            setFetchLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (newValue) => {
        setForm(prev => ({ ...prev, date: newValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        setError('');
        const h = parseFloat(form.high);
        const l = parseFloat(form.low);

        if (h <= l) {
            setError('High price must be greater than Low price.');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                symbol: form.symbol,
                date: form.date ? form.date.format('YYYY-MM-DD') : '',
                high: h,
                low: l
            };
            if (editingId) {
                await apiMethods.update(payload);
                setSuccess(`${title} updated successfully!`);
            } else {
                await apiMethods.create(payload);
                setSuccess(`${title} created successfully!`);
            }
            setForm({ ...form, date: null, high: '', low: '' });
            setEditingId(null);
            if (form.symbol) {
                await fetchItems();
            }
        } catch (err) {
            setError(err.response?.data?.message || `Failed to save ${title}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setForm({
            symbol: currentSymbol,
            date: dayjs(item.date),
            high: item.high.toString(),
            low: item.low.toString()
        });
        setEditingId(item.date);
    };

    const handleDelete = async (item) => {
        const payload = {
            symbol: currentSymbol,
            date: item.date,
            high: item.high,
            low: item.low
        };
        try {
            await apiMethods.delete(payload);
            setSuccess(`${title} deleted successfully!`);
            await fetchItems();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to delete ${title}`);
        }
    };

    const handleCancel = () => {
        setForm({ symbol: '', date: null, high: '', low: '' });
        setEditingId(null);
    };

    const handleRefreshData = async () => {
        setRefreshLoading(true);
        setRefreshSuccess('');
        setRefreshError('');
        try {
            await refreshApiMethod();
            setRefreshSuccess('Data refreshed successfully!');
        } catch (err) {
            setRefreshError(err.response?.data?.message || 'Failed to refresh data');
        } finally {
            setRefreshLoading(false);
        }
    };

    const handleOpenModal = (title, message, onConfirm) => {
        setModalConfig({ title, message, onConfirm });
        setModalOpen(true);
    };

    const columns = [
        { field: 'symbol', label: 'Symbol', render: () => currentSymbol },
        { field: 'date', label: 'Date' },
        { field: 'high', label: 'High' },
        { field: 'low', label: 'Low' },
        {
            field: 'actions',
            label: 'Actions',
            align: 'right',
            render: (item) => (
                <>
                    <IconButton onClick={() => handleEdit(item)}><Edit fontSize="small" /></IconButton>
                    <IconButton onClick={() => handleOpenModal(`Delete ${title}`, `Delete ${title} for ${item.date}?`, () => handleDelete(item))} color="error">
                        <Delete fontSize="small" />
                    </IconButton>
                </>
            )
        }
    ];

    const renderMobileCard = (item) => (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography fontWeight="bold">{item.date}</Typography>
                <Chip label={currentSymbol} size="small" color="primary" />
            </Box>
            <Typography variant="body2">High: {item.high}, Low: {item.low}</Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button onClick={() => handleEdit(item)} size="small" variant="outlined" color="primary" sx={{ flex: 1 }}>Edit</Button>
                <Button onClick={() => handleOpenModal(`Delete ${title}`, `Delete ${title} for ${item.date}?`, () => handleDelete(item))} size="small" variant="outlined" color="error" sx={{ flex: 1 }}>Delete</Button>
            </Box>
        </>
    );

    return (
        <>
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <AdminFormContainer
                        title={editingId ? `Edit ${title}` : `Add New ${title}`}
                        onSubmit={handleSubmit}
                    >
                        <Autocomplete
                            fullWidth
                            size="small"
                            options={margins}
                            getOptionLabel={(o) => `${o.symbol} (${o.margin}x)`}
                            value={margins.find(m => m.symbol === form.symbol) || null}
                            onChange={(e, v) => setForm(prev => ({ ...prev, symbol: v?.symbol || '' }))}
                            disabled={!!editingId}
                            renderInput={(params) => (
                                <TextField {...params} label="Select Stock" variant="outlined" required sx={{ mb: 2 }} />
                            )}
                        />
                        <DatePicker
                            label="Date"
                            value={form.date}
                            onChange={handleDateChange}
                            disabled={!!editingId}
                            slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: 2 }, required: true } }}
                        />
                        <TextField label="High" name="high" type="number" value={form.high} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} size="small" />
                        <TextField label="Low" name="low" type="number" value={form.low} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} size="small" />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button type="submit" variant="contained" fullWidth disabled={loading} size="small">
                                {loading ? <CircularProgress size={20} /> : `Save ${type.toUpperCase()}`}
                            </Button>
                            {editingId && <Button variant="outlined" onClick={handleCancel} size="small">Cancel</Button>}
                        </Box>
                    </AdminFormContainer>
                    <StatusAlert success={success} error={error} />
                </Grid>

                <Grid item xs={12} md={8}>
                    <AdminListContainer
                        title={`Existing ${title}s`}
                        actions={
                            <>
                                <Button variant="outlined" onClick={fetchItems} disabled={fetchLoading || !form.symbol} size="small">
                                    {fetchLoading ? <CircularProgress size={16} /> : `Fetch ${type.toUpperCase()}s`}
                                </Button>
                                <Button variant="contained" onClick={handleRefreshData} disabled={refreshLoading} size="small">
                                    {refreshLoading ? <CircularProgress size={16} /> : 'Refresh Data'}
                                </Button>
                            </>
                        }
                    >
                        <StatusAlert success={refreshSuccess} error={refreshError} sx={{ mb: 2, mt: 0 }} />
                        <AdminTable
                            columns={columns}
                            data={items}
                            renderMobileCard={renderMobileCard}
                            keyField="date"
                        />
                    </AdminListContainer>
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

export default GenericPriceActionTab;
