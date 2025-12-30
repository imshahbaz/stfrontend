import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Alert } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { marginAPI } from '../../api/axios';

const MarginDataTab = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleUpload = async () => {
        const fd = new FormData();
        fd.append('file', file);
        setUploading(true);
        try {
            await marginAPI.loadFromCsv(fd);
            setSuccessMessage('Upload Success!');
        } catch (e) {
            setErrorMessage('Failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: 'auto', py: 4 }}>
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}>
                <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6">CSV Data Sync</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Refresh margin data from NSE CSV files.</Typography>
                <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                    {file ? file.name : 'Select File'}
                    <input type="file" hidden accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
                </Button>
                <Button variant="contained" fullWidth disabled={!file || uploading} onClick={handleUpload}>
                    {uploading ? 'Processing...' : 'Upload & Load'}
                </Button>
                {(successMessage || errorMessage) && (
                    <Alert severity={successMessage ? "success" : "error"} sx={{ mt: 2 }}>{successMessage || errorMessage}</Alert>
                )}
            </Paper>
        </Box>
    );
};

export default MarginDataTab;
