import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Container,
    Box,
    Paper,
    Typography,
    CircularProgress,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';
import TruecallerLogin from '../TruecallerLogin';
import GoogleLogin from '../GoogleLogin';

const AuthWrapper = ({ title, subtitle, children, isLogin }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { user, loading, login, appConfig } = useAuth();
    const { auth } = appConfig;

    useEffect(() => {
        if (!loading && user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} thickness={4} />
            </Container>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative Background Elements */}
            <Box sx={{
                position: 'absolute',
                top: -100,
                right: -100,
                width: 300,
                height: 300,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                opacity: 0.05,
                filter: 'blur(80px)',
                zIndex: 0
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: -50,
                left: -50,
                width: 250,
                height: 250,
                borderRadius: '50%',
                bgcolor: 'secondary.main',
                opacity: 0.05,
                filter: 'blur(60px)',
                zIndex: 0
            }} />

            <Container
                maxWidth="xs"
                disableGutters={isMobile}
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: { xs: 'flex-start', sm: 'center' },
                    pt: { xs: 4, sm: 0 },
                    px: { xs: 0, sm: 2 },
                    zIndex: 1
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{ width: '100%' }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            width: '100%',
                            bgcolor: { xs: 'transparent', sm: 'background.paper' },
                            borderRadius: { xs: 0, sm: '32px' },
                            border: {
                                xs: 'none',
                                sm: `1px solid ${theme.palette.divider}`
                            },
                            p: { xs: 3, sm: 5 },
                            boxShadow: {
                                xs: 'none',
                                sm: theme.palette.mode === 'dark' ? '0 20px 40px rgba(0,0,0,0.4)' : '0 20px 40px rgba(0,0,0,0.05)'
                            }
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 5 }}>
                            <Typography
                                variant="h3"
                                fontWeight="900"
                                color="primary"
                                sx={{
                                    mb: 1.5,
                                    letterSpacing: '-1.5px',
                                    display: 'inline-block',
                                    background: theme.palette.mode === 'dark'
                                        ? 'linear-gradient(45deg, #fff 30%, #a78bfa 90%)'
                                        : `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                {title}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" fontWeight="500">
                                {subtitle}
                            </Typography>
                        </Box>

                        {auth.truecaller &&
                            <Box sx={{ mb: 4 }}>
                                <TruecallerLogin login={login} user={user} loading={loading} isLogin={isLogin} />
                            </Box>}

                        {auth.google &&
                            <Box sx={{ mb: 4 }}>
                                <GoogleLogin />
                            </Box>}

                        {auth.email &&
                            <><Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                <Box sx={{ flexGrow: 1, height: '1px', bgcolor: theme.palette.divider }} />
                                <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', fontWeight: '800', letterSpacing: '1px' }}>
                                    OR CONTINUE WITH EMAIL
                                </Typography>
                                <Box sx={{ flexGrow: 1, height: '1px', bgcolor: theme.palette.divider }} />
                            </Box>
                                {children}
                            </>}
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default AuthWrapper;
