import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Button,
    Paper,
} from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

const PageNotFound = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm" sx={{ flexGrow: 1, py: 5 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ mb: 3 }}>
                    <ErrorOutline sx={{ fontSize: 64, color: 'error.main' }} />
                </Box>
                <Typography variant="h4" component="h1" color="error" gutterBottom>
                    404 - Page Not Found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    The page you are looking for does not exist. Please check the URL or go back to the home page.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button variant="contained" color="primary" onClick={() => navigate('/')}>
                        Go to Home
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default PageNotFound;
