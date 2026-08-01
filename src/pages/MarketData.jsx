import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import { fetchMarginData, fetchMarketBarSeries } from '../api/service';

function formatMargin(value) {
  if (value === null || value === undefined || value === '') return '—';
  return Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function CandlestickChart({ data }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

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
      rightPriceScale: { borderColor: 'rgba(51, 65, 85, 0.6)' },
      timeScale: { borderColor: 'rgba(51, 65, 85, 0.6)' },
      width: containerRef.current.clientWidth,
      height: 420,
    });

    const series = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      seriesRef.current.setData(data);
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  return <div ref={containerRef} className="w-full" />;
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
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            disabled={!marginData || marginData.length === 0}
            className="w-full sm:w-72 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          >
            <option value="">Select a symbol</option>
            {marginData?.map((item) => (
              <option key={item.token || item.symbol} value={item.symbol}>
                {item.symbol}
                {item.name ? ` — ${item.name}` : ''}
              </option>
            ))}
          </select>

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

        {barError && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
            <p className="font-semibold">Error fetching bar series:</p>
            <p className="mt-1 font-mono">{barError}</p>
          </div>
        )}

        <div className="mt-4">
          {barLoading ? (
            <div className="h-[420px] animate-pulse rounded-xl border border-slate-800 bg-slate-950/40" />
          ) : searchedSymbol && barSeriesData && barSeriesData.length > 0 ? (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                  {searchedSymbol}
                </span>
                <span className="text-[11px] text-slate-500">
                  {barSeriesData.length} candles
                </span>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <CandlestickChart data={barSeriesData} />
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

      {loading && !marginData ? (
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
                  <th className="px-5 py-3 font-semibold">Symbol</th>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Token</th>
                  <th className="px-5 py-3 text-right font-semibold">Required Margin</th>
                  <th className="px-5 py-3 text-right font-semibold">Rupeezy Margin</th>
                </tr>
              </thead>
              <tbody>
                {marginData.map((item, i) => (
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
      ) : null}
    </div>
  );
}
