import React from 'react';

const AdminTable = ({ columns, data, renderMobileCard, keyField = 'id' }) => {
    if (renderMobileCard && typeof window !== 'undefined' && window.innerWidth < 1024) {
        return (
            <div className="flex flex-col w-full border-y border-border overflow-hidden bg-background">
                {data.map((item, index) => (
                    <div key={item[keyField] || index} className="w-full border-b border-border/60 last:border-b-0">
                        {renderMobileCard(item)}
                    </div>
                ))}
                {data.length === 0 && (
                    <div className="w-full text-center py-10 text-muted-foreground font-medium">No data found</div>
                )}
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            {columns.map((column) => (
                                <th
                                    key={column.field}
                                    className={`px-4 py-4 font-extrabold text-foreground uppercase tracking-wider ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}`}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item, index) => (
                            <tr key={item[keyField] || index} className="hover:bg-muted/30 transition-colors">
                                {columns.map((column) => (
                                    <td
                                        key={column.field}
                                        className={`px-4 py-4 font-medium text-foreground ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}`}
                                    >
                                        {column.render ? column.render(item) : item[column.field]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground font-medium">
                                    No data found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminTable;