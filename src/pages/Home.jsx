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
      accent: 'text-emerald-400',
    },
    {
      label: 'Active Config',
      value: '—',
      hint: 'Client & backend',
      to: '/config',
      accent: 'text-blue-400',
    },
    {
      label: 'Server Monitoring',
      value: 'Live',
      hint: 'CPU, Memory, Threads & Pipeline health',
      to: '/server-monitoring',
      accent: 'text-sky-400',
    },
  ];

  return (
    <div>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
            {initials}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
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
            className="group rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-600"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <span className="text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-white">
                →
              </span>
            </div>
            <p className={`mt-2 text-3xl font-bold ${stat.accent}`}>{stat.value}</p>
            <p className="mt-1 text-xs text-slate-500">{stat.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
