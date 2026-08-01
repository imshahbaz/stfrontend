import { useState } from 'react';
import { fetchScheduleTasks, createCronSchedule, createOneTimeSchedule } from '../api/service';

const TASK_TYPES = ['CRON', 'TASK'];

const DAYS_OF_WEEK = [
  { key: 'MON', label: 'Mon' },
  { key: 'TUE', label: 'Tue' },
  { key: 'WED', label: 'Wed' },
  { key: 'THU', label: 'Thu' },
  { key: 'FRI', label: 'Fri' },
  { key: 'SAT', label: 'Sat' },
  { key: 'SUN', label: 'Sun' },
];

function getCronDescription(expr) {
  if (!expr || !expr.trim()) return '';
  const trimmed = expr.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length === 5 || parts.length === 6) {
    const minStr = parts.length === 6 ? parts[1] : parts[0];
    const hourStr = parts.length === 6 ? parts[2] : parts[1];
    const dowStr = parts.length === 6 ? parts[5] : parts[4];

    if (minStr.startsWith('*/')) {
      return `Runs every ${minStr.replace('*/', '')} minutes`;
    }

    const min = parseInt(minStr, 10);
    const hour = parseInt(hourStr, 10);

    let timeText = '';
    if (!isNaN(hour) && !isNaN(min)) {
      const h12 = hour % 12 || 12;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const mTwo = String(min).padStart(2, '0');
      timeText = `at ${String(h12).padStart(2, '0')}:${mTwo} ${ampm}`;
    }

    let daysText = 'every day';
    if (dowStr === '1-5' || dowStr === 'MON-FRI' || dowStr === 'MON,TUE,WED,THU,FRI') {
      daysText = 'Monday through Friday';
    } else if (dowStr === '6,7' || dowStr === 'SAT,SUN') {
      daysText = 'on Weekends (Sat-Sun)';
    } else if (dowStr !== '*' && dowStr !== '?') {
      daysText = `on ${dowStr}`;
    }

    if (timeText) {
      return `Runs ${daysText} ${timeText}`;
    }
  }

  return 'Custom cron schedule';
}

function formatExecutionTime(timeMs) {
  if (!timeMs) return '—';
  const date = new Date(Number(timeMs));
  if (isNaN(date.getTime())) return String(timeMs);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function getMinDateTimeString() {
  const now = new Date();
  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(now);
  const getPart = (type) => parts.find((p) => p.type === type)?.value || '00';
  return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}`;
}

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
  const [selectedTask, setSelectedTask] = useState(null);

  // Creation Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createType, setCreateType] = useState('CRON');
  const [cronId, setCronId] = useState('');
  const [cronExpression, setCronExpression] = useState('0 15 9 * * MON,TUE,WED,THU,FRI');
  const [taskId, setTaskId] = useState('');
  const [executionTime, setExecutionTime] = useState('');
  const [httpMethod, setHttpMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headersText, setHeadersText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(null);

  // Visual CRON Days & Time builder state
  const [cronTime, setCronTime] = useState('09:15');
  const [selectedDays, setSelectedDays] = useState(['MON', 'TUE', 'WED', 'THU', 'FRI']);

  const updateCronFromDaysAndTime = (days, time) => {
    if (!time) return;
    const [hStr, mStr] = time.split(':');
    const h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;
    const dow = days.length === 0 || days.length === 7 ? '*' : days.join(',');
    const expr = `0 ${m} ${h} * * ${dow}`;
    setCronExpression(expr);
  };

  const handleDayToggle = (dayKey) => {
    const nextDays = selectedDays.includes(dayKey)
      ? selectedDays.filter((d) => d !== dayKey)
      : [...selectedDays, dayKey];
    const ordered = DAYS_OF_WEEK.map((d) => d.key).filter((k) => nextDays.includes(k));
    setSelectedDays(ordered);
    updateCronFromDaysAndTime(ordered, cronTime);
  };

  const handleTimeChange = (newTime) => {
    setCronTime(newTime);
    updateCronFromDaysAndTime(selectedDays, newTime);
  };

  const handleSelectAllDays = () => {
    const all = DAYS_OF_WEEK.map((d) => d.key);
    setSelectedDays(all);
    updateCronFromDaysAndTime(all, cronTime);
  };

  const handleSelectWeekdays = () => {
    const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
    setSelectedDays(weekdays);
    updateCronFromDaysAndTime(weekdays, cronTime);
  };

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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    if (!url.trim()) {
      setCreateError('Callback URL is required.');
      return;
    }

    let parsedHeaders = null;
    if (headersText.trim()) {
      try {
        parsedHeaders = JSON.parse(headersText.trim());
        if (typeof parsedHeaders !== 'object' || Array.isArray(parsedHeaders)) {
          setCreateError('Headers must be a valid JSON object (e.g. {"Authorization": "Bearer ..."})');
          return;
        }
      } catch (err) {
        setCreateError('Headers JSON format is invalid. Please check your syntax.');
        return;
      }
    }

    setCreateLoading(true);

    try {
      if (createType === 'CRON') {
        if (!cronId.trim()) {
          setCreateError('Cron ID is required for CRON schedules.');
          setCreateLoading(false);
          return;
        }
        if (!cronExpression.trim()) {
          setCreateError('Cron Expression is required for CRON schedules.');
          setCreateLoading(false);
          return;
        }

        const payload = {
          cronId: cronId.trim(),
          cronExpression: cronExpression.trim(),
          callBack: {
            url: url.trim(),
            httpMethod,
            headers: parsedHeaders,
            body: bodyText.trim() ? bodyText.trim() : null,
          },
        };

        await createCronSchedule(payload);
        setCreateSuccess(`CRON schedule "${cronId.trim()}" created successfully!`);
      } else {
        if (!executionTime) {
          setCreateError('Execution Date & Time is required for Task schedules.');
          setCreateLoading(false);
          return;
        }

        const istString = executionTime.includes('+') || executionTime.includes('Z')
          ? executionTime
          : `${executionTime}:00+05:30`;
        const executionTimeMs = new Date(istString).getTime();
        if (isNaN(executionTimeMs)) {
          setCreateError('Invalid Execution Date & Time.');
          setCreateLoading(false);
          return;
        }

        if (executionTimeMs <= Date.now()) {
          setCreateError('Execution Date & Time must be in the future.');
          setCreateLoading(false);
          return;
        }

        const payload = {
          taskId: taskId.trim() || undefined,
          executionTime: executionTimeMs,
          callBack: {
            url: url.trim(),
            httpMethod,
            headers: parsedHeaders,
            body: bodyText.trim() ? bodyText.trim() : null,
          },
        };

        await createOneTimeSchedule(payload);
        setCreateSuccess('Task schedule created successfully!');
      }

      setTimeout(() => {
        setIsCreateOpen(false);
        setCreateSuccess(null);
        setCronId('');
        setCronExpression('');
        setTaskId('');
        setExecutionTime('');
        setUrl('');
        setHeadersText('');
        setBodyText('');
        if (selectedType) {
          handleSearch();
        }
      }, 1000);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create schedule');
    } finally {
      setCreateLoading(false);
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

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:from-blue-500 hover:to-indigo-500"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Schedule
        </button>
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
                      <th className="px-5 py-3 font-semibold">Schedule / Execution</th>
                      <th className="px-5 py-3 font-semibold">Callback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, i) => (
                      <tr
                        key={task.cronId || task.taskId || i}
                        onClick={() => setSelectedTask(task)}
                        className={`cursor-pointer border-b border-slate-800/60 transition hover:bg-slate-800/60 ${
                          i % 2 === 1 ? 'bg-slate-950/30' : ''
                        }`}
                      >
                        <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-100">
                          {task.cronId || task.taskId || '—'}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                            {task.type || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {task.cronExpression ? (
                            <code className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1 font-mono text-[11px] text-amber-300">
                              {task.cronExpression}
                            </code>
                          ) : task.executionTime ? (
                            <span className="font-mono text-[11px] text-emerald-300">
                              {formatExecutionTime(task.executionTime)}
                            </span>
                          ) : (
                            <span className="text-slate-500 font-mono text-xs">—</span>
                          )}
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

      {/* Create Schedule Modal */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Create New Schedule Task</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {createError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
                <p className="font-semibold">{createError}</p>
              </div>
            )}

            {createSuccess && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
                <p className="font-semibold">{createSuccess}</p>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Schedule Type
                </label>
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-800 bg-slate-950 p-1.5">
                  <button
                    type="button"
                    onClick={() => setCreateType('CRON')}
                    className={`rounded-lg py-2 text-xs font-semibold transition ${
                      createType === 'CRON'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    CRON Schedule (Recurring)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateType('TASK')}
                    className={`rounded-lg py-2 text-xs font-semibold transition ${
                      createType === 'TASK'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Task Schedule (One-Time)
                  </button>
                </div>
              </div>

              {/* Conditional Fields: CRON vs TASK */}
              {createType === 'CRON' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Cron ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={cronId}
                      onChange={(e) => setCronId(e.target.value)}
                      placeholder="e.g. daily_market_sync"
                      required
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-blue-500 font-mono"
                    />
                  </div>

                  {/* Visual Days & Time Picker Card */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Schedule Builder (Days & Time)
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">IST (+05:30)</span>
                    </div>

                    {/* Time Picker */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Select Execution Time
                      </label>
                      <input
                        type="time"
                        value={cronTime}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="w-full sm:w-48 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-blue-500 font-mono font-semibold cursor-pointer"
                      />
                    </div>

                    {/* Days Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-slate-400">
                          Select Days of Week
                        </label>
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            type="button"
                            onClick={handleSelectWeekdays}
                            className="text-indigo-400 hover:text-indigo-300 transition hover:underline font-medium text-[11px]"
                          >
                            Mon-Fri (Weekdays)
                          </button>
                          <span className="text-slate-700">•</span>
                          <button
                            type="button"
                            onClick={handleSelectAllDays}
                            className="text-indigo-400 hover:text-indigo-300 transition hover:underline font-medium text-[11px]"
                          >
                            All Days
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-1.5">
                        {DAYS_OF_WEEK.map((day) => {
                          const isSelected = selectedDays.includes(day.key);
                          return (
                            <button
                              key={day.key}
                              type="button"
                              onClick={() => handleDayToggle(day.key)}
                              className={`rounded-lg border py-2 text-xs font-bold transition ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-600 text-white shadow-md'
                                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Expression Input & Live Explanation */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Generated Cron Expression <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={cronExpression}
                      onChange={(e) => setCronExpression(e.target.value)}
                      placeholder="e.g. 0 15 9 * * MON,TUE,WED,THU,FRI"
                      required
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-blue-500 font-mono text-amber-300 font-semibold"
                    />
                    {cronExpression && (
                      <p className="mt-1.5 text-xs font-medium text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
                        <span>⚡</span>
                        <span>{getCronDescription(cronExpression)}</span>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Task ID <span className="text-slate-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={taskId}
                      onChange={(e) => setTaskId(e.target.value)}
                      placeholder="e.g. delayed_job_1"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Execution Date & Time <span className="text-red-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="datetime-local"
                        value={executionTime}
                        min={getMinDateTimeString()}
                        onChange={(e) => setExecutionTime(e.target.value)}
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        required
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Must be scheduled for a future date and time.
                    </p>
                  </div>
                </div>
              )}

              {/* Callback Configuration */}
              <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Target Callback Details
                </p>

                <div className="w-full sm:w-48">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    HTTP Method
                  </label>
                  <select
                    value={httpMethod}
                    onChange={(e) => setHttpMethod(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-blue-500 font-mono font-semibold"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Callback URL <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://api.example.com/webhook"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none transition focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Headers <span className="text-slate-500">(Optional JSON Object)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={headersText}
                    onChange={(e) => setHeadersText(e.target.value)}
                    placeholder='{"Content-Type": "application/json"}'
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none transition focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Body / Payload <span className="text-slate-500">(Optional String / JSON)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    placeholder='{"action": "RUN"}'
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none transition focus:border-blue-500 font-mono text-indigo-300"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white shadow-md transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {createLoading ? (
                    <>
                      <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Create Schedule</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-white">Task Details</h3>
                <span className="inline-flex items-center rounded-md border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
                  {selectedTask.type || '—'}
                </span>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
                aria-label="Close modal"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Task ID</p>
                <p className="mt-1 font-mono text-sm font-semibold text-slate-100">
                  {selectedTask.cronId || selectedTask.taskId || '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {selectedTask.cronExpression ? 'Cron Expression' : 'Execution Time'}
                </p>
                {selectedTask.cronExpression ? (
                  <code className="mt-1 inline-block rounded border border-slate-800 bg-slate-950 px-2 py-1 font-mono text-xs font-semibold text-amber-300">
                    {selectedTask.cronExpression}
                  </code>
                ) : (
                  <span className="mt-1 block font-mono text-xs font-semibold text-emerald-300">
                    {formatExecutionTime(selectedTask.executionTime)}
                  </span>
                )}
              </div>
            </div>

            {/* Callback Configuration */}
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Callback Configuration
              </p>

              {selectedTask.callBack ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Method:</span>
                    <MethodBadge method={selectedTask.callBack.httpMethod} />
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium">URL:</span>
                    <div className="mt-1 break-all rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-slate-200">
                      {selectedTask.callBack.url || '—'}
                    </div>
                  </div>

                  {selectedTask.callBack.headers && Object.keys(selectedTask.callBack.headers).length > 0 && (
                    <div>
                      <span className="text-slate-500 font-medium">Headers:</span>
                      <pre className="mt-1 max-h-36 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-[11px] text-slate-300">
                        {JSON.stringify(selectedTask.callBack.headers, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedTask.callBack.body && (
                    <div>
                      <span className="text-slate-500 font-medium">Body / Payload:</span>
                      <pre className="mt-1 max-h-40 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-[11px] text-indigo-300">
                        {typeof selectedTask.callBack.body === 'object'
                          ? JSON.stringify(selectedTask.callBack.body, null, 2)
                          : selectedTask.callBack.body}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No callback details configured.</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedTask(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
