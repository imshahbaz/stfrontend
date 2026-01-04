import React from 'react';
import { cn } from '../../lib/utils';

const DetailRow = ({ label, value, bold }) => (
    <div className="flex justify-between items-center py-1">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <span className={cn(
            "text-sm text-foreground",
            bold ? "font-black" : "font-semibold"
        )}>
            {value}
        </span>
    </div>
);

export default DetailRow;