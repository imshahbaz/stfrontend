import React from 'react';
import { Paper, Typography, Box, useTheme, Stack } from '@mui/material';

const AdminFormContainer = ({ title, children, onSubmit, sx = {} }) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2.5, sm: 4 },
                borderRadius: '24px',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'white',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: theme.palette.mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.02)',
                ...sx
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
                <Box sx={{
                    width: 4,
                    height: 24,
                    bgcolor: 'primary.main',
                    borderRadius: '4px'
                }} />
                <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: '-0.5px' }}>
                    {title}
                </Typography>
            </Stack>

            <Box
                component="form"
                onSubmit={onSubmit}
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {children}
            </Box>
        </Paper>
    );
};

export default AdminFormContainer;
