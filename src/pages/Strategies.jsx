import { useEffect, useState, useMemo } from 'react';
import {
  fetchStrategies,
  createStrategy,
  updateStrategy,
  deleteStrategy,
} from '../api/service';

const EMPTY_FORM = {
  name: '',
  scanClause: '',
  active: true,
  successRate: 0,
  timeFrame: 'DAILY',
};

const TIMEFRAMES = [
  'FIVE_MINUTE',
  'FIFTEEN_MINUTE',
  'HOURLY',
  'DAILY',
  'WEEKLY',
  'MONTHLY',
];

const TIMEFRAME_LABELS = {
  FIVE_MINUTE: '5m',
  FIFTEEN_MINUTE: '15m',
  HOURLY: '1h',
  DAILY: '1D',
  WEEKLY: '1W',
  MONTHLY: '1M',
};

function SuccessRateBadge({ rate }) {
  if (rate == null) return <span className="text-slate-500 font-mono">—</span>;
  const numRate = Number(rate);
  let colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  let barColor = 'bg-emerald-400';

  if (numRate < 40) {
    colorClass = 'text-red-400 bg-red-500/10 border-red-500/30';
    barColor = 'bg-red-400';
  } else if (numRate < 70) {
    colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    barColor = 'bg-amber-400';
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 overflow-hidden rounded-full bg-slate-800 hidden sm:block">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, numRate)}%` }} />
      </div>
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold font-mono border ${colorClass}`}>
        {numRate.toFixed(1)}%
      </span>
    </div>
  );
}

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingName, setDeletingName] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const loadStrategies = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchStrategies();
      setStrategies(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load strategies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStrategies();
  }, []);

  // Filtered strategies
  const filteredStrategies = useMemo(() => {
    return strategies.filter((s) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.scanClause.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTf =
        selectedTimeframe === 'ALL' ||
        (s.timeFrame || '').toUpperCase() === selectedTimeframe;

      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'ACTIVE' && s.active) ||
        (selectedStatus === 'INACTIVE' && !s.active);

      return matchesSearch && matchesTf && matchesStatus;
    });
  }, [strategies, searchQuery, selectedTimeframe, selectedStatus]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = strategies.length;
    const activeCount = strategies.filter((s) => s.active).length;
    const rates = strategies
      .filter((s) => s.successRate != null)
      .map((s) => Number(s.successRate));
    const avgSuccess = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;

    return { total, activeCount, avgSuccess };
  }, [strategies]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError('');
  }

  function openEdit(strategy) {
    setForm({
      name: strategy.name,
      scanClause: strategy.scanClause,
      active: strategy.active,
      successRate: strategy.successRate ?? 0,
      timeFrame: strategy.timeFrame || 'DAILY',
    });
    setFormError('');
  }

  function closeForm() {
    setForm(null);
    setFormError('');
  }

  function openDelete(strategy) {
    setDeleteTarget(strategy);
    setDeletingName(null);
  }

  function closeDelete() {
    setDeleteTarget(null);
    setDeletingName(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeletingName(deleteTarget.name);
    try {
      await deleteStrategy(deleteTarget.name);
      setStrategies((prev) => prev.filter((s) => s.name !== deleteTarget.name));
      closeDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete strategy');
      closeDelete();
    } finally {
      setDeletingName(null);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (strategies.some((s) => s.name === form.name)) {
        await updateStrategy(form);
      } else {
        await createStrategy(form);
      }
      closeForm();
      await loadStrategies();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save strategy');
    } finally {
      setSaving(false);
    }
  }

  const editing = strategies.some((s) => s.name === form?.name);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 p-6 md:p-8 shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Strategy Management</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Configure, monitor, and manage algorithmic trading strategies and scan parameters.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:brightness-110 active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Strategy
          </button>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Strategies</span>
            <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="mt-2 text-2xl font-bold text-white font-mono">{stats.total}</p>
          <p className="text-[11px] text-slate-500 mt-1">Configured in system</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Strategies</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-400 font-mono">{stats.activeCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.total > 0 ? `${((stats.activeCount / stats.total) * 100).toFixed(0)}% active` : '0% active'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Success Rate</span>
            <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="mt-2 text-2xl font-bold text-cyan-400 font-mono">{stats.avgSuccess.toFixed(1)}%</p>
          <p className="text-[11px] text-slate-500 mt-1">Across all strategies</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between backdrop-blur-sm">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search strategy by name or scan clause..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Filter Pills */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950/80 p-1">
            <button
              onClick={() => setSelectedTimeframe('ALL')}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                selectedTimeframe === 'ALL'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All TF
            </button>
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                  selectedTimeframe === tf
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {TIMEFRAME_LABELS[tf] || tf}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-300 outline-none transition focus:border-indigo-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Main Content List / Table */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-slate-800 bg-slate-900/40" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
          <p className="font-semibold">Error:</p>
          <p className="mt-1 font-mono">{error}</p>
        </div>
      )}

      {!loading && !error && filteredStrategies.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-500 mb-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No strategies found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {searchQuery || selectedTimeframe !== 'ALL' || selectedStatus !== 'ALL'
              ? 'No strategy matches your current filters. Try resetting the filters.'
              : 'No strategies are configured yet. Click Add Strategy to create one.'}
          </p>
          {searchQuery || selectedTimeframe !== 'ALL' || selectedStatus !== 'ALL' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTimeframe('ALL');
                setSelectedStatus('ALL');
              }}
              className="mt-4 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={openCreate}
              className="mt-4 rounded-lg bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-400"
            >
              Add Strategy
            </button>
          )}
        </div>
      )}

      {!loading && filteredStrategies.length > 0 && (
        <div className="space-y-8">
          {TIMEFRAMES.filter((tf) =>
            filteredStrategies.some((s) => (s.timeFrame || '').toUpperCase() === tf)
          ).map((tf) => {
            const group = filteredStrategies.filter(
              (s) => (s.timeFrame || '').toUpperCase() === tf
            );
            return (
              <section key={tf} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-indigo-400">
                    <span className="flex h-2 w-2 rounded-full bg-indigo-400" />
                    Timeframe: {TIMEFRAME_LABELS[tf] || tf}
                    <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                      {group.length} {group.length === 1 ? 'strategy' : 'strategies'}
                    </span>
                  </h3>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg backdrop-blur-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-5 py-3.5 font-semibold">Strategy Name</th>
                          <th className="px-5 py-3.5 font-semibold">Scan Clause</th>
                          <th className="px-5 py-3.5 font-semibold">Success Rate</th>
                          <th className="px-5 py-3.5 font-semibold">Status</th>
                          <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {group.map((strategy) => (
                          <tr
                            key={strategy.name}
                            className="bg-slate-900/40 transition hover:bg-slate-800/40"
                          >
                            <td className="px-5 py-4 font-semibold text-slate-100 font-mono text-sm">
                              {strategy.name}
                            </td>
                            <td className="px-5 py-4 max-w-md">
                              <code className="inline-block rounded-md border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-[11px] font-mono text-cyan-300 break-all">
                                {strategy.scanClause}
                              </code>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <SuccessRateBadge rate={strategy.successRate} />
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
                                  strategy.active
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    strategy.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                                  }`}
                                />
                                {strategy.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEdit(strategy)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-indigo-500 hover:text-white hover:bg-indigo-500/10"
                                >
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDelete(strategy)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-500 hover:bg-red-500/20"
                                >
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  {editing ? 'Edit Strategy' : 'Create New Strategy'}
                </h3>
              </div>
              <button
                onClick={closeForm}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">Strategy Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  disabled={editing}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 disabled:opacity-50 font-mono"
                  placeholder="e.g. BREAKOUT_5M"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">Scan Clause</label>
                <textarea
                  required
                  value={form.scanClause}
                  onChange={(e) => setForm({ ...form, scanClause: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-3 text-xs text-cyan-300 font-mono placeholder-slate-500 outline-none transition focus:border-indigo-500 min-h-[160px] leading-relaxed resize-y"
                  placeholder="e.g. close > sma(20) AND volume > 100000"
                  rows={6}
                />
                <p className="mt-1 text-[10px] text-slate-500">Scan condition logic evaluated against market feeds.</p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">Time Frame</label>
                <select
                  value={form.timeFrame}
                  onChange={(e) => setForm({ ...form, timeFrame: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none transition focus:border-indigo-500"
                >
                  {TIMEFRAMES.map((tf) => (
                    <option key={tf} value={tf}>
                      {tf} ({TIMEFRAME_LABELS[tf] || tf})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2.5 text-xs font-medium text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="h-4 w-4 rounded accent-indigo-500 cursor-pointer"
                  />
                  Active & Operational
                </label>
              </div>

              {formError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-300">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Strategy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15 border border-red-500/30">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-100">Delete Strategy?</h3>
                <p className="mt-1 text-xs text-slate-400">
                  This action cannot be undone. The strategy configuration will be permanently removed.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Name:</span>
                <span className="font-semibold text-slate-200">{deleteTarget.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timeframe:</span>
                <span className="font-semibold text-indigo-400">{deleteTarget.timeFrame}</span>
              </div>
            </div>

            {error && (
              <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-300">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDelete}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletingName === deleteTarget.name}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {deletingName === deleteTarget.name ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
