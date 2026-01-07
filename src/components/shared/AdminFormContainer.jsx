import React from 'react';
import { cn } from '../../lib/utils';

const AdminFormContainer = ({ title, children, onSubmit, className }) => {
    return (
        <div className={cn(
            "p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-card border border-border flex flex-col shadow-xl shadow-black/5 h-full",
            className
        )}>
            <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="w-1 h-5 md:h-6 bg-primary rounded-full" />
                <h3 className="text-xl md:text-2xl font-black tracking-tight">{title}</h3>
            </div>

            <form onSubmit={onSubmit} className="flex-grow flex flex-col space-y-5 md:space-y-6">
                {children}
            </form>
        </div>
    );
};

export default AdminFormContainer;