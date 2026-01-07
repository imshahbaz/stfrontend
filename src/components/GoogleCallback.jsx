import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useGooglePolling from '../hooks/useGooglePolling';
import StatusAlert from './shared/StatusAlert';
import { cn } from '../lib/utils';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { login, user, setAuthLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const startedRef = useRef(false);

  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const onSuccess = useCallback(async (user) => {
    await login(user);
    setAuthLoading(false)
    navigate('/', { replace: true });
  }, [login, navigate]);

  const onError = useCallback((msg) => {
    setError(msg);
    setAuthLoading(false)
  }, []);

  const { status, isPolling, startPolling, clearPolling } = useGooglePolling(onSuccess, onError);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
      return;
    }
    if (!startedRef.current && code && state) {
      startPolling(code, state);
    } else {
      setError('Missing session data.');
    }
    return () => clearPolling();
  }, [code, state, startPolling, clearPolling, user, navigate]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-card border border-border rounded-[3rem] p-10 md:p-16 text-center shadow-2xl shadow-black/5 flex flex-col items-center"
      >
        <div className="mb-8">
          <svg className="h-16 w-16" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
            <path fill="#34A853" d="M16.04 18.013c-1.09.582-2.35.909-3.705.909a7.078 7.078 0 0 1-6.734-4.856l-4.032 3.11C3.527 21.31 7.455 24 12 24c3.055 0 5.864-1.028 8.018-2.773l-3.978-3.214Z" />
            <path fill="#4285F4" d="M23.49 12.275c0-.84-.076-1.647-.22-2.427H12v4.582h6.484a5.545 5.545 0 0 1-2.407 3.623l3.977 3.214c2.33-2.145 3.436-5.304 3.436-8.992Z" />
            <path fill="#FBBC05" d="M5.266 14.235 1.24 17.345C.447 15.732 0 13.92 0 12c0-1.92.447-3.732 1.24-5.345l4.026 3.115a7.047 7.047 0 0 0 0 4.465Z" />
          </svg>
        </div>

        <div className="space-y-2 mb-8">
          {isPolling && !error ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary h-6 w-6 animate-pulse" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">{status}</h2>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-xl",
                error ? "bg-destructive/10 text-destructive shadow-destructive/5" : "bg-green-500/10 text-green-500 shadow-green-500/5"
              )}>
                {error ? <ShieldAlert size={32} /> : <ShieldCheck size={32} />}
              </div>
              <h2 className={cn(
                "text-3xl font-black tracking-tight",
                error ? "text-destructive" : "text-foreground"
              )}>
                {error ? "Verification Failed" : "Authorized"}
              </h2>
            </div>
          )}
        </div>

        <StatusAlert error={error} className="w-full mb-8" />

        {error && (
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary h-14 px-8 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <ArrowLeft size={20} /> Back to Login
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default GoogleCallback;