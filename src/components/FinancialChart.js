import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Box } from '@mui/material';

const FinancialChart = ({ rawData, height = 'auto', theme = 'dark', enableZoom = true }) => {

    // 1. Data Transformation
    const { candleSeries, rsiSeries } = useMemo(() => {
        const actualArray = Array.isArray(rawData) ? rawData : (rawData?.data || []);

        const months = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };

        const formatted = actualArray.map(d => {
            const [day, month, year] = d.mtimestamp.split('-');
            // const timestamp = new Date(year, months[month], day).getTime();
            const timestamp = Date.UTC(
                parseInt(year),
                months[month],
                parseInt(day),
                12, 0, 0
            );

            return {
                x: timestamp,
                y: [
                    parseFloat(d.chOpeningPrice),
                    parseFloat(d.chTradeHighPrice),
                    parseFloat(d.chTradeLowPrice),
                    parseFloat(d.chClosingPrice)
                ],
                close: parseFloat(d.chClosingPrice) // for RSI calc
            };
        }).sort((a, b) => a.x - b.x);

        // Improved RSI Calculation using EMA
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
                // Initial simple average
                emaGains += gain / period;
                emaLosses += loss / period;
                rsiData.push({ x: formatted[i].x, y: 50 });
            } else {
                // EMA calculation
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

    // 2. Chart Configurations
    const candleHeight = height === '100%' ? '70%' : height;
    const rsiHeight = height === '100%' ? '30%' : 150;

    const candleOptions = {
        chart: {
            type: 'candlestick',
            height: candleHeight,
            toolbar: { show: true },
            background: '#131722',
            zoom: { enabled: enableZoom },
            pan: { enabled: enableZoom }
        },
        theme: { mode: theme },
        xaxis: { type: 'datetime', axisBorder: { color: '#2a2e39' } },
        yaxis: { tooltip: { enabled: true } },
        grid: { borderColor: '#2a2e39' }
    };

    const rsiOptions = {
        chart: { type: 'line', height: rsiHeight, background: '#131722', toolbar: { show: false } },
        theme: { mode: 'dark' },
        stroke: { width: 2, colors: ['#7b1fa2'] },
        xaxis: { type: 'datetime', labels: { show: false } },
        yaxis: {
            min: 0,
            max: 100,
            tickAmount: 2,
            labels: {
                formatter: function(value) {
                    return Math.round(value);
                }
            }
        },
        tooltip: {
            y: {
                formatter: function(value) {
                    return value.toFixed(2);
                }
            }
        },
    };

    if (!candleSeries[0].data.length) return null;

    return (
        <Box sx={{ bgcolor: '#131722', p: 1, borderRadius: 2 }}>
            {/* Price Chart */}
            <Chart
                options={candleOptions}
                series={candleSeries}
                type="candlestick"
                height={350}
            />
            {/* RSI Chart */}
            <Chart
                options={rsiOptions}
                series={rsiSeries}
                type="line"
                height={150}
            />
        </Box>
    );
};

export default FinancialChart;