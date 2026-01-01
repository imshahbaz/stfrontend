import React from 'react';
import { Box, Typography } from '@mui/material';

const DetailRow = ({ label, value, bold }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight={bold ? 900 : 600}>{value}</Typography>
    </Box>
);

export default DetailRow;
