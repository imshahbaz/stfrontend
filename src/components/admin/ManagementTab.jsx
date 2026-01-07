import React, { useState, useEffect } from 'react';
import {
    Workflow,
    Trash2,
    BoxSelect,
    Layers,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { priceActionAPI } from '../../api/axios';
import AdminFormContainer from '../shared/AdminFormContainer';
import StatusAlert from '../shared/StatusAlert';
import { cn } from '../../lib/utils';

const ManagementTab = () => {
    const [loadingAction, setLoadingAction] = useState(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    const handleAction = async (actionId, actionLabel, apiCall) => {
        setLoadingAction(actionId);
        setSuccess('');
        setError('');

        try {
            await apiCall();
            setSuccess(`${actionLabel} completed successfully!`);
        } catch (err) {
            console.error(`Error during ${actionLabel}:`, err);
            setError(`Failed to execute ${actionLabel}. Please try again.`);
        } finally {
            setLoadingAction(null);
        }
    };

    const actions = [
        {
            id: 'automation',
            label: 'Automation',
            description: 'Run price action automation',
            icon: Workflow,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            apiCall: priceActionAPI.runAutomation
        },
        {
            id: 'cleanup',
            label: 'Clean Up',
            description: 'Clean up old price actions',
            icon: Trash2,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            apiCall: priceActionAPI.cleanUpActions
        },
        {
            id: 'ob-mitigate',
            label: 'Ob Mitigate',
            description: 'Mitigate order block',
            icon: BoxSelect,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
            apiCall: priceActionAPI.refreshMitigationData
        },
        {
            id: 'fvg-mitigate',
            label: 'Fvg Mitigate',
            description: 'Mitigate fair value gap',
            icon: Layers,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            apiCall: priceActionAPI.refreshFvgMitigationData
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <AdminFormContainer title="Management Console" onSubmit={(e) => e.preventDefault()}>
                <StatusAlert success={success} error={error} className="mb-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {actions.map((action) => {
                        const isLoading = loadingAction === action.id;

                        return (
                            <button
                                key={action.id}
                                disabled={!!loadingAction}
                                onClick={() => handleAction(action.id, action.label, action.apiCall)}
                                className={cn(
                                    "group relative flex items-center gap-4 p-5 rounded-3xl bg-card border border-border/50 transition-all duration-300 text-left overflow-hidden shadow-sm",
                                    isLoading ? "opacity-80" : "hover:border-primary/30 hover:bg-muted/30 active:scale-[0.98]",
                                    !!loadingAction && !isLoading && "opacity-50 grayscale-[0.5]"
                                )}
                            >
                                <div className={cn(
                                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform",
                                    action.bg,
                                    action.color,
                                    !isLoading && "group-hover:scale-110"
                                )}>
                                    {isLoading ? (
                                        <Loader2 size={24} className="animate-spin" />
                                    ) : (
                                        <action.icon size={24} />
                                    )}
                                </div>

                                <div className="flex-grow min-w-0">
                                    <h3 className="text-sm font-black uppercase tracking-tight text-foreground truncate">
                                        {action.label}
                                    </h3>
                                    <p className="text-[10px] font-medium text-muted-foreground line-clamp-1">
                                        {isLoading ? 'Processing request...' : action.description}
                                    </p>
                                </div>

                                <div className={cn(
                                    "h-8 w-8 flex items-center justify-center rounded-full transition-colors",
                                    isLoading ? "bg-primary text-white" : "bg-muted group-hover:bg-primary group-hover:text-white"
                                )}>
                                    <ChevronRight size={16} className={cn(isLoading && "animate-pulse")} />
                                </div>

                                {/* Subtle hover glow */}
                                {!loadingAction && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </AdminFormContainer>

            {/* Footer Info for Mobile */}
            <div className="px-4 py-2 border border-border/40 rounded-2xl bg-muted/20">
                <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60 text-center">
                    Operations are restricted to authorized administrators only
                </p>
            </div>
        </div>
    );
};

export default ManagementTab;
