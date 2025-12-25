import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Box } from '@mui/material';

const FinancialChart = ({ rawData }) => {

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

        // Simple RSI Calculation
        const rsiData = formatted.map((d, i) => {
            if (i < 14) return { x: d.x, y: 50 };
            let gains = 0, losses = 0;
            for (let j = i - 13; j <= i; j++) {
                let diff = formatted[j].close - formatted[j - 1].close;
                if (diff >= 0) gains += diff; else losses -= diff;
            }
            return { x: d.x, y: 100 - (100 / (1 + (gains / (losses || 1)))) };
        });

        return {
            candleSeries: [{ data: formatted }],
            rsiSeries: [{ name: 'RSI', data: rsiData }]
        };
    }, [rawData]);

    // 2. Chart Configurations
    const candleOptions = {
        chart: { type: 'candlestick', height: 350, toolbar: { show: true }, background: '#131722' },
        theme: { mode: 'dark' },
        xaxis: { type: 'datetime', axisBorder: { color: '#2a2e39' } },
        yaxis: { tooltip: { enabled: true } },
        grid: { borderColor: '#2a2e39' }
    };

    const rsiOptions = {
        chart: { type: 'line', height: 150, background: '#131722', toolbar: { show: false } },
        theme: { mode: 'dark' },
        stroke: { width: 2, colors: ['#7b1fa2'] },
        xaxis: { type: 'datetime', labels: { show: false } },
        yaxis: { min: 0, max: 100, tickAmount: 2 },
        annotations: {
            position: 'back',
            yaxis: [{ y: 30, borderColor: '#ef5350', label: { text: '30' } },
            { y: 70, borderColor: '#26a69a', label: { text: '70' } }]
        }
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