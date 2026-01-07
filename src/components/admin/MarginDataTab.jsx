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
        <div className="max-w-2xl mx-auto py-4 md:py-8">
            <div className="bg-card border-2 border-dashed border-border rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-16 text-center space-y-6 md:space-y-8 shadow-2xl shadow-black/5">
                <div className="mx-auto w-16 h-16 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/5">
                    <UploadCloud size={32} className="md:hidden" />
                    <UploadCloud size={48} className="hidden md:block" />
                </div>

                <div>
                    <h3 className="text-xl md:text-3xl font-black tracking-tight mb-2">CSV Data Sync</h3>
                    <p className="text-xs md:text-sm text-muted-foreground font-medium">
                        Upload the latest NSE margin CSV to refresh system leverage data.
                    </p>
                </div>

                <div className="space-y-3 md:space-y-4">
                    <label className={cn(
                        "flex items-center justify-center gap-2 md:gap-3 w-full h-12 md:h-16 rounded-xl md:rounded-2xl border border-border bg-muted/30 cursor-pointer transition-all hover:bg-muted/50 font-bold text-sm md:text-base",
                        file && "border-primary bg-primary/5 text-primary"
                    )}>
                        {file ? <CheckCircle2 size={18} className="md:w-5 md:h-5" /> : <FileText size={18} className="text-muted-foreground md:w-5 md:h-5" />}
                        <span className="truncate max-w-[150px] md:max-w-[200px]">{file ? file.name : 'Select Margin CSV'}</span>
                        <input type="file" hidden accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
                    </label>

                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="btn btn-primary w-full h-12 md:h-16 rounded-xl md:rounded-2xl text-base md:text-lg font-black shadow-xl shadow-primary/20 disabled:opacity-50 disabled:scale-100"
                    >
                        {uploading ? (
                            <><Loader2 className="animate-spin mr-2 h-5 w-5 md:h-6 md:w-6" /> Processing...</>
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