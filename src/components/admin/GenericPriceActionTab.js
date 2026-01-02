import React, { useState, useEffect } from 'react';
import {
    Grid, Box, TextField, Button, CircularProgress, IconButton, Autocomplete, Chip, Typography,
    useTheme, Stack, InputAdornment, useMediaQuery
} from '@mui/material';
import {
    EditRounded,
    DeleteRounded,
    SearchRounded,
    RefreshRounded,
    CalendarMonthRounded,
    TrendingUpRounded,
    TrendingDownRounded,
    SaveRounded,
    CloseRounded,
    StoreRounded
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { marginAPI } from '../../api/axios';
import ConfirmationModal from './ConfirmationModal';
import AdminFormContainer from '../shared/AdminFormContainer';
import AdminListContainer from '../shared/AdminListContainer';
import AdminTable from '../shared/AdminTable';
import StatusAlert from '../shared/StatusAlert';
import { AnimatePresence } from 'framer-motion';

const GenericPriceActionTab = ({
    type, // 'fvg' or 'ob'
    title,
    fetchKey, // 'fvg' or 'orderBlocks'
    apiMethods,
    refreshApiMethod
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [margins, setMargins] = useState([]);
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({ symbol: '', date: null, high: '', low: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);

    // List fetching & refreshing states
    const [fetchLoading, setFetchLoading] = useState(false);
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
            const res = await marginAPI.getAllMargins();
            setMargins(res.data.data);
        } catch (err) { console.error(err); }
    };

    const fetchItems = async () => {
        if (!form.symbol) return;
        setFetchLoading(true);
        try {
            const res = await apiMethods.get(form.symbol);
            const data = res.data.data[fetchKey] || [];
            setItems(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
        finally { setFetchLoading(false); }
    };

    const handleFormChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDateChange = (newDate) => {
        setForm(prev => ({ ...prev, date: newDate }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        setError('');
        try {
            const payload = {
                ...form,
                date: form.date ? form.date.format('YYYY-MM-DD') : null
            };
            if (editingId) {
                await apiMethods.update(payload);
                setSuccess(`${title} entry updated!`);
            } else {
                await apiMethods.create(payload);
                setSuccess(`${title} entry created!`);
            }
            fetchItems();
            handleCancel();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to save ${title}`);
        } finally { setLoading(false); }
    };

    const handleEdit = (item) => {
        setForm({
            symbol: item.symbol,
            date: dayjs(item.date),
            high: item.high,
            low: item.low
        });
        setEditingId(item.date);
    };

    const handleDelete = async (item) => {
        try {
            await apiMethods.delete(item.symbol, item.date);
            fetchItems();
        } catch (err) { console.error(err); }
    };

    const handleRefreshData = async () => {
        setRefreshLoading(true);
        setRefreshSuccess('');
        setRefreshError('');
        try {
            await refreshApiMethod();
            setRefreshSuccess('Sync operation completed successfully');
            if (form.symbol) fetchItems();
        } catch (err) {
            setRefreshError('Sync failed: Market data provider unavailable');
        } finally { setRefreshLoading(false); }
    };

    const handleCancel = () => {
        setForm({ ...form, date: null, high: '', low: '' });
        setEditingId(null);
    };

    const handleOpenModal = (title, message, onConfirm) => {
        setModalConfig({ title, message, onConfirm });
        setModalOpen(true);
    };

    const fieldStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            }
        }
    };

    const columns = [
        { field: 'date', label: 'Detection Date', render: (item) => <Typography variant="body2" fontWeight="700">{item.date}</Typography> },
        { field: 'high', label: 'High', render: (item) => <Typography variant="body2" color="success.main" fontWeight="800">{item.high}</Typography> },
        { field: 'low', label: 'Low', render: (item) => <Typography variant="body2" color="error.main" fontWeight="800">{item.low}</Typography> },
        {
            field: 'actions',
            label: 'Actions',
            align: 'right',
            render: (item) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <IconButton size="small" onClick={() => handleEdit(item)} color="primary">
                        <EditRounded fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenModal(`Delete ${title}`, `Remove ${title} entry for ${item.date}?`, () => handleDelete(item))} color="error">
                        <DeleteRounded fontSize="small" />
                    </IconButton>
                </Stack>
            )
        }
    ];

    const renderMobileCard = (item) => (
        <Box sx={{ py: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" fontWeight="800" color="primary">{item.symbol}</Typography>
                <Chip
                    label={item.date}
                    variant="soft"
                    size="small"
                    sx={{ fontWeight: 800, borderRadius: '8px' }}
                />
            </Box>
            <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                <Box sx={{ flex: 1, p: 1, borderRadius: '12px', bgcolor: 'success.main', color: 'white', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>HIGH</Typography>
                    <Typography variant="body2" fontWeight="900">{item.high}</Typography>
                </Box>
                <Box sx={{ flex: 1, p: 1, borderRadius: '12px', bgcolor: 'error.main', color: 'white', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>LOW</Typography>
                    <Typography variant="body2" fontWeight="900">{item.low}</Typography>
                </Box>
            </Stack>
            <Stack direction="row" spacing={1.5}>
                <Button fullWidth size="small" variant="soft" startIcon={<EditRounded />} onClick={() => handleEdit(item)}>Edit</Button>
                <Button fullWidth size="small" variant="soft" color="error" startIcon={<DeleteRounded />} onClick={() => handleOpenModal(`Delete ${title}`, `Remove entry for ${item.date}?`, () => handleDelete(item))}>Delete</Button>
            </Stack>
        </Box>
    );

    return (
        <>
            <Grid container spacing={isMobile ? 0 : 3}>
                <Grid item xs={12} md={6} sx={{ mb: isMobile ? 3 : 0, px: isMobile ? 2 : 0 }}>
                    <AdminFormContainer
                        title={editingId ? `Update ${title}` : `Insert ${title}`}
                        onSubmit={handleSubmit}
                    >
                        <StatusAlert success={success} error={error} sx={{ mb: 3 }} />

                        <Stack spacing={2.5}>
                            <Autocomplete
                                fullWidth
                                options={margins}
                                getOptionLabel={(option) => `${option.symbol} (${option.margin}x)`}
                                value={margins.find(m => m.symbol === form.symbol) || null}
                                onChange={(e, val) => setForm(prev => ({ ...prev, symbol: val?.symbol || '' }))}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search Market Symbol"
                                        required
                                        sx={fieldStyle}
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <>
                                                    <InputAdornment position="start">
                                                        <StoreRounded />
                                                    </InputAdornment>
                                                    {params.InputProps.startAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                            />

                            <DatePicker
                                label="Execution Date"
                                value={form.date}
                                onChange={handleDateChange}
                                slots={{
                                    textField: (params) => (
                                        <TextField {...params} variant="outlined" fullWidth required sx={fieldStyle} InputProps={{ ...params.InputProps, startAdornment: (<InputAdornment position="start"><CalendarMonthRounded /></InputAdornment>), }} />
                                    )
                                }}
                                enableAccessibleFieldDOMStructure={false}
                            />

                            <Stack direction="row" spacing={2}>
                                <TextField
                                    label="Price High"
                                    name="high"
                                    type="number"
                                    value={form.high}
                                    onChange={handleFormChange}
                                    fullWidth
                                    required
                                    sx={fieldStyle}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <TrendingUpRounded color="success" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    label="Price Low"
                                    name="low"
                                    type="number"
                                    value={form.low}
                                    onChange={handleFormChange}
                                    fullWidth
                                    required
                                    sx={fieldStyle}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <TrendingDownRounded color="error" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Stack>

                            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} /> : <SaveRounded />}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: '16px',
                                        fontWeight: 800,
                                        boxShadow: `0 8px 16px ${theme.palette.primary.main}30`
                                    }}
                                >
                                    {editingId ? 'Update Entry' : 'Add Entry'}
                                </Button>
                                {editingId && (
                                    <Button
                                        variant="outlined"
                                        onClick={handleCancel}
                                        startIcon={<CloseRounded />}
                                        sx={{ borderRadius: '16px', px: 3, fontWeight: 700 }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </Stack>
                        </Stack>
                    </AdminFormContainer>
                </Grid>

                <Grid item xs={12} md={6} sx={{ px: isMobile ? 2 : 0 }}>
                    <AdminListContainer
                        title={`${title} Database`}
                        actions={
                            <Stack direction="row" spacing={1.5}>
                                <Button
                                    onClick={fetchItems}
                                    disabled={fetchLoading || !form.symbol}
                                    startIcon={fetchLoading ? <CircularProgress size={16} /> : <SearchRounded />}
                                    sx={{
                                        fontWeight: 800,
                                        borderRadius: '12px',
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(124, 58, 237, 0.12)' : 'rgba(124, 58, 237, 0.05)',
                                        color: 'primary.main',
                                        px: 2,
                                        border: `1px solid ${theme.palette.primary.main}30`,
                                        '&:hover': {
                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.1)',
                                            border: `1px solid ${theme.palette.primary.main}60`,
                                        },
                                        textTransform: 'none',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Query
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleRefreshData}
                                    disabled={refreshLoading}
                                    startIcon={refreshLoading ? <CircularProgress size={16} color="inherit" /> : <RefreshRounded />}
                                    sx={{
                                        fontWeight: 800,
                                        borderRadius: '12px',
                                        boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
                                        px: 2,
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Sync
                                </Button>
                            </Stack>
                        }
                    >
                        <AnimatePresence>
                            {(refreshSuccess || refreshError) && (
                                <Box sx={{ mb: 2 }}>
                                    <StatusAlert success={refreshSuccess} error={refreshError} />
                                </Box>
                            )}
                        </AnimatePresence>
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
