import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import { Save, Refresh } from '@mui/icons-material';
import { configAPI } from '../../api/axios';
import AdminFormContainer from '../shared/AdminFormContainer';
import StatusAlert from '../shared/StatusAlert';

const SystemConfigTab = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
        <Box sx={{ maxWidth: 800, mx: 'auto', p: isMobile ? 0 : 2 }}>
            <AdminFormContainer
                title="System JSON Configuration"
                onSubmit={handleUpdateConfig}
                sx={{ p: isMobile ? 2 : 4 }}
            >
                <TextField
                    fullWidth
                    multiline
                    minRows={isMobile ? 12 : 15}
                    maxRows={30}
                    variant="outlined"
                    value={configJson}
                    onChange={(e) => setConfigJson(e.target.value)}
                    placeholder="Enter valid JSON configuration..."
                    sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                            fontFamily: 'monospace',
                            fontSize: isMobile ? '0.85rem' : '0.9rem'
                        },
                        '& .MuiInputBase-input': {
                            lineHeight: 1.5
                        }
                    }}
                    disabled={configFetching}
                />
                <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                    <Button type="submit" variant="contained" disabled={configLoading || configFetching} startIcon={configLoading ? <CircularProgress size={20} /> : <Save />} sx={{ flex: 1 }}>
                        Update Configuration
                    </Button>
                    <Button variant="outlined" onClick={fetchConfig} disabled={configFetching || configLoading} startIcon={configFetching ? <CircularProgress size={20} /> : <Refresh />} sx={{ flex: isMobile ? 'none' : 1 }}>
                        Reload
                    </Button>
                </Box>
                <StatusAlert success={configSuccess} error={configError} sx={{ mt: 3 }} />
            </AdminFormContainer>
        </Box>
    );
};

export default SystemConfigTab;
