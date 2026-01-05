import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

const FinancialChart = ({ rawData, height = 700, theme = 'dark', enableZoom = true }) => {
    const chartHeight = typeof height === 'string' ? 500 : height;

    const { candleSeries } = useMemo(() => {
        const actualArray = Array.isArray(rawData) ? rawData : (rawData?.data || []);

        const months = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };

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

    const candleOptions = useMemo(() => ({
        chart: {
            id: 'price-chart',
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
            background: theme === 'dark' ? '#131722' : '#ffffff',
            zoom: { enabled: enableZoom, type: 'x' }
        },
        tooltip: {
            enabled: true,
            theme: theme,
            shared: true,
            intersect: false
        },
        // theme: { mode: theme },
        xaxis: {
            type: 'category',
            tickAmount: 10,
            axisBorder: { color: theme === 'dark' ? '#374151' : '#d1d5db' },
            labels: {
                style: { colors: theme === 'dark' ? '#9ca3af' : '#374151', fontSize: '11px', fontWeight: 700 }
            },
            crosshairs: {
                show: true,
                type: 'dashed',
                stroke: { color: theme === 'dark' ? '#9ca3af' : '#6b7280', width: 1, dashArray: 3 }
            }
        },
        yaxis: {
            tooltip: { enabled: true },
            forceNiceScale: false,
            labels: {
                minWidth: 50,
                formatter: (val) => val?.toFixed(2),
                style: { colors: theme === 'dark' ? '#9ca3af' : '#374151', fontWeight: 700 }
            }
        },
        grid: { borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' },
        plotOptions: {
            candlestick: {
                colors: {
                    upward: '#22c55e',
                    downward: '#ef4444'
                }
            }
        }
    }), [theme]);

    if (!candleSeries[0].data.length) return null;

    return (
        <div className="w-full h-full bg-white dark:bg-[#131722]">
            <Chart
                options={candleOptions}
                series={candleSeries}
                type="candlestick"
                height="100%"
            />
        </div>
    );
};

export default FinancialChart;