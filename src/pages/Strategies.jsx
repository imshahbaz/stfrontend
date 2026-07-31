import { useEffect, useState } from 'react';
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

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingName, setDeletingName] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadStrategies() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchStrategies();
        if (!active) return;
        setStrategies(data || []);
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load strategies');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStrategies();
    return () => {
      active = false;
    };
  }, []);

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
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to delete strategy');
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
      const data = await fetchStrategies();
      setStrategies(data || []);
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data?.error || 'Failed to save strategy');
    } finally {
      setSaving(false);
    }
  }

  const editing = strategies.some((s) => s.name === form?.name);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Strategy Management</h2>
          <p className="mt-2 text-slate-400">
            View, create, update, and delete trading strategies.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
        >
          Add Strategy
        </button>
      </div>

      {loading && <p className="mt-8 text-slate-400">Loading strategies...</p>}

      {error && (
        <p className="mt-8 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && strategies.length === 0 && (
        <p className="mt-8 text-slate-400">No strategies found.</p>
      )}

      {!loading && strategies.length > 0 && (
        <div className="mt-8 space-y-8">
          {TIMEFRAMES.filter((tf) =>
            strategies.some((s) => (s.timeFrame || '').toUpperCase() === tf)
          ).map((tf) => {
            const group = strategies.filter(
              (s) => (s.timeFrame || '').toUpperCase() === tf
            );
            return (
              <section key={tf}>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
                  {TIMEFRAME_LABELS[tf] || tf}
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
                    {group.length}
                  </span>
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Scan Clause</th>
                        <th className="px-4 py-3 font-medium">Success Rate</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {group.map((strategy) => (
                        <tr key={strategy.name} className="bg-slate-900/50 hover:bg-slate-900">
                          <td className="px-4 py-3 font-medium">{strategy.name}</td>
                          <td className="px-4 py-3 text-slate-400">{strategy.scanClause}</td>
                          <td className="px-4 py-3">
                            {strategy.successRate != null
                              ? `${(strategy.successRate * 100).toFixed(1)}%`
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                strategy.active
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-slate-700/50 text-slate-400'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  strategy.active ? 'bg-emerald-400' : 'bg-slate-500'
                                }`}
                              />
                              {strategy.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(strategy)}
                                className="rounded-md border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => openDelete(strategy)}
                                className="rounded-md border border-red-800/60 px-2.5 py-1 text-xs font-medium text-red-400 transition hover:border-red-600 hover:text-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">
              {editing ? 'Edit Strategy' : 'Add Strategy'}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-400">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  disabled={editing}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500 disabled:opacity-50"
                  placeholder="Strategy name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">Scan Clause</label>
                <textarea
                  required
                  value={form.scanClause}
                  onChange={(e) => setForm({ ...form, scanClause: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500"
                  placeholder="e.g. close > sma(20)"
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">Time Frame</label>
                <select
                  value={form.timeFrame}
                  onChange={(e) => setForm({ ...form, timeFrame: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500"
                >
                  {TIMEFRAMES.map((tf) => (
                    <option key={tf} value={tf}>
                      {tf}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="h-4 w-4 accent-indigo-500"
                />
                Active
              </label>

              {formError && (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold">Delete Strategy?</h3>
                <p className="mt-1 text-sm text-slate-400">
                  This will permanently remove the strategy.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Name</span>
                <span className="font-medium text-white">{deleteTarget.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Time Frame</span>
                <span className="font-medium text-white">
                  {TIMEFRAME_LABELS[deleteTarget.timeFrame] || deleteTarget.timeFrame}
                </span>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDelete}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletingName === deleteTarget.name}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingName === deleteTarget.name ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
