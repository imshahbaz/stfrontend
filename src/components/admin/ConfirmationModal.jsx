import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

const ConfirmationModal = ({ open, onClose, title, message, onConfirm, confirmText = 'Confirm' }) => {
    const isDestructive = confirmText.toLowerCase() === 'delete';

    return (
        <AlertDialog.Root open={open} onOpenChange={onClose}>
            <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in" />
                <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-background p-8 shadow-2xl border border-border animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full",
                            isDestructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                        )}>
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <AlertDialog.Title className="text-xl font-black tracking-tight">
                            {title}
                        </AlertDialog.Title>
                    </div>

                    <AlertDialog.Description className="text-muted-foreground font-medium mb-8 leading-relaxed">
                        {message}
                    </AlertDialog.Description>

                    <div className="flex justify-end gap-3">
                        <AlertDialog.Cancel asChild>
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 text-sm font-bold rounded-xl hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={cn(
                                    "px-8 py-2.5 text-sm font-black text-white rounded-xl transition-all active:scale-95",
                                    isDestructive
                                        ? "bg-destructive hover:shadow-lg hover:shadow-destructive/20"
                                        : "bg-primary hover:shadow-lg hover:shadow-primary/20"
                                )}
                            >
                                {confirmText}
                            </button>
                        </AlertDialog.Action>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
};

export default ConfirmationModal;