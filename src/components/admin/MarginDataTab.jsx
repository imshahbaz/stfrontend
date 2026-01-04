import React, { useState } from 'react';
import { UploadCloud, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { marginAPI } from '../../api/axios';
import StatusAlert from '../shared/StatusAlert';
import { cn } from '../../lib/utils';

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
            setSuccessMessage('Margin data updated successfully!');
            setFile(null);
        } catch (e) {
            setErrorMessage('Failed to sync CSV data');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="bg-card border-2 border-dashed border-border rounded-[3rem] p-10 md:p-16 text-center space-y-8 shadow-2xl shadow-black/5">
                <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/5">
                    <UploadCloud size={48} />
                </div>
                
                <div>
                    <h3 className="text-3xl font-black tracking-tight mb-2">CSV Data Sync</h3>
                    <p className="text-muted-foreground font-medium">
                        Upload the latest NSE margin CSV to refresh system leverage data.
                    </p>
                </div>

                <div className="space-y-4">
                    <label className={cn(
                        "flex items-center justify-center gap-3 w-full h-16 rounded-2xl border border-border bg-muted/30 cursor-pointer transition-all hover:bg-muted/50 font-bold",
                        file && "border-primary bg-primary/5 text-primary"
                    )}>
                        {file ? <CheckCircle2 size={20} /> : <FileText size={20} className="text-muted-foreground" />}
                        <span className="truncate max-w-[200px]">{file ? file.name : 'Select Margin CSV'}</span>
                        <input type="file" hidden accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
                    </label>

                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="btn btn-primary w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 disabled:opacity-50 disabled:scale-100"
                    >
                        {uploading ? (
                            <><Loader2 className="animate-spin mr-2 h-6 w-6" /> Processing...</>
                        ) : (
                            'Upload & Sync Data'
                        )}
                    </button>
                </div>

                <StatusAlert success={successMessage} error={errorMessage} />
            </div>
        </div>
    );
};

export default MarginDataTab;