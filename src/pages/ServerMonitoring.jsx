import { useEffect, useState, useCallback } from 'react';
import { fetchServerStats } from '../api/service';

function formatUptime(uptimeMs) {
  if (!uptimeMs) return '0s';
  const seconds = Math.floor(uptimeMs / 1000) % 60;
  const minutes = Math.floor(uptimeMs / (1000 * 60)) % 60;
  const hours = Math.floor(uptimeMs / (1000 * 60 * 60)) % 24;
  const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(' ');
}

// SVG Arc path helper for Donut / Pie Charts
function getArcPath(cx, cy, r, startAngle, endAngle) {
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);

  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
}

// Circular Radial Gauge Component
function CircularGauge({ percent = 0, label, subtext, strokeColor = '#3b82f6', valueText }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.min(100, Math.max(0, percent || 0));
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700">
      <div className="relative flex items-center justify-center">
        <svg className="h-28 w-28 -rotate-90 transform" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r={radius} className="stroke-slate-800" strokeWidth="8" fill="transparent" />
          <circle
            cx="45"
            cy="45"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-lg font-extrabold text-slate-100 font-mono">
            {valueText || `${safePercent.toFixed(1)}%`}
          </span>
          {valueText && <span className="text-[10px] text-slate-400 font-mono">{safePercent.toFixed(1)}%</span>}
        </div>
      </div>
      <p className="mt-3 font-semibold text-slate-200 text-sm">{label}</p>
      {subtext && <p className="text-xs text-slate-400 mt-0.5 text-center">{subtext}</p>}
    </div>
  );
}

// Donut / Pie Chart Component
function DonutChart({ items, centerLabel, centerValue, compact = false }) {
  const total = items.reduce((acc, item) => acc + (item.value || 0), 0);
  let cumulativeAngle = 0;

  const slices = items.map((item) => {
    const value = item.value || 0;
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const angle = total > 0 ? (value / total) * 360 : 0;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle: Math.min(endAngle, startAngle + 359.99),
    };
  });

  return (
    <div className={`flex ${compact ? 'flex-col items-center gap-4' : 'flex-col sm:flex-row items-center gap-6'}`}>
      <div className="relative flex items-center justify-center shrink-0">
        <svg className={compact ? 'h-36 w-36' : 'h-44 w-44'} viewBox="0 0 100 100">
          {total === 0 ? (
            <circle cx="50" cy="50" r="36" stroke="#334155" strokeWidth="12" fill="transparent" />
          ) : (
            slices.map((slice, i) => (
              <path
                key={i}
                d={getArcPath(50, 50, 36, slice.startAngle, slice.endAngle)}
                fill="none"
                stroke={slice.color}
                strokeWidth="12"
                className="transition-all duration-300 hover:opacity-85 cursor-pointer"
              />
            ))
          )}
        </svg>
        <div className="absolute flex flex-col items-center text-center px-2">
          <span className="text-sm font-bold text-slate-100 font-mono truncate max-w-[110px]">{centerValue}</span>
          <span className="text-[10px] text-slate-400">{centerLabel}</span>
        </div>
      </div>

      <div className="w-full space-y-2 flex-1 min-w-0">
        {slices.map((slice, i) => (
          <div key={i} className="flex flex-wrap items-center justify-between text-xs rounded-lg p-2 bg-slate-950/40 border border-slate-800/60 hover:bg-slate-800/40 transition gap-x-2 gap-y-1">
            <div className="flex items-center gap-2 min-w-0 shrink">
              <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: slice.color }} />
              <span className="text-slate-300 font-medium truncate">{slice.label}</span>
            </div>
            <div className="text-right font-mono shrink-0 ml-auto">
              <span className="text-slate-200 font-semibold">{slice.displayValue || `${slice.value} MB`}</span>
              <span className="text-slate-500 text-[10px] ml-1">({slice.percentage.toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Memory Pool Horizontal Bar Chart Component
function PoolBarChart({ pools }) {
  if (!pools || pools.length === 0) return <p className="text-xs text-slate-500">No memory pools available</p>;

  return (
    <div className="space-y-4">
      {pools.map((pool) => {
        const max = pool.maxMb > 0 ? pool.maxMb : Math.max(pool.committedMb, pool.usedMb, 1);
        const usedPercent = Math.min(100, (pool.usedMb / max) * 100);
        const committedPercent = Math.min(100, (pool.committedMb / max) * 100);

        return (
          <div key={pool.name} className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5 transition hover:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-200">{pool.name}</span>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-blue-400 font-medium">Used: {pool.usedMb} MB</span>
                <span className="text-blue-400 font-medium">Committed: {pool.committedMb} MB</span>
                <span className="text-slate-400">Max: {pool.maxMb > 0 ? `${pool.maxMb} MB` : 'N/A'}</span>
              </div>
            </div>

            <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-800/90">
              {/* Committed Bar background */}
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-blue-500/40 border-r-2 border-blue-400 transition-all duration-500"
                style={{ width: `${committedPercent}%` }}
                title={`Committed: ${pool.committedMb} MB (${committedPercent.toFixed(1)}%)`}
              />
              {/* Used Bar foreground */}
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${usedPercent}%` }}
                title={`Used: ${pool.usedMb} MB (${usedPercent.toFixed(1)}%)`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Garbage Collector Bar Visualization Component
function GcBarChart({ gcItems }) {
  if (!gcItems || gcItems.length === 0) return null;
  const maxPause = Math.max(...gcItems.map((g) => g.collectionTimeMs || 0), 1);

  return (
    <div className="space-y-3">
      {gcItems.map((gc) => {
        const percent = Math.min(100, ((gc.collectionTimeMs || 0) / maxPause) * 100);

        return (
          <div key={gc.name} className="space-y-1.5 rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-200">{gc.name}</span>
                <span className="ml-2 text-[11px] text-slate-400">Collections: {gc.collectionCount}</span>
              </div>
              <span className="font-mono text-xs font-semibold text-blue-300">
                {gc.collectionTimeMs} ms
              </span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetricRow({ label, value, hint }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 last:border-b-0 last:pb-0">
      <div>
        <span className="text-xs text-slate-400 block">{label}</span>
        {hint && <span className="text-[10px] text-slate-500">{hint}</span>}
      </div>
      <span className="text-sm font-semibold text-slate-200 font-mono">{value ?? '—'}</span>
    </div>
  );
}

export default function ServerMonitoring() {
  /** @type {[import('../api/types').ServerStats | null, Function]} */
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchServerStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch server statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Donut chart items calculation
  const memoryDonutItems = stats
    ? [
        {
          label: 'Heap Used',
          value: stats.memory?.heapUsedMb || 0,
          color: '#06b6d4', // cyan-500
          displayValue: `${stats.memory?.heapUsedMb || 0} MB`,
        },
        {
          label: 'Heap Free (Committed)',
          value: Math.max(0, (stats.memory?.heapCommittedMb || 0) - (stats.memory?.heapUsedMb || 0)),
          color: '#3b82f6', // blue-500
          displayValue: `${Math.max(0, (stats.memory?.heapCommittedMb || 0) - (stats.memory?.heapUsedMb || 0))} MB`,
        },
        {
          label: 'Non-Heap Used',
          value: stats.memory?.nonHeapUsedMb || 0,
          color: '#8b5cf6', // purple-500
          displayValue: `${stats.memory?.nonHeapUsedMb || 0} MB`,
        },
        {
          label: 'Non-Heap Free (Committed)',
          value: Math.max(0, (stats.memory?.nonHeapCommittedMb || 0) - (stats.memory?.nonHeapUsedMb || 0)),
          color: '#ec4899', // pink-500
          displayValue: `${Math.max(0, (stats.memory?.nonHeapCommittedMb || 0) - (stats.memory?.nonHeapUsedMb || 0))} MB`,
        },
      ]
    : [];

  const threadsDonutItems = stats
    ? [
        {
          label: 'Non-Daemon',
          value: Math.max(0, (stats.threads?.live || 0) - (stats.threads?.daemon || 0)),
          color: '#10b981', // emerald-500
          displayValue: `${Math.max(0, (stats.threads?.live || 0) - (stats.threads?.daemon || 0))}`,
        },
        {
          label: 'Daemon',
          value: stats.threads?.daemon || 0,
          color: '#f59e0b', // amber-500
          displayValue: `${stats.threads?.daemon || 0}`,
        },
      ]
    : [];

  const pipelineUsedSlots = stats?.domain?.pipeline?.ringUsedSlots || 0;
  const pipelineBufferSize = stats?.domain?.pipeline?.ringBufferSize || 1;
  const pipelinePercent = (pipelineUsedSlots / pipelineBufferSize) * 100;

  const fdOpen = stats?.fileDescriptors?.open || 0;
  const fdMax = stats?.fileDescriptors?.max || 1;
  const fdPercent = fdMax > 0 ? (fdOpen / fdMax) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white tracking-tight">Server Monitoring</h1>
            <span className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
              System Health
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Interactive system metrics, memory allocation charts, CPU load, and domain engine performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadStats()}
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

        {lastUpdated && (
          <p className="mt-3 text-[11px] text-slate-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
          <p className="font-semibold">Error fetching server stats:</p>
          <p className="mt-1 font-mono">{error}</p>
        </div>
      )}

      {loading && !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50 p-5" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Radial Gauges Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CircularGauge
              percent={stats.memory?.heapUsedPercent}
              label="Heap Memory"
              subtext={`${stats.memory?.heapUsedMb || 0} / ${stats.memory?.heapMaxMb || 0} MB`}
              strokeColor="#06b6d4"
            />
            <CircularGauge
              percent={stats.cpu?.processCpuPercent}
              label="Process CPU Load"
              subtext={`${stats.cpu?.availableProcessors || 0} CPU Cores | Sys: ${(stats.cpu?.systemCpuPercent || 0).toFixed(1)}%`}
              strokeColor="#6366f1"
            />
            <CircularGauge
              percent={fdPercent}
              label="File Descriptors"
              subtext={`${fdOpen} / ${fdMax} Open`}
              strokeColor="#a855f7"
              valueText={`${fdOpen}`}
            />
            <CircularGauge
              percent={pipelinePercent}
              label="Pipeline Capacity"
              subtext={`${pipelineUsedSlots} / ${pipelineBufferSize} Used Slots`}
              strokeColor="#10b981"
            />
          </div>

          {/* Core Visual Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Memory Allocation Donut Chart */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  Memory Allocation Breakdown
                </h3>
                <span className="text-xs text-slate-500">Heap & Non-Heap</span>
              </div>
              <DonutChart
                items={memoryDonutItems}
                centerLabel="Total Memory"
                centerValue={`${(stats.memory?.heapCommittedMb || 0) + (stats.memory?.nonHeapCommittedMb || 0)} MB`}
              />
            </div>

            {/* Memory Pools Bar Chart */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  JVM Memory Pools Comparison
                </h3>
                <span className="text-xs text-slate-500">{stats.memoryPools?.length || 0} Active Pools</span>
              </div>
              <PoolBarChart pools={stats.memoryPools} />
            </div>
          </div>

          {/* Engine & Domain Metrics Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Domain Engine Health & Services
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {/* WebSocket Status Card */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">WebSocket Status</h4>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      stats.domain?.webSocket?.connected
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        stats.domain?.webSocket?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                      }`}
                    />
                    {stats.domain?.webSocket?.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <MetricRow label="Reconnect Attempts" value={stats.domain?.webSocket?.reconnectAttempts ?? 0} />
              </div>

              {/* Pipeline Engine Card */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-5 space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pipeline Engine</h4>
                <MetricRow label="Ring Buffer Size" value={stats.domain?.pipeline?.ringBufferSize ?? 0} />
                <MetricRow label="Shard Count" value={stats.domain?.pipeline?.shardCount ?? 0} />
                <MetricRow label="Used Slots" value={stats.domain?.pipeline?.ringUsedSlots ?? 0} />
                <MetricRow label="Remaining Capacity" value={stats.domain?.pipeline?.ringRemainingCapacity ?? 0} />
              </div>

              {/* Watchdog Service Card */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-5 space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Watchdog Service</h4>
                <MetricRow label="Watched Tokens" value={stats.domain?.watchdog?.watchedTokens ?? 0} />
                <MetricRow label="Watched Trades" value={stats.domain?.watchdog?.watchedTrades ?? 0} />
                <MetricRow label="MTF Watched Tokens" value={stats.domain?.watchdog?.mtfWatchedTokens ?? 0} />
                <MetricRow label="MTF Watched Trades" value={stats.domain?.watchdog?.mtfWatchedTrades ?? 0} />
                <MetricRow label="In-Flight Triggers" value={stats.domain?.watchdog?.inFlightTriggers ?? 0} />
                <MetricRow label="In-Flight MTF Triggers" value={stats.domain?.watchdog?.inFlightMtfTriggers ?? 0} />
              </div>
            </div>
          </div>

          {/* JVM Details Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Threads Donut Chart */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <h3 className="text-md font-bold text-slate-100 mb-4 flex items-center justify-between">
                <span>JVM Threads</span>
                <span className="text-xs text-slate-400 font-mono">{stats.threads?.live || 0} Live</span>
              </h3>
              <DonutChart
                items={threadsDonutItems}
                centerLabel="Peak Threads"
                centerValue={`${stats.threads?.peak || 0}`}
                compact={true}
              />
              <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-2">
                <MetricRow label="Peak Threads" value={stats.threads?.peak} />
                <MetricRow label="Total Started" value={stats.threads?.totalStarted} />
              </div>
            </div>

            {/* Garbage Collectors Bar Chart */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <h3 className="text-md font-bold text-slate-100 mb-4">Garbage Collectors</h3>
              <GcBarChart gcItems={stats.gc} />
            </div>

            {/* Buffer Pools & Runtime */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-5">
              <div>
                <h3 className="text-md font-bold text-slate-100 mb-3">System Runtime</h3>
                <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5">
                  <MetricRow label="System Uptime" value={formatUptime(stats.runtime?.uptimeMs)} />
                  <MetricRow
                    label="Started At"
                    value={
                      stats.runtime?.startTimeEpochMs
                        ? new Date(stats.runtime.startTimeEpochMs).toLocaleTimeString()
                        : 'N/A'
                    }
                  />
                  <MetricRow label="System Load Avg" value={stats.cpu?.systemLoadAverage ?? 'N/A'} />
                </div>
              </div>

              {stats.bufferPools && stats.bufferPools.length > 0 && (
                <div>
                  <h3 className="text-md font-bold text-slate-100 mb-3">Buffer Pools</h3>
                  <div className="space-y-2.5">
                    {stats.bufferPools.map((buf) => (
                      <div key={buf.name} className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{buf.name}</p>
                          <p className="text-[11px] text-slate-500">Count: {buf.count}</p>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-xs font-semibold text-blue-300">
                            {buf.memoryUsedMb} / {buf.totalCapacityMb} MB
                          </span>
                          <span className="block text-[10px] text-slate-500">Used / Capacity</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
