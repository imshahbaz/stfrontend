import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, CircularProgress, useMediaQuery, useTheme, Stack, Typography, Paper } from '@mui/material';
import { SaveRounded, RefreshRounded, CodeRounded, InfoRounded } from '@mui/icons-material';
import { configAPI } from '../../api/axios';
import AdminFormContainer from '../shared/AdminFormContainer';
import StatusAlert from '../shared/StatusAlert';
import { motion } from 'framer-motion';

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
            setConfigSuccess('Configuration loaded');
        } catch (error) {
            setConfigError('Failed to load system config');
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
            setConfigSuccess('System configuration updated!');
        } catch (error) {
            setConfigError(error instanceof SyntaxError ? 'Invalid JSON format' : 'Failed to update config');
        } finally {
            setConfigLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                <AdminFormContainer
                    title="System Configuration (JSON)"
                    onSubmit={handleUpdateConfig}
                >
                    <StatusAlert success={configSuccess} error={configError} sx={{ mb: 3 }} />

                    <Box sx={{
                        mb: 3,
                        p: 2,
                        borderRadius: '16px',
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(124, 58, 237, 0.08)' : 'rgba(124, 58, 237, 0.04)',
                        border: `1px dashed ${theme.palette.primary.main}40`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2
                    }}>
                        <InfoRounded color="primary" sx={{ mt: 0.3 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                            <strong>Careful:</strong> This is a direct override of the system-level JSON configuration. Ensure the syntax is valid JSON before committing changes.
                        </Typography>
                    </Box>

                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: '20px',
                            overflow: 'hidden',
                            border: `1px solid ${theme.palette.divider}`,
                            bgcolor: theme.palette.mode === 'dark' ? '#0f1118' : '#fafafa',
                            mb: 4
                        }}
                    >
                        <Box sx={{
                            px: 2,
                            py: 1,
                            bgcolor: 'action.hover',
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            <CodeRounded fontSize="small" color="primary" />
                            <Typography variant="caption" fontWeight="900" color="text.secondary" letterSpacing="1px">
                                CONFIG.JSON
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            multiline
                            minRows={isMobile ? 14 : 18}
                            maxRows={30}
                            variant="standard"
                            value={configJson}
                            onChange={(e) => setConfigJson(e.target.value)}
                            placeholder='{ "key": "value" }'
                            InputProps={{
                                disableUnderline: true,
                                sx: {
                                    p: 2,
                                    fontFamily: '"Fira Code", "Roboto Mono", monospace',
                                    fontSize: '0.85rem',
                                    lineHeight: 1.6,
                                    color: theme.palette.mode === 'dark' ? '#bae6fd' : '#0369a1'
                                }
                            }}
                            disabled={configFetching}
                        />
                    </Paper>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={configLoading || configFetching}
                            startIcon={configLoading ? <CircularProgress size={20} color="inherit" /> : <SaveRounded />}
                            sx={{
                                flex: 2,
                                py: 1.8,
                                borderRadius: '16px',
                                fontWeight: 800,
                                fontSize: '1rem',
                                boxShadow: `0 8px 16px ${theme.palette.primary.main}30`
                            }}
                        >
                            {configLoading ? 'Updating System...' : 'Commit Changes'}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={fetchConfig}
                            disabled={configFetching || configLoading}
                            startIcon={configFetching ? <CircularProgress size={20} /> : <RefreshRounded />}
                            sx={{
                                flex: 1,
                                py: 1.8,
                                borderRadius: '16px',
                                fontWeight: 700,
                                color: 'text.secondary',
                                borderColor: 'divider'
                            }}
                        >
                            Reload Config
                        </Button>
                    </Stack>
                </AdminFormContainer>
            </Box>
        </motion.div>
    );
};

export default SystemConfigTab;
