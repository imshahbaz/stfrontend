import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Box } from '@mui/material';

const FinancialChart = ({ rawData, height = 350, theme = 'dark', enableZoom = true }) => {

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
                // IMPORTANT: Use a String for 'x' to remove weekend gaps
                x: `${day} ${month} ${year.slice(-2)}`,
                y: [
                    parseFloat(d.chOpeningPrice),
                    parseFloat(d.chTradeHighPrice),
                    parseFloat(d.chTradeLowPrice),
                    parseFloat(d.chClosingPrice)
                ],
                close: parseFloat(d.chClosingPrice),
                sortKey: timestamp
            };
        }).sort((a, b) => a.sortKey - b.sortKey);

        return {
            candleSeries: [{ data: formatted }]
        };
    }, [rawData]);

    // 3. Chart Options
    const commonXAxis = {
        type: 'category', // REQUIRED to remove gaps
        axisBorder: { color: theme === 'dark' ? '#2a2e39' : '#E5E7EB' },
        labels: {
            style: { colors: '#9ca3af', fontSize: '11px' }
        }
    };

    const candleOptions = {
        chart: {
            id: 'price-chart',
            group: 'financial-sync',
            type: 'candlestick',
            height: height,
            animations: { enabled: false },
            toolbar: { show: true },
            background: theme === 'dark' ? '#131722' : '#FFFFFF',
            zoom: { enabled: enableZoom, type: 'x' }
        },
        tooltip: {
            enabled: true,
            shared: true,
            intersect: false
        },
        theme: { mode: theme },
        xaxis: {
            ...commonXAxis,
            tickAmount: 10,
            crosshairs: {
                show: true,
                type: 'dashed',
                stroke: { color: '#9ca3af', dashArray: 3 }
            }
        },
        yaxis: {
            tooltip: { enabled: true },
            forceNiceScale: false, // Tightens the Y-axis
            labels: { minWidth: 50, formatter: (val) => val.toFixed(2) }
        },
        grid: { borderColor: theme === 'dark' ? '#2a2e39' : '#E5E7EB' }
    };



    if (!candleSeries[0].data.length) return null;

    return (
        <Box sx={{ bgcolor: theme === 'dark' ? '#131722' : 'background.paper', p: 1, borderRadius: 2 }}>
            <Chart options={candleOptions} series={candleSeries} type="candlestick" height={350} />
        </Box>
    );
};

export default FinancialChart;