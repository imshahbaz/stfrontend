import { useEffect, useState } from 'react';
import { fetchStrategies } from '../api/service';

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div>
      <h2 className="text-2xl font-bold">Strategy Management</h2>
      <p className="mt-2 text-slate-400">
        View and manage trading strategies.
      </p>

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
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Scan Clause</th>
                <th className="px-4 py-3 font-medium">Time Frame</th>
                <th className="px-4 py-3 font-medium">Success Rate</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {strategies.map((strategy) => (
                <tr key={strategy.name} className="bg-slate-900/50 hover:bg-slate-900">
                  <td className="px-4 py-3 font-medium">{strategy.name}</td>
                  <td className="px-4 py-3 text-slate-400">{strategy.scanClause}</td>
                  <td className="px-4 py-3">{strategy.timeFrame}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
