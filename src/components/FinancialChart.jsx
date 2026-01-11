import React, { useEffect, useRef, useMemo, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

const FinancialChart = ({ rawData, height = 700, theme = 'dark' }) => {
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const seriesRef = useRef();
    const [ohlc, setOhlc] = useState(null);

    const TV_COLORS = {
        up: '#26a69a',
        down: '#ef5350',
    };

    const months = useMemo(() => ({
        Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
        Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    }), []);

    const chartData = useMemo(() => {
        const actualArray = Array.isArray(rawData) ? rawData : (rawData?.data || []);

        return actualArray.map(d => {
            const [day, month, year] = d.mtimestamp.split('-');
            const time = `${year}-${months[month]}-${day.padStart(2, '0')}`;

            return {
                time,
                open: parseFloat(d.chOpeningPrice),
                high: parseFloat(d.chTradeHighPrice),
                low: parseFloat(d.chTradeLowPrice),
                close: parseFloat(d.chClosingPrice),
                _timestamp: new Date(time).getTime()
            };
        }).sort((a, b) => a._timestamp - b._timestamp)
            .map(({ _timestamp, ...item }) => item);
    }, [rawData, months]);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const isDark = theme === 'dark';
        const backgroundColor = isDark ? '#131722' : '#ffffff';
        const textColor = isDark ? '#d1d4dc' : '#131722';
        const gridColor = isDark ? 'rgba(43, 43, 67, 0.5)' : 'rgba(240, 243, 250, 0.5)';

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor: textColor,
                fontSize: 12,
                fontFamily: 'Inter, system-ui, sans-serif',
            },
            grid: {
                vertLines: { color: gridColor },
                horzLines: { color: gridColor },
            },
            crosshair: {
                mode: 0,
                vertLine: {
                    width: 1,
                    color: isDark ? '#758696' : '#9598a1',
                    style: 3,
                },
                horzLine: {
                    width: 1,
                    color: isDark ? '#758696' : '#9598a1',
                    style: 3,
                },
            },
            rightPriceScale: {
                borderColor: gridColor,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
            timeScale: {
                borderColor: gridColor,
                timeVisible: false,
                secondsVisible: false,
            },
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: TV_COLORS.up,
            downColor: TV_COLORS.down,
            borderVisible: false,
            wickUpColor: TV_COLORS.up,
            wickDownColor: TV_COLORS.down,
        });

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        chart.subscribeCrosshairMove(param => {
            if (
                param.point === undefined ||
                !param.time ||
                param.point.x < 0 ||
                param.point.x > chartContainerRef.current.clientWidth ||
                param.point.y < 0 ||
                param.point.y > chartContainerRef.current.clientHeight
            ) {
                if (chartData.length > 0) {
                    setOhlc(chartData[chartData.length - 1]);
                }
            } else {
                const data = param.seriesData.get(candlestickSeries);
                if (data) setOhlc(data);
            }
        });

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [theme, chartData]);

    useEffect(() => {
        if (seriesRef.current && chartData.length > 0) {
            seriesRef.current.setData(chartData);
            chartRef.current.timeScale().fitContent();
            setOhlc(chartData[chartData.length - 1]);
        }
    }, [chartData]);

    if (!rawData) return null;

    const isPositive = ohlc ? ohlc.close >= ohlc.open : true;
    const currentColor = isPositive ? TV_COLORS.up : TV_COLORS.down;

    return (
        <div className="w-full h-full relative" style={{ minHeight: height }}>
            {/* Minimalist Pro OHLC Bar */}
            <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none px-3 py-1.5 md:px-4 md:py-2 bg-background/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-3 md:gap-6 min-w-max">
                    <div className="flex items-center gap-1">
                        <span className="text-[9px] font-black text-muted-foreground/70 uppercase">O</span>
                        <span className="text-[12px] md:text-sm font-black tabular-nums transition-colors duration-100" style={{ color: currentColor }}>
                            {ohlc?.open?.toFixed(2) || '0.00'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[9px] font-black text-muted-foreground/70 uppercase">H</span>
                        <span className="text-[12px] md:text-sm font-black tabular-nums transition-colors duration-100" style={{ color: currentColor }}>
                            {ohlc?.high?.toFixed(2) || '0.00'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[9px] font-black text-muted-foreground/70 uppercase">L</span>
                        <span className="text-[12px] md:text-sm font-black tabular-nums transition-colors duration-100" style={{ color: currentColor }}>
                            {ohlc?.low?.toFixed(2) || '0.00'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[9px] font-black text-muted-foreground/70 uppercase">C</span>
                        <span className="text-[12px] md:text-sm font-black tabular-nums transition-colors duration-100" style={{ color: currentColor }}>
                            {ohlc?.close?.toFixed(2) || '0.00'}
                        </span>
                    </div>
                </div>

                {ohlc && (
                    <div className="flex items-center gap-2 px-2 py-0.5 rounded-md min-w-max" style={{ backgroundColor: `${currentColor}15` }}>
                        <span className="text-[11px] md:text-xs font-black tabular-nums transition-colors duration-100" style={{ color: currentColor }}>
                            {ohlc.close >= ohlc.open ? '+' : ''}{(ohlc.close - ohlc.open).toFixed(2)}
                        </span>
                        <span className="text-[10px] md:text-[11px] font-bold opacity-80" style={{ color: currentColor }}>
                            ({((ohlc.close - ohlc.open) / ohlc.open * 100).toFixed(2)}%)
                        </span>
                    </div>
                )}
            </div>

            {/* Chart Wrapper to avoid clipping top OHLC bar and bottom labels */}
            <div className="absolute inset-0 top-[38px] md:top-[48px] bottom-0 left-0 right-0">
                <div
                    ref={chartContainerRef}
                    className="w-full h-full touch-none"
                />
            </div>
        </div>
    );
};

export default FinancialChart;

