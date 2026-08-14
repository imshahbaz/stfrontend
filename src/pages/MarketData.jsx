import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createChart, ColorType, CrosshairMode, CandlestickSeries } from 'lightweight-charts';
import { fetchMarginData, fetchMarketBarSeries, fetchKronosPredictions, warmupStrategyTrading } from '../api/service';

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

const MONTH_TO_INDEX = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseCandleDateToIso(dateStr) {
  const parts = String(dateStr).split('-');
  if (parts.length !== 3 || !(parts[1] in MONTH_TO_INDEX)) return null;
  const day = Number(parts[0]);
  const month = MONTH_TO_INDEX[parts[1]];
  const year = Number(parts[2]);
  if (!Number.isFinite(day) || !Number.isFinite(year)) return null;
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildPredictionChartData(apiData) {
  const historical = (apiData.historicalData || [])
    .map((d) => {
      const time = parseCandleDateToIso(d.mtimestamp);
      if (!time) return null;
      return {
        time,
        open: Number(d.chOpeningPrice),
        high: Number(d.chTradeHighPrice),
        low: Number(d.chTradeLowPrice),
        close: Number(d.chClosingPrice),
        predicted: false,
      };
    })
    .filter(Boolean);

  const predictions = (apiData.predictions || [])
    .map((d) => {
      const time = parseCandleDateToIso(d.mtimestamp);
      if (!time) return null;
      return {
        time,
        open: Number(d.chOpeningPrice),
        high: Number(d.chTradeHighPrice),
        low: Number(d.chTradeLowPrice),
        close: Number(d.chClosingPrice),
        predicted: true,
      };
    })
    .filter(Boolean);

  const historicalDates = new Set(historical.map((c) => c.time));
  const lastHistoricalDate = historical.reduce((max, c) => (max && c.time <= max ? max : c.time), null);

  const merged = [...historical];

  predictions.forEach((c) => {
    if (historicalDates.has(c.time)) return;
    if (lastHistoricalDate && c.time <= lastHistoricalDate) return;
    merged.push(c);
  });

  return merged.sort((a, b) => a.time.localeCompare(b.time));
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

function CandlestickChart({ data, predictions = [], timeframe }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const predictionSeriesRef = useRef(null);
  const [hoveredData, setHoveredData] = useState(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const predictionsRef = useRef(predictions);
  predictionsRef.current = predictions;

  const predictedTimes = useMemo(() => {
    const times = new Set();
    predictions.forEach((p) => times.add(p.time));
    return times;
  }, [predictions]);

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

    const predictionSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#a78bfa',
      downColor: '#f472b6',
      borderVisible: true,
      borderUpColor: '#a78bfa',
      borderDownColor: '#f472b6',
      wickUpColor: '#a78bfa',
      wickDownColor: '#f472b6',
    });

    chartRef.current = chart;
    seriesRef.current = series;
    predictionSeriesRef.current = predictionSeries;

    if (dataRef.current && dataRef.current.length > 0) {
      series.setData(dataRef.current);
      chart.timeScale().fitContent();
    }

    const handleCrosshairMove = (param) => {
      if (!param || !param.time || !param.seriesData || param.point === undefined || param.point.x < 0 || param.point.y < 0) {
        setHoveredData(null);
        return;
      }
      const candle = param.seriesData.get(series) || param.seriesData.get(predictionSeries);
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
      predictionSeriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.timeScale().applyOptions({
        timeVisible: timeframe === '15min',
      });
    }
    if (seriesRef.current && data && data.length > 0) {
      seriesRef.current.setData(data);
    }
    if (predictionSeriesRef.current) {
      const preds = predictionsRef.current;
      predictionSeriesRef.current.setData(preds && preds.length > 0 ? preds : []);
    }
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data, predictions, timeframe]);

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
          {predictedTimes.has(displayCandle.time) && (
            <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
              Predicted
            </span>
          )}
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
  const [tableFilterQuery, setTableFilterQuery] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(10);

  const [predictionMode, setPredictionMode] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);
  const [predictionChartData, setPredictionChartData] = useState(null);
  const [predictionSymbol, setPredictionSymbol] = useState(null);


  const [warming, setWarming] = useState(false);
  const [warmupNotice, setWarmupNotice] = useState(null);
  const isWarmingRef = useRef(false);

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

  const historicalCandles = useMemo(
    () => (predictionChartData ? predictionChartData.filter((c) => !c.predicted) : []),
    [predictionChartData]
  );
  const predictedCandles = useMemo(
    () => (predictionChartData ? predictionChartData.filter((c) => c.predicted) : []),
    [predictionChartData]
  );

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

  const handleWarmup = async () => {
    if (isWarmingRef.current || warming) return;
    isWarmingRef.current = true;
    setWarming(true);
    setWarmupNotice(null);
    try {
      await warmupStrategyTrading();
      setWarmupNotice({ type: 'success', message: 'Strategy trading warmup executed successfully!' });
      setTimeout(() => setWarmupNotice(null), 5000);
    } catch (err) {
      setWarmupNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to execute strategy trading warmup',
      });
    } finally {
      setWarming(false);
      isWarmingRef.current = false;
    }
  };

  const sortedOptions = useMemo(() => {
    if (!marginData) return [];
    return [...marginData].sort((a, b) => (a.symbol || '').localeCompare(b.symbol || ''));
  }, [marginData]);

  const resetPredictions = () => {
    setPredictionMode(false);
    setPredictionError(null);
    setPredictionChartData(null);
    setPredictionSymbol(null);
  };

  const handleViewPredictions = async () => {
    if (!selectedSymbol) return;
    if (predictionMode && predictionSymbol === selectedSymbol) {
      setPredictionMode(false);
      return;
    }
    setPredictionLoading(true);
    setPredictionError(null);
    setPredictionMode(true);
    try {
      const data = await fetchKronosPredictions(selectedSymbol);
      setPredictionChartData(buildPredictionChartData(data));
      setPredictionSymbol(selectedSymbol);
    } catch (err) {
      setPredictionChartData(null);
      if (err?.response?.status === 404) {
        setPredictionError(`No AI predictions found for symbol "${selectedSymbol}".`);
      } else {
        setPredictionError(err instanceof Error ? err.message : 'Failed to fetch AI predictions');
      }
    } finally {
      setPredictionLoading(false);
    }
  };

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
    setSearchedSymbol(null);
    setBarSeriesData(null);
    setBarError(null);
    setTimeframe('15min');
    resetPredictions();
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    setSelectedSymbol('');
    setDropdownOpen(true);
    setSearchedSymbol(null);
    setBarSeriesData(null);
    setBarError(null);
    setTimeframe('15min');
    resetPredictions();
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setTablePage(1);
  };

  const filteredAndSortedRows = useMemo(() => {
    if (!marginData) return [];
    let rows = [...marginData];
    if (tableFilterQuery.trim()) {
      const q = tableFilterQuery.trim().toLowerCase();
      rows = rows.filter(
        (item) =>
          (item.symbol || '').toLowerCase().includes(q) ||
          (item.name || '').toLowerCase().includes(q) ||
          (item.token || '').toLowerCase().includes(q)
      );
    }
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
  }, [marginData, tableFilterQuery, sortKey, sortDir]);

  const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
  const totalTableItems = filteredAndSortedRows.length;
  const totalTablePages = Math.ceil(totalTableItems / tablePageSize) || 1;
  const tableStartIndex = (tablePage - 1) * tablePageSize;
  const tableEndIndex = Math.min(tableStartIndex + tablePageSize, totalTableItems);

  const paginatedRows = useMemo(() => {
    return filteredAndSortedRows.slice(tableStartIndex, tableEndIndex);
  }, [filteredAndSortedRows, tableStartIndex, tableEndIndex]);


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
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white tracking-tight">Market Data</h1>
            <span className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
              Margin Snapshot
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Required margin and rupeezy margin for all market symbols, plus candlestick charts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleWarmup}
            disabled={warming}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
            title="Manually trigger strategy trading warmup"
          >
            <svg
              className={`h-3.5 w-3.5 ${warming ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            {warming ? 'Warming Up...' : 'Warmup'}
          </button>

          <button
            onClick={() => loadMarginData()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
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

      {warmupNotice && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-4 text-xs ${
            warmupNotice.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={
                warmupNotice.type === 'success'
                  ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              }
            />
          </svg>
          {warmupNotice.message}
        </div>
      )}

        {lastUpdated && (
          <p className="mt-3 text-[11px] text-slate-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}

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
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-8 text-sm text-slate-200 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:opacity-50"
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
                        item.symbol === selectedSymbol ? 'bg-blue-600/15 text-blue-400' : 'text-slate-200'
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
            className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
            {barLoading ? 'Loading...' : 'Search'}
          </button>

          <button
            onClick={handleViewPredictions}
            disabled={!selectedSymbol || predictionLoading}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm transition disabled:opacity-50 ${
              predictionMode && predictionSymbol === selectedSymbol
                ? 'bg-violet-700 hover:bg-violet-600'
                : 'bg-violet-600 hover:bg-violet-500'
            }`}
            title="Fetch and overlay AI predicted candles"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3L12 3z" />
            </svg>
            {predictionLoading
              ? 'Loading...'
              : predictionMode && predictionSymbol === selectedSymbol
                ? 'Hide AI Predictions'
                : 'View AI Predictions'}
          </button>
        </div>

        {selectedItem && (
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-700/60 bg-slate-950/50 p-4 sm:grid-cols-5">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Symbol</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-blue-400">{selectedItem.symbol || '—'}</p>
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
          {predictionLoading ? (
            <div className="h-[420px] animate-pulse rounded-xl border border-slate-800 bg-slate-950/40" />
          ) : predictionMode && predictionError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
              <p className="font-semibold">Error fetching AI predictions:</p>
              <p className="mt-1 font-mono">{predictionError}</p>
            </div>
          ) : predictionMode && predictionChartData && predictionChartData.length > 0 ? (
            <>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400">
                    {predictionSymbol}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {historicalCandles.length} historical + {predictedCandles.length} predicted daily candles
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-medium text-violet-300">
                    <span className="inline-block h-2 w-2 rounded-sm bg-violet-400" />
                    Predicted
                  </span>
                </div>
                <button
                  onClick={() => setPredictionMode(false)}
                  className="text-xs text-slate-400 transition hover:text-slate-200"
                >
                  Back to bar series
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <CandlestickChart data={historicalCandles} predictions={predictedCandles} timeframe="daily" />
              </div>
            </>
          ) : barLoading ? (
            <div className="h-[420px] animate-pulse rounded-xl border border-slate-800 bg-slate-950/40" />
          ) : searchedSymbol && activeChartData && activeChartData.length > 0 ? (
            <>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
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
                        ? 'bg-blue-600 text-white'
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
                        ? 'bg-blue-600 text-white'
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl">
        <div>
          <p className="text-sm font-semibold text-slate-200">All Margin Data</p>
          <p className="text-xs text-slate-500">
            {marginData ? `${marginData.length} total symbols` : '—'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {showTable && marginData && marginData.length > 0 && (
            <div className="relative">
              <input
                type="text"
                placeholder="Filter margin data..."
                value={tableFilterQuery}
                onChange={(e) => {
                  setTableFilterQuery(e.target.value);
                  setTablePage(1);
                }}
                className="w-full sm:w-56 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <svg
                className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}
          <button
            onClick={() => setShowTable((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {showTable ? 'Hide All' : 'Show All'}
          </button>
        </div>
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
            {filteredAndSortedRows.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-400">
                No margin symbols match your filter "{tableFilterQuery}".
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
                        <th className="px-4 py-3 w-12 text-center">#</th>
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
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                      {paginatedRows.map((item, i) => (
                        <tr
                          key={item.token || item.symbol || i}
                          className={`transition hover:bg-slate-800/40 ${
                            i % 2 === 1 ? 'bg-slate-950/30' : ''
                          }`}
                        >
                          <td className="px-4 py-3 text-center text-xs font-mono text-slate-500">
                            {tableStartIndex + i + 1}
                          </td>
                          <td className="px-5 py-3 font-mono font-semibold text-blue-400">{item.symbol || '—'}</td>
                          <td className="px-5 py-3 text-slate-300">{item.name || '—'}</td>
                          <td className="px-5 py-3 font-mono text-slate-400">{item.token || '—'}</td>
                          <td className="px-5 py-3 text-right font-mono text-slate-200">{formatMargin(item.requiredMargin)}</td>
                          <td className="px-5 py-3 text-right font-mono text-emerald-300">{formatMargin(item.rupeezyMargin)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 px-5 py-4 bg-slate-950/40 text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>
                      Showing <span className="font-semibold text-white">{tableStartIndex + 1}</span> to{' '}
                      <span className="font-semibold text-white">{tableEndIndex}</span> of{' '}
                      <span className="font-semibold text-white">{totalTableItems}</span> symbols
                    </span>

                    <div className="flex items-center gap-1.5 ml-2 border-l border-slate-800 pl-3">
                      <span>Per page:</span>
                      <select
                        value={tablePageSize}
                        onChange={(e) => {
                          setTablePageSize(Number(e.target.value));
                          setTablePage(1);
                        }}
                        className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
                      >
                        {PAGE_SIZE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTablePage((prev) => Math.max(prev - 1, 1))}
                      disabled={tablePage === 1}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>

                    <div className="flex items-center gap-1 px-2 font-mono text-slate-300">
                      <span className="font-semibold text-white">{tablePage}</span> / <span>{totalTablePages}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTablePage((prev) => Math.min(prev + 1, totalTablePages))}
                      disabled={tablePage >= totalTablePages}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Next
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null)}
    </div>
  );
}

