import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const initials = (user?.name || user?.email || 'K')
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const cards = [
    {
      label: 'Strategies',
      value: '—',
      hint: 'Manage trading setups',
      to: '/strategies',
      accent: 'from-emerald-500/20 to-emerald-500/0',
      ring: 'ring-emerald-500/30',
    },
    {
      label: 'Active Config',
      value: '—',
      hint: 'Client & backend',
      to: '/config',
      accent: 'from-indigo-500/20 to-indigo-500/0',
      ring: 'ring-indigo-500/30',
    },
    {
      label: 'Server Monitoring',
      value: 'Live',
      hint: 'CPU, Memory, Threads & Pipeline health',
      to: '/server-monitoring',
      accent: 'from-sky-500/20 to-cyan-500/0',
      ring: 'ring-cyan-500/30',
    },
  ];

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold">
            {initials}
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              Welcome back{user?.name ? `, ${user.name}` : ''}
            </h2>
            <p className="mt-1 text-slate-400">
              Manage strategies, system configurations, and real-time server health from your console.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className={`group rounded-xl border border-slate-800 bg-gradient-to-br ${stat.accent} p-6 ring-1 ${stat.ring} transition hover:border-slate-600 hover:ring-2`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <span className="text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-white">
                →
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-500">{stat.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
