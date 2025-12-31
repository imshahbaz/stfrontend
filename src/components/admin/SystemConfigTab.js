import React, { useState } from 'react';
import { Box, Typography, Button, TextField, CircularProgress, Alert } from '@mui/material';
import { configAPI } from '../../api/axios';

const SystemConfigTab = () => {
    const [configJson, setConfigJson] = useState('');
    const [configLoading, setConfigLoading] = useState(false);
    const [configFetching, setConfigFetching] = useState(false);
    const [configSuccess, setConfigSuccess] = useState('');
    const [configError, setConfigError] = useState('');

    const fetchConfig = async () => {
        setConfigFetching(true);
        try {
            const response = await configAPI.getConfig();
            setConfigJson(JSON.stringify(response.data, null, 2));
            setConfigSuccess('Config fetched successfully!');
            setConfigError('');
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
            setConfigError('');
        } catch (error) {
            setConfigError(error instanceof SyntaxError ? 'Invalid JSON' : 'Update failed');
        } finally { setConfigLoading(false); }
    };

    return (
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
            {configError && <Alert severity="error" sx={{ mt: 1 }}>{configError}</Alert>}
        </Box>
    );
};

export default SystemConfigTab;
