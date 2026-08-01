import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createChart, ColorType, CrosshairMode, CandlestickSeries } from 'lightweight-charts';
import { fetchMarginData, fetchMarketBarSeries } from '../api/service';

function formatMargin(value) {
  if (value === null || value === undefined || value === '') return '—';
  return Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function aggregateDailyCandles(candles) {
  if (!candles || candles.length === 0) return [];

  const groups = new Map();

  candles.forEach((point) => {
    const date = new Date(point.time * 1000);
    const dateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);

    if (!groups.has(dateStr)) {
      groups.set(dateStr, []);
    }
    groups.get(dateStr).push(point);
  });

  const dailyCandles = [];
  groups.forEach((dayCandles, dateStr) => {
    dayCandles.sort((a, b) => a.time - b.time);

    const open = dayCandles[0].open;
    const close = dayCandles[dayCandles.length - 1].close;
    let high = -Infinity;
    let low = Infinity;

    dayCandles.forEach((c) => {
      if (c.high > high) high = c.high;
      if (c.low < low) low = c.low;
    });

    dailyCandles.push({
      time: dateStr,
      open,
      high,
      low,
      close,
    });
  });

  return dailyCandles.sort((a, b) => a.time.localeCompare(b.time));
}

function SortIcon({ dir }) {
  if (!dir) {
    return (
      <svg className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 15l5 5 5-5M7 9l5-5 5 5" />
      </svg>
    );
  }
  if (dir === 'asc') {
    return (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    );
  }
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function formatTimeLabel(time) {
  if (typeof time === 'number') {
    return new Date(time * 1000).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  if (typeof time === 'string') {
    const parts = time.split('-');
    if (parts.length === 3) {
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  }
  return String(time);
}

function CandlestickChart({ data, timeframe }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [hoveredData, setHoveredData] = useState(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(51, 65, 85, 0.3)' },
        horzLines: { color: 'rgba(51, 65, 85, 0.3)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#6366f1', width: 1, style: 2, labelBackgroundColor: '#4f46e5' },
        horzLine: { color: '#6366f1', width: 1, style: 2, labelBackgroundColor: '#4f46e5' },
      },
      localization: {
        locale: 'en-IN',
        timeFormatter: (timestamp) => {
          if (typeof timestamp === 'number') {
            const date = new Date(timestamp * 1000);
            return date.toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });
          }
          if (typeof timestamp === 'string') {
            const parts = timestamp.split('-');
            if (parts.length === 3) {
              const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
              return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });
            }
          }
          if (timestamp && typeof timestamp === 'object') {
            const { year, month, day } = timestamp;
            return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
          }
          return String(timestamp);
        },
      },
      rightPriceScale: { borderColor: 'rgba(51, 65, 85, 0.6)' },
      timeScale: {
        borderColor: 'rgba(51, 65, 85, 0.6)',
        timeVisible: timeframe === '15min',
        secondsVisible: false,
        tickMarkFormatter: (time, tickMarkType) => {
          let date;
          if (typeof time === 'number') {
            date = new Date(time * 1000);
          } else if (typeof time === 'string') {
            const parts = time.split('-');
            if (parts.length === 3) {
              date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            } else {
              date = new Date(time);
            }
          } else if (time && typeof time === 'object') {
            date = new Date(time.year, time.month - 1, time.day);
          } else {
            return String(time);
          }

          switch (tickMarkType) {
            case 0: // Year
              return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric' });
            case 1: // Month
              return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short' });
            case 2: // Day
              return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' });
            case 3: // Time
            case 4: // TimeWithSeconds
              return date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });
            default:
              return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });
          }
        },
      },
      width: containerRef.current.clientWidth,
      height: 420,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    if (dataRef.current && dataRef.current.length > 0) {
      series.setData(dataRef.current);
      chart.timeScale().fitContent();
    }

    const handleCrosshairMove = (param) => {
      if (!param || !param.time || !param.seriesData || param.point === undefined || param.point.x < 0 || param.point.y < 0) {
        setHoveredData(null);
        return;
      }
      const candle = param.seriesData.get(series);
      if (candle) {
        setHoveredData(candle);
      } else {
        setHoveredData(null);
      }
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (chartRef.current && seriesRef.current && data && data.length > 0) {
      chartRef.current.timeScale().applyOptions({
        timeVisible: timeframe === '15min',
      });
      seriesRef.current.setData(data);
      chartRef.current.timeScale().fitContent();
    }
  }, [data, timeframe]);

  const displayCandle = hoveredData || (data && data.length > 0 ? data[data.length - 1] : null);
  let change = 0;
  let changePercent = 0;
  let isUp = true;
  if (displayCandle) {
    change = displayCandle.close - displayCandle.open;
    changePercent = displayCandle.open ? (change / displayCandle.open) * 100 : 0;
    isUp = change >= 0;
  }

  return (
    <div className="relative w-full">
      {displayCandle && (
        <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-slate-800/80 bg-slate-900/90 px-3 py-1.5 text-xs font-mono backdrop-blur-sm">
          <span className="font-sans font-medium text-slate-400">
            {formatTimeLabel(displayCandle.time)}
          </span>
          <span className="text-slate-400">
            O: <span className="font-semibold text-slate-200">{displayCandle.open?.toFixed(2)}</span>
          </span>
          <span className="text-slate-400">
            H: <span className="font-semibold text-slate-200">{displayCandle.high?.toFixed(2)}</span>
          </span>
          <span className="text-slate-400">
            L: <span className="font-semibold text-slate-200">{displayCandle.low?.toFixed(2)}</span>
          </span>
          <span className="text-slate-400">
            C: <span className="font-semibold text-slate-200">{displayCandle.close?.toFixed(2)}</span>
          </span>
          <span className={`font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePercent.toFixed(2)}%)
          </span>
        </div>
      )}
      <div ref={containerRef} className="w-full" />
    </div>
  );
}

export default function MarketData() {
  /** @type {[import('../api/types').MarginData[] | null, Function]} */
  const [marginData, setMarginData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [searchedSymbol, setSearchedSymbol] = useState(null);
  const [barSeriesData, setBarSeriesData] = useState(null);
  const [barLoading, setBarLoading] = useState(false);
  const [barError, setBarError] = useState(null);
  const [timeframe, setTimeframe] = useState('15min');

  const [showTable, setShowTable] = useState(false);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeChartData = useMemo(() => {
    if (!barSeriesData || barSeriesData.length === 0) return [];
    if (timeframe === 'daily') {
      return aggregateDailyCandles(barSeriesData);
    }
    return barSeriesData;
  }, [barSeriesData, timeframe]);

  const loadMarginData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMarginData();
      setMarginData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarginData();
  }, [loadMarginData]);

  const sortedOptions = useMemo(() => {
    if (!marginData) return [];
    return [...marginData].sort((a, b) => (a.symbol || '').localeCompare(b.symbol || ''));
  }, [marginData]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedOptions;
    return sortedOptions.filter(
      (item) =>
        (item.symbol || '').toLowerCase().includes(q) ||
        (item.name || '').toLowerCase().includes(q)
    );
  }, [sortedOptions, query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedItem = marginData?.find((item) => item.symbol === selectedSymbol) || null;

  const handleSelectOption = (item) => {
    setSelectedSymbol(item.symbol);
    setQuery(item.symbol);
    setDropdownOpen(false);
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    setSelectedSymbol('');
    setDropdownOpen(true);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedRows = useMemo(() => {
    if (!marginData) return [];
    const rows = [...marginData];
    if (!sortKey) return rows;
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp;
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av ?? '').localeCompare(String(bv ?? ''));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [marginData, sortKey, sortDir]);

  const handleSearch = async () => {
    if (!selectedSymbol) return;
    setBarLoading(true);
    setBarError(null);
    setBarSeriesData(null);
    try {
      const data = await fetchMarketBarSeries(selectedSymbol);
      const chartData = (data || [])
        .map((point) => ({
          time: Math.floor(new Date(point.timestamp).getTime() / 1000),
          open: Number(point.open),
          high: Number(point.high),
          low: Number(point.low),
          close: Number(point.close),
        }))
        .filter((point) => Number.isFinite(point.time) && Number.isFinite(point.open))
        .sort((a, b) => a.time - b.time);
      setBarSeriesData(chartData);
      setSearchedSymbol(selectedSymbol);
    } catch (err) {
      if (err?.response?.status === 404) {
        setBarError(`No bar series data found for symbol "${selectedSymbol}".`);
      } else {
        setBarError(err instanceof Error ? err.message : 'Failed to fetch bar series data');
      }
      setSearchedSymbol(selectedSymbol);
    } finally {
      setBarLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 p-6 md:p-8 shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">Market Data</h1>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                Margin Snapshot
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Required margin and rupeezy margin for all market symbols, plus candlestick charts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadMarginData()}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50"
            >
              <svg
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {lastUpdated && (
          <p className="mt-3 text-[11px] text-slate-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
          <p className="font-semibold">Error fetching market data:</p>
          <p className="mt-1 font-mono">{error}</p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Candlestick Chart
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div ref={dropdownRef} className="relative w-full sm:w-96">
            <div className="flex items-center">
              <svg className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Search symbol or name..."
                disabled={!marginData || marginData.length === 0}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-8 text-sm text-slate-200 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="absolute right-2 p-1 text-slate-400 transition hover:text-slate-200"
                aria-label="Toggle dropdown"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {dropdownOpen && (
              <div
                className="absolute z-10 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border border-slate-700 bg-slate-950 shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredOptions.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-slate-500">No symbols match "{query}".</p>
                ) : (
                  filteredOptions.map((item) => (
                    <button
                      key={item.token || item.symbol}
                      type="button"
                      onClick={() => handleSelectOption(item)}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-slate-800/80 ${
                        item.symbol === selectedSymbol ? 'bg-indigo-500/10 text-indigo-300' : 'text-slate-200'
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-mono font-semibold">{item.symbol || '—'}</span>
                        {item.name && <span className="block truncate text-xs text-slate-500">{item.name}</span>}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-emerald-400">
                        {formatMargin(item.rupeezyMargin)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleSearch}
            disabled={!selectedSymbol || barLoading}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
            {barLoading ? 'Loading...' : 'Search'}
          </button>
        </div>

        {selectedItem && (
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-700/60 bg-slate-950/50 p-4 sm:grid-cols-5">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Symbol</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-indigo-300">{selectedItem.symbol || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Name</p>
              <p className="mt-0.5 truncate text-sm text-slate-200">{selectedItem.name || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Token</p>
              <p className="mt-0.5 font-mono text-sm text-slate-300">{selectedItem.token || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Required Margin</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-slate-200">
                {formatMargin(selectedItem.requiredMargin)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Rupeezy Margin</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-emerald-300">
                {formatMargin(selectedItem.rupeezyMargin)}
              </p>
            </div>
          </div>
        )}

        {barError && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
            <p className="font-semibold">Error fetching bar series:</p>
            <p className="mt-1 font-mono">{barError}</p>
          </div>
        )}

        <div className="mt-4">
          {barLoading ? (
            <div className="h-[420px] animate-pulse rounded-xl border border-slate-800 bg-slate-950/40" />
          ) : searchedSymbol && activeChartData && activeChartData.length > 0 ? (
            <>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                    {searchedSymbol}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {activeChartData.length} {timeframe === 'daily' ? 'daily candles' : 'candles (15m)'}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
                  <label
                    className={`flex items-center gap-1.5 cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition ${
                      timeframe === '15min'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeframe"
                      value="15min"
                      checked={timeframe === '15min'}
                      onChange={() => setTimeframe('15min')}
                      className="sr-only"
                    />
                    <span>15 Min</span>
                  </label>
                  <label
                    className={`flex items-center gap-1.5 cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition ${
                      timeframe === 'daily'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeframe"
                      value="daily"
                      checked={timeframe === 'daily'}
                      onChange={() => setTimeframe('daily')}
                      className="sr-only"
                    />
                    <span>Daily</span>
                  </label>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <CandlestickChart data={activeChartData} timeframe={timeframe} />
              </div>
            </>
          ) : searchedSymbol ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-10 text-center text-sm text-slate-400">
              No bar series data available for this symbol.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-10 text-center text-sm text-slate-500">
              Select a symbol and click Search to plot the candlestick chart.
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl">
        <div>
          <p className="text-sm font-semibold text-slate-200">All Margin Data</p>
          <p className="text-xs text-slate-500">
            {marginData ? `${marginData.length} symbols` : '—'}
          </p>
        </div>
        <button
          onClick={() => setShowTable((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:from-indigo-600 hover:to-purple-700"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          {showTable ? 'Hide All' : 'Show All'}
        </button>
      </div>

      {showTable &&
        (loading && !marginData ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" />
            ))}
          </div>
        ) : marginData && marginData.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-10 text-center text-sm text-slate-400">
            No margin data available.
          </div>
        ) : marginData ? (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3">
                      <button
                        onClick={() => handleSort('symbol')}
                        className="flex items-center gap-1.5 font-semibold transition hover:text-white"
                      >
                        Symbol
                        <SortIcon dir={sortKey === 'symbol' ? sortDir : null} />
                      </button>
                    </th>
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 font-semibold">Token</th>
                    <th className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleSort('requiredMargin')}
                        className="ml-auto flex items-center gap-1.5 font-semibold transition hover:text-white"
                      >
                        Required Margin
                        <SortIcon dir={sortKey === 'requiredMargin' ? sortDir : null} />
                      </button>
                    </th>
                    <th className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleSort('rupeezyMargin')}
                        className="ml-auto flex items-center gap-1.5 font-semibold transition hover:text-white"
                      >
                        Rupeezy Margin
                        <SortIcon dir={sortKey === 'rupeezyMargin' ? sortDir : null} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((item, i) => (
                    <tr
                      key={item.token || item.symbol || i}
                      className={`border-b border-slate-800/60 transition hover:bg-slate-800/40 ${
                        i % 2 === 1 ? 'bg-slate-950/30' : ''
                      }`}
                    >
                      <td className="px-5 py-3 font-mono font-semibold text-indigo-300">{item.symbol || '—'}</td>
                      <td className="px-5 py-3 text-slate-300">{item.name || '—'}</td>
                      <td className="px-5 py-3 font-mono text-slate-400">{item.token || '—'}</td>
                      <td className="px-5 py-3 text-right font-mono text-slate-200">{formatMargin(item.requiredMargin)}</td>
                      <td className="px-5 py-3 text-right font-mono text-emerald-300">{formatMargin(item.rupeezyMargin)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null)}
    </div>
  );
}
