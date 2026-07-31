import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-bold">Welcome back{user?.name ? `, ${user.name}` : ''}</h2>
      <p className="mt-2 text-slate-400">
        Your admin dashboard is ready. Add your sections, widgets, and data here.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Users', value: '—' },
          { label: 'Orders', value: '—' },
          { label: 'Revenue', value: '—' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-800 bg-slate-900 p-6"
          >
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
