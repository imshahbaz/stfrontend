import React, { useState } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { marginAPI } from '../../api/axios';
import StatusAlert from '../shared/StatusAlert';

const MarginDataTab = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleUpload = async () => {
        const fd = new FormData();
        fd.append('file', file);
        setUploading(true);
        setSuccessMessage('');
        setErrorMessage('');
        try {
            await marginAPI.loadFromCsv(fd);
            setSuccessMessage('Upload Success!');
            setFile(null);
        } catch (e) {
            setErrorMessage('Failed to upload data');
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
                <StatusAlert success={successMessage} error={errorMessage} />
            </Paper>
        </Box>
    );
};

export default MarginDataTab;
