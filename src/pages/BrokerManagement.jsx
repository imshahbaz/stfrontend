import { useState } from 'react';
import { revokeBrokerAuth } from '../api/service';

function KeyShieldIcon() {
  return (
    <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function AlertIcon({ type }) {
  if (type === 'success') {
    return (
      <svg className="h-5 w-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function BrokerManagement() {
  const [userId, setUserId] = useState('');
  const [brokerType, setBrokerType] = useState('ZERODHA');
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', title: string, message: string }
  const [activityLog, setActivityLog] = useState([]);

  const isFormValid = () => {
    if (!userId) return false;
    const num = Number(userId);
    return !isNaN(num) && Number.isInteger(num) && num >= 1;
  };

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    setNotification(null);
    if (!isFormValid()) {
      setNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter a valid positive integer User ID (min 1).',
      });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleExecuteRevoke = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setNotification(null);

    const targetUserId = Number(userId);
    const targetBroker = brokerType;

    try {
      const result = await revokeBrokerAuth(targetUserId, targetBroker);
      
      const successMsg =
        typeof result === 'string'
          ? result
          : result?.message || `Successfully revoked ${targetBroker} authentication for User ID ${targetUserId}.`;

      setNotification({
        type: 'success',
        title: 'Authentication Revoked',
        message: successMsg,
      });

      // Add to local activity log
      setActivityLog((prev) => [
        {
          id: Date.now(),
          userId: targetUserId,
          brokerType: targetBroker,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          status: 'SUCCESS',
        },
        ...prev,
      ]);
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Revocation Failed',
        message: err?.message || 'An error occurred while revoking broker authentication.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUserId('');
    setBrokerType('ZERODHA');
    setNotification(null);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30">
              <KeyShieldIcon />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Broker Management</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Manage broker sessions, access tokens, and revoke user authorizations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            Session Manager Ready
          </span>
        </div>
      </div>

      {/* Main Section: Revoke Auth Form */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Revoke Auth</h2>
            <p className="text-xs text-slate-400">
              Invalidate active broker OAuth token session for a specific user ID and broker provider.
            </p>
          </div>
        </div>

        {/* Feedback Banner */}
        {notification && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 backdrop-blur-md transition-all ${
              notification.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
            }`}
          >
            <AlertIcon type={notification.type} />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold">{notification.title}</h4>
              <p className="text-xs mt-0.5 opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <form onSubmit={handleOpenConfirm} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User ID Field */}
            <div className="space-y-2">
              <label htmlFor="userId" className="block text-sm font-semibold text-slate-200">
                User ID <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="userId"
                  type="number"
                  min="1"
                  step="1"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. 1001"
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white font-mono placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                  Long &ge; 1
                </span>
              </div>
              <p className="text-xs text-slate-500">Target user identifier (Must be positive integer min 1).</p>
            </div>

            {/* Broker Type Selection Dropdown */}
            <div className="space-y-2">
              <label htmlFor="brokerType" className="block text-sm font-semibold text-slate-200">
                Broker Selection <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <select
                  id="brokerType"
                  value={brokerType}
                  onChange={(e) => setBrokerType(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 pr-10 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                >
                  <option value="ZERODHA">ZERODHA</option>
                  <option value="RUPEEZY">RUPEEZY</option>
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-slate-500">Select the target broker for authentication revocation.</p>
            </div>
          </div>

          {/* Form Action Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="w-full sm:w-auto rounded-xl border border-slate-800 px-5 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
            >
              Reset Fields
            </button>

            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 hover:from-rose-500 hover:to-amber-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Revoking Auth...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 0112.983 12.983m-9.543-4.543L12 12m-6 6l12-12" />
                  </svg>
                  <span>Revoke Authorization</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Confirm Revocation</h3>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to revoke <span className="font-bold text-amber-400">{brokerType}</span> authorization for User ID <span className="font-mono font-bold text-blue-400">{userId}</span>?
            </p>
            <p className="text-xs text-slate-400 mt-2">
              This will immediately invalidate active session tokens and force the user to re-authenticate with their broker.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRevoke}
                className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-500 transition shadow-lg shadow-rose-600/20"
              >
                Yes, Revoke Auth
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Section */}
      {activityLog.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Recent Session Revocation History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase">
                  <th className="pb-3 px-2">Time</th>
                  <th className="pb-3 px-2">User ID</th>
                  <th className="pb-3 px-2">Broker</th>
                  <th className="pb-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activityLog.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-2 text-slate-400">{log.timestamp}</td>
                    <td className="py-3 px-2 text-blue-400 font-bold">{log.userId}</td>
                    <td className="py-3 px-2 text-white">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                          log.brokerType === 'ZERODHA'
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        }`}
                      >
                        {log.brokerType}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-emerald-400 font-semibold">{log.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
