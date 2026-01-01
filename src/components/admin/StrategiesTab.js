import React, { useState, useEffect } from 'react';
import {
    Grid, TextField, FormControlLabel, Checkbox, Button,
    CircularProgress, Box, Chip, IconButton, Typography,
    useTheme, Stack, InputAdornment, useMediaQuery
} from '@mui/material';
import {
    EditRounded,
    DeleteRounded,
    TitleRounded,
    CodeRounded,
    SaveRounded,
    CloseRounded,
    SettingsSuggestRounded,
    ToggleOnRounded
} from '@mui/icons-material';
import { strategyAPI } from '../../api/axios';
import ConfirmationModal from './ConfirmationModal';
import AdminFormContainer from '../shared/AdminFormContainer';
import AdminListContainer from '../shared/AdminListContainer';
import AdminTable from '../shared/AdminTable';
import StatusAlert from '../shared/StatusAlert';
import { motion } from 'framer-motion';

const StrategiesTab = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [strategies, setStrategies] = useState([]);
    const [strategyForm, setStrategyForm] = useState({ name: '', scanClause: '', active: false });
    const [editingId, setEditingId] = useState(null);
    const [strategyLoading, setStrategyLoading] = useState(false);
    const [strategySuccess, setStrategySuccess] = useState('');
    const [strategyError, setStrategyError] = useState('');

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: null });

    useEffect(() => {
        fetchStrategies();
    }, []);

    const fetchStrategies = async () => {
        try {
            const response = await strategyAPI.getStrategiesAdmin();
            setStrategies(response.data.data);
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
                setStrategySuccess('Strategy updated!');
            } else {
                await strategyAPI.createStrategy(strategyForm);
                setStrategySuccess('Strategy created!');
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
        {
            field: 'name',
            label: 'Strategy Name',
            render: (s) => <Typography variant="body2" fontWeight="800" color="primary">{s.name}</Typography>
        },
        {
            field: 'active',
            label: 'Status',
            render: (s) => (
                <Chip
                    label={s.active ? "LIVE" : "DISABLED"}
                    size="small"
                    variant="soft"
                    color={s.active ? "success" : "default"}
                    sx={{ fontWeight: 900, fontSize: '0.65rem', letterSpacing: '0.5px' }}
                />
            )
        },
        {
            field: 'actions',
            label: 'Actions',
            align: 'right',
            render: (s) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <IconButton size="small" onClick={() => { setStrategyForm(s); setEditingId(s.name); }} color="primary">
                        <EditRounded fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenModal('Delete Strategy', `Remove ${s.name} from registry?`, () => strategyAPI.deleteStrategy(s.name).then(fetchStrategies))} color="error">
                        <DeleteRounded fontSize="small" />
                    </IconButton>
                </Stack>
            )
        }
    ];

    const renderMobileCard = (s) => (
        <Box sx={{ py: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" fontWeight="900" color="primary">{s.name}</Typography>
                <Chip
                    label={s.active ? "LIVE" : "INACTIVE"}
                    variant="soft"
                    color={s.active ? "success" : "default"}
                    size="small"
                    sx={{ fontWeight: 800, borderRadius: '8px' }}
                />
            </Box>

            <Box sx={{
                mb: 2,
                p: 1.5,
                borderRadius: '16px',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
            }}>
                <SettingsSuggestRounded color="action" fontSize="small" />
                <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Clause: {s.scanClause.substring(0, 40)}...
                </Typography>
            </Box>

            <Stack direction="row" spacing={1.5}>
                <Button
                    fullWidth
                    size="small"
                    startIcon={<EditRounded />}
                    onClick={() => { setStrategyForm(s); setEditingId(s.name); }}
                    sx={{
                        borderRadius: '12px',
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(124, 58, 237, 0.12)' : 'rgba(124, 58, 237, 0.05)',
                        color: 'primary.main',
                        fontWeight: 800,
                        border: `1px solid ${theme.palette.primary.main}20`,
                        '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.1)',
                        }
                    }}
                >
                    Edit
                </Button>
                <Button
                    fullWidth
                    size="small"
                    color="error"
                    startIcon={<DeleteRounded />}
                    onClick={() => handleOpenModal('Delete Strategy', `Remove ${s.name}?`, () => strategyAPI.deleteStrategy(s.name).then(fetchStrategies))}
                    sx={{
                        borderRadius: '12px',
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.05)',
                        color: 'error.main',
                        fontWeight: 800,
                        border: `1px solid ${theme.palette.error.main}20`,
                        '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                        }
                    }}
                >
                    Delete
                </Button>
            </Stack>
        </Box>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Grid container spacing={isMobile ? 0 : 3}>
                <Grid item xs={12} md={6} sx={{ mb: isMobile ? 3 : 0, px: isMobile ? 2 : 0 }}>
                    <AdminFormContainer
                        title={editingId ? 'Update Strategy' : 'Insert Strategy'}
                        onSubmit={handleStrategySubmit}
                    >
                        <StatusAlert success={strategySuccess} error={strategyError} sx={{ mb: 3 }} />

                        <Stack spacing={2.5}>
                            <TextField
                                label="Execution Label"
                                name="name"
                                value={strategyForm.name}
                                onChange={handleStrategyFormChange}
                                fullWidth
                                required
                                disabled={!!editingId}
                                sx={fieldStyle}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <TitleRounded />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                label="Scan Logic (JSON)"
                                name="scanClause"
                                value={strategyForm.scanClause}
                                onChange={handleStrategyFormChange}
                                fullWidth
                                required
                                multiline
                                rows={6}
                                sx={{
                                    ...fieldStyle,
                                    '& .MuiInputBase-input': { fontFamily: '"Fira Code", monospace', fontSize: '0.85rem' }
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                            <CodeRounded />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder='{ "condition": "price > 100" }'
                            />

                            <Box sx={{
                                p: 1,
                                borderRadius: '16px',
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                                border: `1px solid ${theme.palette.divider}`
                            }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={strategyForm.active}
                                            onChange={handleStrategyFormChange}
                                            name="active"
                                            sx={{
                                                color: theme.palette.primary.main,
                                                '&.Mui-checked': { color: theme.palette.success.main }
                                            }}
                                        />
                                    }
                                    label={
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <ToggleOnRounded fontSize="small" color={strategyForm.active ? "success" : "action"} />
                                            <Typography variant="body2" fontWeight="800">Operational Status</Typography>
                                        </Stack>
                                    }
                                />
                            </Box>

                            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    disabled={strategyLoading}
                                    startIcon={strategyLoading ? <CircularProgress size={20} /> : <SaveRounded />}
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
                                        sx={{
                                            borderRadius: '16px',
                                            px: 3,
                                            fontWeight: 700,
                                            borderColor: 'divider'
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </Stack>
                        </Stack>
                    </AdminFormContainer>
                </Grid>

                <Grid item xs={12} md={6} sx={{ px: isMobile ? 2 : 0 }}>
                    <AdminListContainer title="Strategies Database">
                        <AdminTable
                            columns={columns}
                            data={strategies}
                            renderMobileCard={renderMobileCard}
                            keyField="name"
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

export default StrategiesTab;
