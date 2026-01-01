import React from 'react';
import { Paper, Typography, Box, useMediaQuery } from '@mui/material';

const AdminFormContainer = ({ title, children, onSubmit }) => {
    const isMobile = useMediaQuery('(max-width:900px)');
    return (
        <Paper sx={{ p: isMobile ? 2 : 4, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="700" color="primary.main" gutterBottom>
                {title}
            </Typography>
            <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
                {children}
            </Box>
        </Paper>
    );
};

export default AdminFormContainer;
