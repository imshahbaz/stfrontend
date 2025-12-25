import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Box } from '@mui/material';

const FinancialChart = ({ rawData, height = 700, theme = 'dark', enableZoom = true }) => {

    // Handle height prop: if string like "100%", convert to number
    const chartHeight = typeof height === 'string' ? 500 : height;

    const { candleSeries } = useMemo(() => {
        const actualArray = Array.isArray(rawData) ? rawData : (rawData?.data || []);

        const months = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };

        // 1. Data Transformation
        const formatted = actualArray.map(d => {
            const [day, month, year] = d.mtimestamp.split('-');
            const timestamp = Date.UTC(parseInt(year), months[month], parseInt(day));

            return {
                x: `${day} ${month} ${year.slice(-2)}`,
                y: [
                    parseFloat(d.chOpeningPrice),
                    parseFloat(d.chTradeHighPrice),
                    parseFloat(d.chTradeLowPrice),
                    parseFloat(d.chClosingPrice)
                ],
                sortKey: timestamp
            };
        }).sort((a, b) => a.sortKey - b.sortKey);

        return {
            candleSeries: [{ data: formatted }]
        };
    }, [rawData]);

    // 2. Chart Options
    const candleOptions = {
        chart: {
            id: 'price-chart',
            // REMOVED: group: 'financial-sync' (not needed for single chart)
            type: 'candlestick',
            height: chartHeight,
            animations: { enabled: false },
            toolbar: { 
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                }
            },
            background: 'transparent', // Let MUI Box handle background
            zoom: { enabled: enableZoom, type: 'x' }
        },
        tooltip: {
            enabled: true,
            theme: theme,
            // Changed to simple tooltip for single chart
            shared: true,
            intersect: false 
        },
        theme: { mode: theme },
        xaxis: {
            type: 'category',
            tickAmount: 10,
            axisBorder: { color: theme === 'dark' ? '#2a2e39' : '#E5E7EB' },
            labels: {
                style: { colors: '#9ca3af', fontSize: '11px' }
            },
            crosshairs: {
                show: true,
                type: 'dashed',
                stroke: { color: '#9ca3af', width: 1, dashArray: 3 }
            }
        },
        yaxis: {
            tooltip: { enabled: true },
            forceNiceScale: false,
            labels: { 
                minWidth: 50, 
                formatter: (val) => val?.toFixed(2),
                style: { colors: '#9ca3af' }
            }
        },
        grid: { borderColor: theme === 'dark' ? '#2a2e39' : '#E5E7EB' }
    };

    if (!candleSeries[0].data.length) return null;

    return (
        <Box sx={{ bgcolor: theme === 'dark' ? '#131722' : '#FFFFFF', p: 1, borderRadius: 2 }}>
            <Chart 
                options={candleOptions} 
                series={candleSeries} 
                type="candlestick" 
                height={chartHeight}
            />
        </Box>
    );
};

export default FinancialChart;