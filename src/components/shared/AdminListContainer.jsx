import React from 'react';
import { cn } from '../../lib/utils';

const AdminListContainer = ({ title, actions, children, className }) => {
    return (
        <div className={cn(
            "p-6 md:p-8 rounded-[2rem] bg-card border border-border flex flex-col shadow-xl shadow-black/5 h-full overflow-hidden",
            className
        )}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <h3 className="text-2xl font-black tracking-tight text-primary">
                    {title}
                </h3>
                <div className="flex gap-2">
                    {actions}
                </div>
            </div>
            <div className="flex-grow overflow-hidden">
                {children}
            </div>
        </div>
    );
};

export default AdminListContainer;