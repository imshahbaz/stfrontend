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
import { priceActionAPI, marginAPI } from '../../api/axios';
import ConfirmationModal from './ConfirmationModal';
import AdminFormContainer from '../shared/AdminFormContainer';
import AdminListContainer from '../shared/AdminListContainer';
import AdminTable from '../shared/AdminTable';
import StatusAlert from '../shared/StatusAlert';
import { motion, AnimatePresence } from 'framer-motion';

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
                setSuccess(`${title} updated!`);
            } else {
                await apiMethods.create(payload);
                setSuccess(`${title} added!`);
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
            setSuccess(`${title} removed!`);
            await fetchItems();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to delete ${title}`);
        }
    };

    const handleCancel = () => {
        setForm({ ...form, date: null, high: '', low: '' });
        setEditingId(null);
    };

    const handleRefreshData = async () => {
        setRefreshLoading(true);
        setRefreshSuccess('');
        setRefreshError('');
        try {
            await refreshApiMethod();
            setRefreshSuccess('Market mitigation refreshed');
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

    const fieldStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
        }
    };

    const columns = [
        { field: 'symbol', label: 'Ticker', render: () => <Typography fontWeight="800" variant="body2">{currentSymbol}</Typography> },
        { field: 'date', label: 'Date', render: (item) => <Chip label={item.date} size="small" variant="soft" sx={{ fontWeight: 700 }} /> },
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
                <Typography variant="body1" fontWeight="800">{item.date}</Typography>
                <Chip label={currentSymbol} size="small" color="primary" sx={{ fontWeight: 800, borderRadius: '8px' }} />
            </Box>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
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
                                getOptionLabel={(o) => `${o.symbol} (${o.margin}x)`}
                                value={margins.find(m => m.symbol === form.symbol) || null}
                                onChange={(e, v) => setForm(prev => ({ ...prev, symbol: v?.symbol || '' }))}
                                disabled={!!editingId}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Trading Pair"
                                        variant="outlined"
                                        required
                                        sx={fieldStyle}
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <StoreRounded />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}
                            />

                            <DatePicker
                                label="Execution Date"
                                value={form.date}
                                onChange={handleDateChange}
                                disabled={!!editingId}
                                enableAccessibleFieldDOMStructure={false}
                                slots={{
                                    textField: (params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            required
                                            sx={fieldStyle}
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <CalendarMonthRounded />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )
                                }}
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
        </motion.div>
    );
};

export default GenericPriceActionTab;
