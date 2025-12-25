import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Box } from '@mui/material';

const FinancialChart = ({ rawData, height = 350, theme = 'dark', enableZoom = true }) => {

    const { candleSeries, rsiSeries } = useMemo(() => {
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

        // 2. RSI Calculation
        const rsiData = [];
        let emaGains = 0, emaLosses = 0;
        const period = 14;
        const multiplier = 2 / (period + 1);

        for (let i = 0; i < formatted.length; i++) {
            if (i === 0) {
                rsiData.push({ x: formatted[i].x, y: 50 });
                continue;
            }
            const diff = formatted[i].close - formatted[i - 1].close;
            const gain = diff > 0 ? diff : 0;
            const loss = diff < 0 ? -diff : 0;

            if (i < period) {
                emaGains += gain / period;
                emaLosses += loss / period;
                rsiData.push({ x: formatted[i].x, y: 50 });
            } else {
                emaGains = (gain * multiplier) + (emaGains * (1 - multiplier));
                emaLosses = (loss * multiplier) + (emaLosses * (1 - multiplier));
                const rs = emaGains / (emaLosses || 1);
                const rsi = 100 - (100 / (1 + rs));
                rsiData.push({ x: formatted[i].x, y: rsi });
            }
        }

        return {
            candleSeries: [{ data: formatted }],
            rsiSeries: [{ name: 'RSI', data: rsiData }]
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
            height: 350,
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

    const rsiOptions = {
        chart: {
            id: 'rsi-chart',
            group: 'financial-sync',
            type: 'line',
            height: 150,
            animations: { enabled: false },
            background: theme === 'dark' ? '#131722' : '#FFFFFF',
            toolbar: { show: false }
        },
        theme: { mode: theme },
        stroke: { width: 2, colors: ['#7b1fa2'] },
        xaxis: {
            ...commonXAxis,
            labels: { show: false },
            crosshairs: {
                show: true,
                type: 'dashed',
                stroke: { color: '#9ca3af', dashArray: 3 }
            }
        },
        yaxis: {
            min: 0,
            max: 100,
            tickAmount: 2,
            labels: {
                minWidth: 50,
                formatter: (val) => Math.round(val).toString() // Whole numbers for axis
            }
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (val) => val.toFixed(2) // 2 decimals for value
            }
        }
    };

    if (!candleSeries[0].data.length) return null;

    return (
        <Box sx={{ bgcolor: theme === 'dark' ? '#131722' : 'background.paper', p: 1, borderRadius: 2 }}>
            <Chart options={candleOptions} series={candleSeries} type="candlestick" height={350} />
            <Chart options={rsiOptions} series={rsiSeries} type="line" height={150} />
        </Box>
    );
};

export default FinancialChart;