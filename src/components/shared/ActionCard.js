import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowForward } from '@mui/icons-material';

const ActionCard = ({ title, description, icon: Icon, onClick }) => {
    return (
        <Grid xs={12} sm={6} md={4}>
            <motion.div
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <Card
                    sx={{
                        height: '100%',
                        cursor: 'pointer',
                        borderRadius: 5,
                        position: 'relative',
                        overflow: 'hidden',
                        background: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.03)'
                                : '#fff',
                        backdropFilter: 'blur(10px)',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        transition: 'box-shadow 0.3s ease',
                        '&:hover': {
                            boxShadow: (theme) => theme.palette.mode === 'dark'
                                ? '0 12px 24px rgba(0,0,0,0.5)'
                                : '0 12px 24px rgba(0,0,0,0.1)',
                            '& .action-icon-bg': {
                                transform: 'scale(1.1) rotate(5deg)',
                                bgcolor: 'primary.main',
                                color: '#fff'
                            },
                            '& .arrow-icon': {
                                transform: 'translateX(4px)',
                                opacity: 1
                            }
                        },
                    }}
                    onClick={onClick}
                >
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                            <Box
                                className="action-icon-bg"
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 3,
                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(167, 139, 250, 0.1)' : 'rgba(124, 58, 237, 0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'primary.main',
                                    transition: 'all 0.4s ease'
                                }}
                            >
                                <Icon sx={{ fontSize: 32 }} />
                            </Box>
                            <ArrowForward
                                className="arrow-icon"
                                sx={{
                                    opacity: 0.3,
                                    transition: 'all 0.3s ease',
                                    color: 'primary.main'
                                }}
                            />
                        </Box>

                        <Typography variant="h5" fontWeight="800" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, minHeight: 48 }}>
                            {description}
                        </Typography>
                    </CardContent>
                </Card>
            </motion.div>
        </Grid>
    );
};

export default ActionCard;

