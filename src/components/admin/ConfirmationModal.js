import React from 'react';
import { Modal, Fade, Box, Typography, Button } from '@mui/material';
import { Warning } from '@mui/icons-material';

const ConfirmationModal = ({ open, onClose, title, message, onConfirm }) => {
    return (
        <Modal open={open} onClose={onClose} closeAfterTransition>
            <Fade in={open}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 350,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    p: 4,
                    boxShadow: 24
                }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Warning color="error" /> {title}
                    </Typography>
                    <Typography sx={{ my: 2 }}>{message}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={() => { onConfirm(); onClose(); }}>Delete</Button>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
};

export default ConfirmationModal;
