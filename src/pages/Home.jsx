import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <h1 className="text-lg font-semibold">KlikPanel</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{user?.email}</span>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
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
      </main>
    </div>
  );
}
