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

function StatCard({ title, icon, children, badge }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {icon}
          </div>
          <h3 className="font-semibold text-slate-200 text-sm tracking-wide">{title}</h3>
        </div>
        {badge && (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}>
            {badge.text}
          </span>
        )}
      </div>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  );
}

function ProgressBar({ label, valuePercent, detail, color = 'from-indigo-500 to-purple-500' }) {
  const safePercent = Math.min(100, Math.max(0, valuePercent || 0));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className="text-slate-200 font-semibold">{detail || `${safePercent.toFixed(1)}%`}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${safePercent}%` }}
        />
      </div>
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 p-6 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">Server Monitoring</h1>
              <span className="flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
                System Stats
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Real-time server metrics, memory, CPU, threads, and internal domain performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadStats()}
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
          <p className="font-semibold">Error fetching server stats:</p>
          <p className="mt-1 font-mono">{error}</p>
        </div>
      )}

      {loading && !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50 p-5" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Top Quick Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* CPU Card */}
            <StatCard
              title="CPU & Processing"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              }
              badge={{
                text: `${stats.cpu?.availableProcessors || 0} Cores`,
                color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
              }}
            >
              <ProgressBar
                label="Process CPU"
                valuePercent={stats.cpu?.processCpuPercent}
                detail={`${(stats.cpu?.processCpuPercent || 0).toFixed(1)}%`}
                color="from-sky-500 to-indigo-500"
              />
              <ProgressBar
                label="System CPU"
                valuePercent={stats.cpu?.systemCpuPercent}
                detail={`${(stats.cpu?.systemCpuPercent || 0).toFixed(1)}%`}
                color="from-indigo-500 to-purple-500"
              />
              <MetricRow label="System Load Avg" value={stats.cpu?.systemLoadAverage ?? 'N/A'} />
            </StatCard>

            {/* Memory Card */}
            <StatCard
              title="Memory Usage"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
              badge={{
                text: `${stats.memory?.heapUsedMb || 0} / ${stats.memory?.heapMaxMb || 0} MB`,
                color: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
              }}
            >
              <ProgressBar
                label="Heap Used"
                valuePercent={stats.memory?.heapUsedPercent}
                detail={`${(stats.memory?.heapUsedPercent || 0).toFixed(1)}%`}
                color="from-cyan-500 to-blue-500"
              />
              <MetricRow label="Heap Committed" value={`${stats.memory?.heapCommittedMb || 0} MB`} />
              <MetricRow label="Non-Heap Used" value={`${stats.memory?.nonHeapUsedMb || 0} MB`} />
              <MetricRow label="Non-Heap Committed" value={`${stats.memory?.nonHeapCommittedMb || 0} MB`} />
            </StatCard>

            {/* Threads Card */}
            <StatCard
              title="JVM Threads"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              badge={{
                text: `${stats.threads?.live || 0} Live`,
                color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
              }}
            >
              <MetricRow label="Live Threads" value={stats.threads?.live} />
              <MetricRow label="Daemon Threads" value={stats.threads?.daemon} />
              <MetricRow label="Peak Threads" value={stats.threads?.peak} />
              <MetricRow label="Total Started" value={stats.threads?.totalStarted} />
            </StatCard>

            {/* Runtime & Descriptors */}
            <StatCard
              title="Runtime & System"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              badge={{
                text: formatUptime(stats.runtime?.uptimeMs),
                color: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
              }}
            >
              <MetricRow label="Uptime" value={formatUptime(stats.runtime?.uptimeMs)} />
              <MetricRow
                label="File Descriptors"
                value={`${stats.fileDescriptors?.open || 0} / ${stats.fileDescriptors?.max || 0}`}
              />
              <MetricRow
                label="Started At"
                value={
                  stats.runtime?.startTimeEpochMs
                    ? new Date(stats.runtime.startTimeEpochMs).toLocaleTimeString()
                    : 'N/A'
                }
              />
            </StatCard>
          </div>

          {/* Domain Specific Metrics */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Domain Pipeline & Watchdog Metrics
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {/* WebSocket Status */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">WebSocket</h4>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      stats.domain?.webSocket?.connected
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        stats.domain?.webSocket?.connected ? 'bg-emerald-400' : 'bg-red-400'
                      }`}
                    />
                    {stats.domain?.webSocket?.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <MetricRow label="Reconnect Attempts" value={stats.domain?.webSocket?.reconnectAttempts ?? 0} />
              </div>

              {/* Pipeline Stats */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline Engine</h4>
                <MetricRow label="Ring Buffer Size" value={stats.domain?.pipeline?.ringBufferSize ?? 0} />
                <MetricRow label="Shard Count" value={stats.domain?.pipeline?.shardCount ?? 0} />
                <MetricRow label="Used Slots" value={stats.domain?.pipeline?.ringUsedSlots ?? 0} />
                <MetricRow label="Remaining Capacity" value={stats.domain?.pipeline?.ringRemainingCapacity ?? 0} />
              </div>

              {/* Watchdog Stats */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Watchdog Service</h4>
                <MetricRow label="Watched Tokens" value={stats.domain?.watchdog?.watchedTokens ?? 0} />
                <MetricRow label="Watched Trades" value={stats.domain?.watchdog?.watchedTrades ?? 0} />
                <MetricRow label="MTF Watched Tokens" value={stats.domain?.watchdog?.mtfWatchedTokens ?? 0} />
                <MetricRow label="MTF Watched Trades" value={stats.domain?.watchdog?.mtfWatchedTrades ?? 0} />
                <MetricRow label="In-Flight Triggers" value={stats.domain?.watchdog?.inFlightTriggers ?? 0} />
                <MetricRow label="In-Flight MTF Triggers" value={stats.domain?.watchdog?.inFlightMtfTriggers ?? 0} />
              </div>
            </div>
          </div>

          {/* Memory Pools & GC details */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Memory Pools */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <h3 className="text-md font-bold text-slate-100 mb-4 flex items-center justify-between">
                <span>Memory Pools</span>
                <span className="text-xs text-slate-500 font-normal">{stats.memoryPools?.length || 0} Pools</span>
              </h3>
              <div className="space-y-3">
                {stats.memoryPools?.map((pool) => {
                  const percent = pool.maxMb > 0 ? (pool.usedMb / pool.maxMb) * 100 : 0;
                  return (
                    <div key={pool.name} className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-300">{pool.name}</span>
                        <span className="font-mono text-slate-400">
                          {pool.usedMb} / {pool.maxMb > 0 ? `${pool.maxMb} MB` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Committed: {pool.committedMb} MB</span>
                      </div>
                      {pool.maxMb > 0 && (
                        <ProgressBar
                          label=""
                          valuePercent={percent}
                          detail=""
                          color={percent > 85 ? 'from-amber-500 to-red-500' : 'from-indigo-500 to-cyan-500'}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* GC & Buffer Pools */}
            <div className="space-y-6">
              {/* Garbage Collectors */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
                <h3 className="text-md font-bold text-slate-100 mb-4">Garbage Collectors</h3>
                <div className="space-y-3">
                  {stats.gc?.map((gcItem) => (
                    <div key={gcItem.name} className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-300">{gcItem.name}</p>
                        <p className="text-[11px] text-slate-500">Total Collections: {gcItem.collectionCount}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-semibold text-indigo-300">
                          {gcItem.collectionTimeMs} ms
                        </span>
                        <span className="block text-[10px] text-slate-500">Pause Time</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buffer Pools */}
              {stats.bufferPools && stats.bufferPools.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
                  <h3 className="text-md font-bold text-slate-100 mb-4">Buffer Pools</h3>
                  <div className="space-y-3">
                    {stats.bufferPools.map((buf) => (
                      <div key={buf.name} className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-300">{buf.name}</p>
                          <p className="text-[11px] text-slate-500">Count: {buf.count}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-semibold text-cyan-300">
                            {buf.memoryUsedMb} / {buf.totalCapacityMb} MB
                          </span>
                          <span className="block text-[10px] text-slate-500">Used / Total Capacity</span>
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
