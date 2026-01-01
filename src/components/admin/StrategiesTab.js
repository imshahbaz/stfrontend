import React, { useState, useEffect } from 'react';
import {
    Grid, TextField, FormControlLabel, Checkbox, Button,
    CircularProgress, Box, Chip, IconButton, Typography
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { strategyAPI } from '../../api/axios';
import ConfirmationModal from './ConfirmationModal';
import AdminFormContainer from '../shared/AdminFormContainer';
import AdminListContainer from '../shared/AdminListContainer';
import AdminTable from '../shared/AdminTable';
import StatusAlert from '../shared/StatusAlert';

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

    const columns = [
        { field: 'name', label: 'Name' },
        {
            field: 'active',
            label: 'Status',
            render: (s) => <Chip label={s.active ? "Active" : "Off"} size="small" color={s.active ? "success" : "default"} />
        },
        {
            field: 'actions',
            label: 'Actions',
            align: 'right',
            render: (s) => (
                <>
                    <IconButton onClick={() => { setStrategyForm(s); setEditingId(s.name); }}><Edit fontSize="small" /></IconButton>
                    <IconButton onClick={() => handleOpenModal('Delete', `Delete ${s.name}?`, () => strategyAPI.deleteStrategy(s.name).then(fetchStrategies))} color="error">
                        <Delete fontSize="small" />
                    </IconButton>
                </>
            )
        }
    ];

    const renderMobileCard = (s) => (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Typography fontWeight="bold" sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '180px'
                }}>{s.name}</Typography>
                <Chip label={s.active ? "Active" : "Inactive"} size="small" color={s.active ? "success" : "default"} sx={{ flexShrink: 0 }} />
            </Box>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button onClick={() => { setStrategyForm(s); setEditingId(s.name); }} size="small" variant="outlined" color="primary" sx={{ flex: 1 }}>Edit</Button>
                <Button onClick={() => handleOpenModal('Delete', `Delete ${s.name}?`, () => strategyAPI.deleteStrategy(s.name).then(fetchStrategies))} size="small" variant="outlined" color="error" sx={{ flex: 1 }}>Delete</Button>
            </Box>
        </>
    );

    return (
        <>
            <Grid container spacing={4}>
                <Grid item xs={12} lg={4}>
                    <AdminFormContainer
                        title={editingId ? 'Edit Strategy' : 'Add New Strategy'}
                        onSubmit={handleStrategySubmit}
                    >
                        <TextField label="Name" name="name" value={strategyForm.name} onChange={handleStrategyFormChange} fullWidth required sx={{ mb: 2 }} disabled={!!editingId} size="small" />
                        <TextField label="Scan Clause" name="scanClause" value={strategyForm.scanClause} onChange={handleStrategyFormChange} fullWidth required multiline rows={4} sx={{ mb: 2 }} size="small" />
                        <FormControlLabel control={<Checkbox checked={strategyForm.active} onChange={handleStrategyFormChange} name="active" />} label="Active" sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button type="submit" variant="contained" fullWidth disabled={strategyLoading} size="small">
                                {strategyLoading ? <CircularProgress size={20} /> : editingId ? 'Update' : 'Add'}
                            </Button>
                            {editingId && <Button variant="outlined" onClick={handleCancel} size="small">Cancel</Button>}
                        </Box>
                    </AdminFormContainer>
                    <StatusAlert success={strategySuccess} error={strategyError} />
                </Grid>

                <Grid item xs={12} lg={8}>
                    <AdminListContainer title="Existing Strategies">
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
        </>
    );
};

export default StrategiesTab;
