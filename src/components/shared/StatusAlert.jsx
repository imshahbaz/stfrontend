import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const StatusAlert = ({ success, error, className }) => {
    if (!success && !error) return null;

    return (
        <div className={cn(
            "mt-4 p-4 rounded-2xl flex items-center gap-3 border transition-all animate-in fade-in slide-in-from-top-1",
            success 
                ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400" 
                : "bg-destructive/10 border-destructive/20 text-destructive",
            className
        )}>
            {success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <p className="text-sm font-bold tracking-tight">
                {success || error}
            </p>
        </div>
    );
};

export default StatusAlert;