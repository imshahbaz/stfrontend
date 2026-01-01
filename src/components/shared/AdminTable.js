import React from 'react';
import {
    Box, Card, CardContent, TableContainer, Table, TableHead, TableBody,
    TableRow, TableCell, Paper, useMediaQuery, useTheme, Typography
} from '@mui/material';

const AdminTable = ({ columns, data, renderMobileCard, keyField = 'id' }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    if (isMobile && renderMobileCard) {
        return (
            <Box sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                overflowX: 'auto',
                gap: 2,
                pb: 2,
                minHeight: data.length === 0 ? 100 : 'auto',
                alignItems: 'center',
                justifyContent: data.length === 0 ? 'center' : 'flex-start',
                '&::-webkit-scrollbar': { height: '6px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '10px' }
            }}>
                {data.map((item, index) => (
                    <Card key={item[keyField] || index} variant="outlined" sx={{ minWidth: 260, maxWidth: 'calc(100vw - 80px)', flexShrink: 0 }}>
                        <CardContent sx={{ py: 2 }}>
                            {renderMobileCard(item)}
                        </CardContent>
                    </Card>
                ))}
                {data.length === 0 && (
                    <Typography color="text.secondary" variant="body2">No data found</Typography>
                )}
            </Box>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {columns.map((column) => (
                            <TableCell key={column.field} align={column.align || 'left'}>
                                <b>{column.label}</b>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow key={item[keyField] || index} hover>
                            {columns.map((column) => (
                                <TableCell key={column.field} align={column.align || 'left'}>
                                    {column.render ? column.render(item) : item[column.field]}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                                No data found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default AdminTable;
