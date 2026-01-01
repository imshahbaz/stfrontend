import React from 'react';
import { Alert, Box } from '@mui/material';

const StatusAlert = ({ success, error, sx }) => {
    if (!success && !error) return null;

    return (
        <Box sx={{ mt: 2, ...sx }}>
            <Alert severity={success ? "success" : "error"}>
                {success || error}
            </Alert>
        </Box>
    );
};

export default StatusAlert;
