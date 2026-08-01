import { useEffect, useState, useMemo } from 'react';
import {
  fetchClientConfig,
  fetchBackendConfig,
  reloadConfig,
} from '../api/service';

function ValueCell({ value, isSecret = false }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (value == null) return <span className="text-slate-500 font-mono text-xs">—</span>;

  // Boolean
  if (typeof value === 'boolean') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
          value
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${value ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
        {value ? 'Enabled' : 'Disabled'}
      </span>
    );
  }

  // Array
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-slate-500 font-mono text-xs">—</span>;
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((item, i) => (
          <span key={i} className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 font-mono text-xs text-indigo-300">
            {item}
          </span>
        ))}
      </div>
    );
  }

  // Object
  if (typeof value === 'object') {
    const entries = Object.entries(value).filter(([, v]) => v != null);
    if (entries.length === 0) return <span className="text-slate-500 font-mono text-xs">—</span>;

    return (
      <div className="space-y-1.5 py-1 min-w-0 max-w-full overflow-hidden">
        {entries.map(([k, v]) => (
          <div key={k} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 text-xs font-mono rounded bg-slate-950/80 p-2 border border-slate-800/80 min-w-0 overflow-hidden">
            <span className="text-indigo-300 font-semibold shrink-0">{k}:</span>
            <div className="text-slate-200 min-w-0 break-all overflow-hidden">
              {typeof v === 'boolean' ? (
                <span className="text-purple-400 font-bold">{v ? 'true' : 'false'}</span>
              ) : typeof v === 'object' ? (
                <pre className="text-[11px] text-cyan-300 font-mono whitespace-pre-wrap break-all max-h-48 overflow-y-auto bg-slate-900/90 p-2.5 rounded border border-slate-800 mt-1 leading-relaxed">
                  {JSON.stringify(v, null, 2)}
                </pre>
              ) : (
                <span className="break-all">{String(v)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // String / Number
  const strVal = String(value);

  const handleCopy = () => {
    navigator.clipboard.writeText(strVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isSecret) {
    const masked = '•'.repeat(Math.min(strVal.length, 14));
    return (
      <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1 font-mono text-xs text-slate-200 min-w-0 overflow-hidden">
        <span className="truncate break-all">{revealed ? strVal : masked}</span>
        <button
          type="button"
          onClick={() => setRevealed(!revealed)}
          className="text-slate-400 hover:text-slate-200 transition p-0.5 shrink-0"
          title={revealed ? 'Hide' : 'Reveal'}
        >
          {revealed ? (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.017 10.017 0 013.682-.763c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="text-slate-400 hover:text-cyan-400 transition p-0.5 shrink-0"
          title="Copy"
        >
          {copied ? <span className="text-[10px] text-cyan-400 font-semibold">Copied</span> : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex max-w-full items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-1 font-mono text-xs text-slate-200 min-w-0 overflow-hidden">
      <span className="truncate break-all">{strVal}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="text-slate-500 hover:text-cyan-400 transition p-0.5 shrink-0"
        title="Copy"
      >
        {copied ? <span className="text-[10px] text-cyan-400 font-semibold">Copied</span> : (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}

function AdminConfigTable({ title, badgeText, config, searchQuery }) {
  if (!config) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <h3 className="font-bold text-slate-200">{title}</h3>
        <p className="mt-4 text-xs text-slate-500">No configuration data loaded.</p>
      </div>
    );
  }

  const items = [
    { label: 'Config ID', key: 'id', value: config.id },
    { label: 'Allowed Frontend URLs', key: 'frontendUrls', value: config.frontendUrls },
    { label: 'Leverage Limit', key: 'leverage', value: config.leverage != null ? `${config.leverage}x` : null },
    { label: 'Debug Mode', key: 'debugMode', value: config.debugMode },
    { label: 'Rate Limiter', key: 'rateLimiter', value: config.rateLimiter },
    { label: 'Redis Database URL', key: 'redisUrl', value: config.redisUrl },
    { label: 'JWT Secret Key', key: 'jwtSecret', value: config.jwtSecret, isSecret: true },
    { label: 'API Key', key: 'apiKey', value: config.apiKey, isSecret: true },
    { label: 'Brevo Sender Email', key: 'brevoEmail', value: config.brevoEmail },
    { label: 'Brevo API Key', key: 'brevoApiKey', value: config.brevoApiKey, isSecret: true },
    { label: 'Auth Providers', key: 'auth', value: config.auth },
    { label: 'Angel One Broker', key: 'angelOneConfig', value: config.angelOneConfig },
    { label: 'Google OAuth & Gemini', key: 'googleAuth', value: config.googleAuth },
    { label: 'FCM Push Config', key: 'fcmConfig', value: config.fcmConfig },
    { label: 'Component Flags', key: 'components', value: config.components },
  ].filter((item) => item.value != null);

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const valStr = typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value);
    return item.label.toLowerCase().includes(q) || item.key.toLowerCase().includes(q) || valStr.toLowerCase().includes(q);
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-sm overflow-hidden">
      {/* Table Card Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">{title}</h3>
            <p className="text-[11px] text-slate-400">{filteredItems.length} configuration fields</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
          {badgeText}
        </span>
      </div>

      {/* Admin Property Table */}
      <div className="divide-y divide-slate-800/60">
        {filteredItems.map((item) => (
          <div
            key={item.key}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 px-6 py-3.5 items-center hover:bg-slate-800/40 transition"
          >
            <div className="md:col-span-4">
              <span className="text-xs font-semibold text-slate-200 block">{item.label}</span>
              <span className="text-[10px] font-mono text-slate-500">{item.key}</span>
            </div>

            <div className="md:col-span-8 min-w-0 overflow-hidden">
              <ValueCell value={item.value} isSecret={item.isSecret} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Config() {
  const [client, setClient] = useState(null);
  const [backend, setBackend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('BACKEND'); // 'BACKEND' | 'CLIENT'
  const [reloadNotice, setReloadNotice] = useState(false);

  const loadConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const [clientData, backendData] = await Promise.all([
        fetchClientConfig(),
        fetchBackendConfig(),
      ]);
      setClient(clientData);
      setBackend(backendData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  async function handleReload() {
    if (reloading) return;
    setReloading(true);
    setReloadNotice(false);
    try {
      await reloadConfig();
      await loadConfig();
      setReloadNotice(true);
      setTimeout(() => setReloadNotice(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reload configuration');
    } finally {
      setReloading(false);
    }
  }

  // Calculate high-level admin metrics
  const adminStats = useMemo(() => {
    const leverage = backend?.leverage || client?.leverage || 10;
    const rateLimiter = backend?.rateLimiter ?? client?.rateLimiter ?? true;
    const debugMode = backend?.debugMode ?? client?.debugMode ?? false;
    const googleAuth = backend?.auth?.google ?? client?.auth?.google ?? true;
    const angelConfigured = Boolean(backend?.angelOneConfig || client?.angelOneConfig);

    return { leverage, rateLimiter, debugMode, googleAuth, angelConfigured };
  }, [backend, client]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 p-6 md:p-8 shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Configuration Management</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Admin control panel for client and backend runtime environment variables.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReload}
            disabled={reloading || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            <svg
              className={`h-4 w-4 ${reloading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {reloading ? 'Reloading Config...' : 'Reload Config'}
          </button>
        </div>
      </div>

      {reloadNotice && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Configuration successfully reloaded from backend server!
        </div>
      )}

      {/* Admin Quick Stat Overview Bar */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <span className="text-xs text-slate-400 font-medium">Trading Leverage</span>
          <p className="mt-2 text-2xl font-bold text-cyan-400 font-mono">{adminStats.leverage}x</p>
          <span className="text-[11px] text-slate-500">Max account multiplier</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <span className="text-xs text-slate-400 font-medium">Rate Limiter</span>
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                adminStats.rateLimiter
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${adminStats.rateLimiter ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {adminStats.rateLimiter ? 'Active' : 'Disabled'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">API Request Throttle</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <span className="text-xs text-slate-400 font-medium">Angel One Broker</span>
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                adminStats.angelConfigured
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {adminStats.angelConfigured ? 'Configured' : 'Not Set'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Broker API integration</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <span className="text-xs text-slate-400 font-medium">Debug Mode</span>
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                adminStats.debugMode
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {adminStats.debugMode ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">System verbose logs</span>
        </div>
      </div>

      {/* Search Bar & View Filter Tabs */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between backdrop-blur-sm">
        {/* Filter Pills */}
        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950/80 p-1">
          <button
            onClick={() => setActiveTab('BACKEND')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === 'BACKEND'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Backend Config
          </button>
          <button
            onClick={() => setActiveTab('CLIENT')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === 'CLIENT'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Client Config
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search parameters or values..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="space-y-6">
          <div className="h-96 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
          <p className="font-semibold">Error:</p>
          <p className="mt-1 font-mono">{error}</p>
        </div>
      )}

      {/* Admin Config Table */}
      {!loading && (
        <div className="space-y-6">
          {activeTab === 'BACKEND' && (
            <AdminConfigTable
              title="Backend Active Configuration"
              badgeText="Backend API"
              config={backend}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'CLIENT' && (
            <AdminConfigTable
              title="Client Active Configuration"
              badgeText="Client Web App"
              config={client}
              searchQuery={searchQuery}
            />
          )}
        </div>
      )}
    </div>
  );
}
