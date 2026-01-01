import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, CircularProgress } from '@mui/material';
import { Save, Refresh } from '@mui/icons-material';
import { configAPI } from '../../api/axios';
import AdminFormContainer from '../shared/AdminFormContainer';
import StatusAlert from '../shared/StatusAlert';

const SystemConfigTab = () => {
    const [configJson, setConfigJson] = useState('');
    const [configLoading, setConfigLoading] = useState(false);
    const [configFetching, setConfigFetching] = useState(false);
    const [configSuccess, setConfigSuccess] = useState('');
    const [configError, setConfigError] = useState('');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setConfigFetching(true);
        setConfigSuccess('');
        setConfigError('');
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

    const handleUpdateConfig = async (e) => {
        e.preventDefault();
        setConfigLoading(true);
        setConfigSuccess('');
        setConfigError('');
        try {
            const updatedConfig = JSON.parse(configJson);
            await configAPI.updateConfig(updatedConfig);
            setConfigSuccess('Config updated successfully!');
        } catch (error) {
            setConfigError(error instanceof SyntaxError ? 'Invalid JSON format' : 'Failed to update config');
        } finally {
            setConfigLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
            <AdminFormContainer title="System JSON Configuration" onSubmit={handleUpdateConfig}>
                <TextField
                    fullWidth
                    multiline
                    minRows={15}
                    maxRows={30}
                    variant="outlined"
                    value={configJson}
                    onChange={(e) => setConfigJson(e.target.value)}
                    placeholder="Enter valid JSON configuration..."
                    sx={{ mb: 3, '& .MuiOutlinedInput-root': { fontFamily: 'monospace' } }}
                    disabled={configFetching}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" disabled={configLoading || configFetching} startIcon={configLoading ? <CircularProgress size={20} /> : <Save />} sx={{ flex: 1 }}>
                        Update Configuration
                    </Button>
                    <Button variant="outlined" onClick={fetchConfig} disabled={configFetching || configLoading} startIcon={configFetching ? <CircularProgress size={20} /> : <Refresh />}>
                        Reload
                    </Button>
                </Box>
                <StatusAlert success={configSuccess} error={configError} sx={{ mt: 3 }} />
            </AdminFormContainer>
        </Box>
    );
};

export default SystemConfigTab;
