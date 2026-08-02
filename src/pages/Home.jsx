import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function StrategyCardIcon() {
  return (
    <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function ConfigCardIcon() {
  return (
    <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ServerCardIcon() {
  return (
    <svg className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  );
}

function MarketCardIcon() {
  return (
    <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function SchedulerCardIcon() {
  return (
    <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ScannerCardIcon() {
  return (
    <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function UserAvatar({ user }) {
  const [imageError, setImageError] = useState(false);
  const profilePic =
    user?.profile ||
    user?.picture ||
    user?.avatar ||
    user?.profilePicture ||
    user?.profileUrl ||
    user?.avatarUrl;

  const initials = (user?.name || user?.username || user?.email || 'K')
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (profilePic && !imageError) {
    return (
      <img
        src={profilePic}
        alt={user?.name || 'User Avatar'}
        onError={() => setImageError(true)}
        className="h-14 w-14 rounded-2xl object-cover border-2 border-blue-500/40 shadow-lg"
      />
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20 border border-blue-400/30">
      {initials}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      label: 'Strategy Management',
      badge: 'Trading Setups',
      hint: 'Configure scan clauses, timeframes, and success rates.',
      to: '/strategies',
      accent: 'text-emerald-400',
      borderAccent: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
      bgGlow: 'from-emerald-500/10 via-transparent to-transparent',
      icon: <StrategyCardIcon />,
      actionText: 'Manage Strategies',
    },
    {
      label: 'Chartink Strategy Scanner',
      badge: 'Live Stock Scan',
      hint: 'Select loaded strategies to scan live market symbols & margin requirements.',
      to: '/scanner',
      accent: 'text-cyan-400',
      borderAccent: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10',
      bgGlow: 'from-cyan-500/10 via-transparent to-transparent',
      icon: <ScannerCardIcon />,
      actionText: 'Open Scanner',
    },
    {
      label: 'Config Management',
      badge: 'Client & Backend',
      hint: 'Inspect active properties, reload client & server configs.',
      to: '/config',
      accent: 'text-blue-400',
      borderAccent: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
      bgGlow: 'from-blue-500/10 via-transparent to-transparent',
      icon: <ConfigCardIcon />,
      actionText: 'View Configs',
    },
    {
      label: 'Server Monitoring',
      badge: 'Real-time Health',
      hint: 'Monitor CPU usage, RAM memory, threads & JVM metrics.',
      to: '/server-monitoring',
      accent: 'text-sky-400',
      borderAccent: 'hover:border-sky-500/50 hover:shadow-sky-500/10',
      bgGlow: 'from-sky-500/10 via-transparent to-transparent',
      icon: <ServerCardIcon />,
      actionText: 'Server Metrics',
    },
    {
      label: 'Market Data & Charts',
      badge: 'Bar Series & Margins',
      hint: 'Interactive candlestick charts, margin metrics, & warmup.',
      to: '/market-data',
      accent: 'text-amber-400',
      borderAccent: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
      bgGlow: 'from-amber-500/10 via-transparent to-transparent',
      icon: <MarketCardIcon />,
      actionText: 'Explore Charts',
    },
    {
      label: 'Scheduler & CRON Tasks',
      badge: 'Task Automation',
      hint: 'Create & delete one-time tasks or recurring CRON schedules.',
      to: '/scheduler-tasks',
      accent: 'text-purple-400',
      borderAccent: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
      bgGlow: 'from-purple-500/10 via-transparent to-transparent',
      icon: <SchedulerCardIcon />,
      actionText: 'Schedule Tasks',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 sm:items-center">
            <UserAvatar user={user} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Welcome back{user?.name ? `, ${user.name}` : ''}
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Console Active
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                Centralized control panel for strategy setups, server telemetry, system configurations, and automated task schedules.
              </p>
            </div>
          </div>

          {/* Clock & Status */}
          <div className="flex shrink-0 flex-col sm:items-end border-t border-slate-800/80 sm:border-t-0 pt-4 sm:pt-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">System Time</span>
            <span className="font-mono text-xs font-bold text-slate-200 mt-0.5">{currentTime || '—'}</span>
            <span className="mt-2 inline-flex items-center rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] font-mono text-slate-400">
              Role: <strong className="ml-1 text-blue-400 uppercase">{user?.role || 'ADMIN'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Launch Cards Section Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">System Control Modules</h3>
            <p className="text-xs text-slate-400">Quick access to all KlikPanel operational views and management suites.</p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500">{cards.length} Modules Ready</span>
        </div>

        {/* Responsive Grid of All 5 Module Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.label}
              to={card.to}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 ${card.borderAccent}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGlow} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/80 shadow-inner">
                    {card.icon}
                  </div>
                  <span className="rounded-full border border-slate-800 bg-slate-950/80 px-2.5 py-0.5 text-[10px] font-mono font-medium text-slate-400">
                    {card.badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                    {card.label}
                  </h4>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{card.hint}</p>
                </div>
              </div>

              <div className="relative mt-5 flex items-center justify-between pt-3 border-t border-slate-800/80">
                <span className={`text-xs font-bold ${card.accent}`}>{card.actionText}</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 transition group-hover:border-slate-700 group-hover:bg-slate-800 group-hover:text-white">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
