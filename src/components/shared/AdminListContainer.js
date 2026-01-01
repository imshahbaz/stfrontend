import React from 'react';
import { Paper, Typography, Box, useMediaQuery } from '@mui/material';

const AdminListContainer = ({ title, actions, children }) => {
    const isMobile = useMediaQuery('(max-width:900px)');
    return (
        <Paper sx={{ p: isMobile ? 2 : 4, borderRadius: 2, height: '100%', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight="700" color="primary.main">
                    {title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {actions}
                </Box>
            </Box>
            {children}
        </Paper>
    );
};

export default AdminListContainer;
