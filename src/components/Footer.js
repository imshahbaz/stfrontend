import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.default',
        textAlign: 'center',
        py: 3,
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        &copy; {currentYear}{' '}
        <Link href="/" color="inherit" underline="hover">
          Shahbaz Trades Application
        </Link>
        . All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
