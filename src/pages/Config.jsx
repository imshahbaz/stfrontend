import { useEffect, useState } from 'react';
import {
  fetchClientConfig,
  fetchBackendConfig,
  reloadConfig,
} from '../api/service';

function formatValue(value) {
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    return value.join(', ');
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value).filter(([, v]) => v != null);
    if (entries.length === 0) return '—';
    return entries
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join(', ');
  }
  return String(value);
}

function ConfigSection({ title, config, loading, error }) {
  if (loading) {
    return <p className="text-slate-400">Loading {title}...</p>;
  }

  if (error) {
    return (
      <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
        {error}
      </p>
    );
  }

  if (!config) {
    return <p className="text-slate-400">No config available.</p>;
  }

  const flat = [
    ['ID', config.id],
    ['Frontend URLs', config.frontendUrls],
    ['Brevo Email', config.brevoEmail],
    ['Brevo API Key', config.brevoApiKey],
    ['API Key', config.apiKey],
    ['Leverage', config.leverage],
    ['Debug Mode', config.debugMode],
    ['Rate Limiter', config.rateLimiter],
    ['JWT Secret', config.jwtSecret],
    ['Redis URL', config.redisUrl],
    ['Google Auth', config.googleAuth],
    ['Angel One', config.angelOneConfig],
    ['FCM', config.fcmConfig],
    ['Auth Flags', config.auth],
    ['Components', config.components],
  ].filter(([, value]) => value != null);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <dl className="divide-y divide-slate-800">
        {flat.map(([key, value]) => (
          <div
            key={key}
            className="grid grid-cols-[180px_1fr] gap-4 bg-slate-900/50 px-4 py-3"
          >
            <dt className="text-sm text-slate-400">{key}</dt>
            <dd className="break-all text-sm text-slate-200">{formatValue(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function Config() {
  const [client, setClient] = useState(null);
  const [backend, setBackend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [errors, setErrors] = useState({ client: '', backend: '' });

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const [clientData, backendData] = await Promise.all([
          fetchClientConfig(),
          fetchBackendConfig(),
        ]);
        if (!active) return;
        setClient(clientData);
        setBackend(backendData);
      } catch (err) {
        if (active) {
          const message =
            err.response?.data?.message ||
            err.response?.data?.error ||
            'Failed to load config';
          setErrors({ client: message, backend: message });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function handleReload() {
    if (reloading) return;
    setReloading(true);
    try {
      await reloadConfig();
      const [clientData, backendData] = await Promise.all([
        fetchClientConfig(),
        fetchBackendConfig(),
      ]);
      setClient(clientData);
      setBackend(backendData);
      setErrors({ client: '', backend: '' });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to reload config';
      setErrors({ client: message, backend: message });
    } finally {
      setReloading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Config Management</h2>
          <p className="mt-2 text-slate-400">
            View active client and backend configuration.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReload}
          disabled={reloading || loading}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {reloading && (
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          {reloading ? 'Reloading...' : 'Reload Config'}
        </button>
      </div>

      <div className="mt-8 space-y-8">
        <ConfigSection
          title="Client Config"
          config={client}
          loading={loading}
          error={errors.client}
        />
        <ConfigSection
          title="Backend Config"
          config={backend}
          loading={loading}
          error={errors.backend}
        />
      </div>
    </div>
  );
}
