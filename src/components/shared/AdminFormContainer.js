import React from 'react';
import { Paper, Typography, Box, useMediaQuery } from '@mui/material';

const AdminFormContainer = ({ title, children, onSubmit, sx = {} }) => {
    const isMobile = useMediaQuery('(max-width:900px)');
    return (
        <Paper sx={{
            p: isMobile ? 2 : 4,
            borderRadius: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            ...sx
        }}>
            <Typography variant="h5" fontWeight="700" color="primary.main" gutterBottom>
                {title}
            </Typography>
            <Box
                component="form"
                onSubmit={onSubmit}
                sx={{
                    mt: 3,
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
