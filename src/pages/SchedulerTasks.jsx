import { useState } from 'react';
import { fetchScheduleTasks } from '../api/service';

const TASK_TYPES = ['CRON', 'TASK'];

function MethodBadge({ method }) {
  const color =
    method === 'GET'
      ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
      : method === 'POST'
        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        : method === 'PUT'
          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          : method === 'DELETE'
            ? 'bg-red-500/15 text-red-400 border-red-500/30'
            : 'bg-slate-800 text-slate-400 border-slate-700';
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold font-mono ${color}`}>
      {method || '—'}
    </span>
  );
}

export default function SchedulerTasks() {
  const [selectedType, setSelectedType] = useState('');
  const [searchedType, setSearchedType] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!selectedType) return;
    setLoading(true);
    setError(null);
    setTasks(null);
    try {
      const data = await fetchScheduleTasks(selectedType);
      setTasks(data || []);
      setSearchedType(selectedType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule tasks');
      setSearchedType(selectedType);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white tracking-tight">Scheduler Tasks</h1>
            <span className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
              Job Management
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Manage CRON and task-based scheduled jobs with their callback configurations.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Schedule Tasks
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-72 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          >
            <option value="">Select a task type</option>
            {TASK_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <button
            onClick={handleSearch}
            disabled={!selectedType || loading}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
            <p className="font-semibold">Error fetching schedule tasks:</p>
            <p className="mt-1 font-mono">{error}</p>
          </div>
        )}

        <div className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg border border-slate-800 bg-slate-950/40" />
              ))}
            </div>
          ) : searchedType && tasks && tasks.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-10 text-center text-sm text-slate-400">
              No {searchedType} tasks found.
            </div>
          ) : searchedType ? (
            <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900 text-xs uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3 font-semibold">Task ID</th>
                      <th className="px-5 py-3 font-semibold">Type</th>
                      <th className="px-5 py-3 font-semibold">Expression</th>
                      <th className="px-5 py-3 font-semibold">Callback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, i) => (
                      <tr
                        key={task.cronId || i}
                        className={`border-b border-slate-800/60 transition hover:bg-slate-800/40 ${
                          i % 2 === 1 ? 'bg-slate-950/30' : ''
                        }`}
                      >
                        <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-100">{task.cronId || '—'}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                            {task.type || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <code className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1 font-mono text-[11px] text-amber-300">
                            {task.cronExpression || '—'}
                          </code>
                        </td>
                        <td className="px-5 py-4">
                          {task.callBack ? (
                            <div className="flex items-center gap-2">
                              <MethodBadge method={task.callBack.httpMethod} />
                              <code className="min-w-0 max-w-xs truncate font-mono text-[11px] text-slate-400">
                                {task.callBack.url}
                              </code>
                            </div>
                          ) : (
                            <span className="text-slate-500 font-mono text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-10 text-center text-sm text-slate-500">
              Select a task type and click Search to load schedule tasks.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
