import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Container,
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
} from '@mui/material';
import TruecallerLogin from '../TruecallerLogin';

const AuthWrapper = ({ title, subtitle, children, isLogin }) => {
    const navigate = useNavigate();
    const { user, loading, login } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 5, mb: 5, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card sx={{ minWidth: { xs: '100%', sm: 400 }, boxShadow: 3 }}>
                <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" component="h2" color="primary" gutterBottom fontWeight="800">
                            {title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {subtitle}
                        </Typography>
                    </Box>

                    <TruecallerLogin login={login} user={user} loading={loading} isLogin={isLogin} />

                    <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                        <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'divider' }} />
                        <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', fontWeight: 'bold' }}>
                            OR
                        </Typography>
                        <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'divider' }} />
                    </Box>

                    {children}
                </CardContent>
            </Card>
        </Container>
    );
};

export default AuthWrapper;
