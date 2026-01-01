import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const ActionCard = ({ title, description, icon: Icon, onClick }) => {
    return (
        <Grid item xs={12} md={6} lg={4}>
            <Card
                sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: 6,
                    },
                }}
                onClick={onClick}
            >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Icon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h5" component="h3" color="primary" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {description}
                    </Typography>
                </CardContent>
            </Card>
        </Grid>
    );
};

export default ActionCard;
