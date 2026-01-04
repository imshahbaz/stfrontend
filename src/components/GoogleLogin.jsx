import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import StatusAlert from './shared/StatusAlert';

const BACKEND_CALLBACK_URL = import.meta.env.VITE_BACKEND_URL + "/api/auth/google/callback";

const GoogleLogin = () => {
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const currentUrl = window.location.origin;

  const triggerLogin = useGoogleLogin({
    flow: 'auth-code',
    ux_mode: 'redirect',
    redirect_uri: BACKEND_CALLBACK_URL,
    state: `redirect|${currentUrl}`,
  });

  const handleLoginClick = () => {
    setError('');
    setLocalLoading(true);
    triggerLogin();
    setTimeout(() => setLocalLoading(false), 1000);
  };

  return (
    <div className="w-full space-y-4">
      <button
        onClick={handleLoginClick}
        disabled={localLoading}
        className="w-full h-14 flex items-center justify-center gap-3 bg-background border border-border rounded-2xl font-bold transition-all hover:bg-muted/50 active:scale-95 disabled:opacity-50"
      >
        {localLoading ? (
          <Loader2 className="animate-spin h-5 w-5 text-primary" />
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
            />
            <path
              fill="#34A853"
              d="M16.04 18.013c-1.09.582-2.35.909-3.705.909a7.078 7.078 0 0 1-6.734-4.856l-4.032 3.11C3.527 21.31 7.455 24 12 24c3.055 0 5.864-1.028 8.018-2.773l-3.978-3.214Z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.275c0-.84-.076-1.647-.22-2.427H12v4.582h6.484a5.545 5.545 0 0 1-2.407 3.623l3.977 3.214c2.33-2.145 3.436-5.304 3.436-8.992Z"
            />
            <path
              fill="#FBBC05"
              d="M5.266 14.235 1.24 17.345C.447 15.732 0 13.92 0 12c0-1.92.447-3.732 1.24-5.345l4.026 3.115a7.047 7.047 0 0 0 0 4.465Z"
            />
          </svg>
        )}
        {localLoading ? 'Connecting...' : 'Continue with Google'}
      </button>
      <StatusAlert error={error} />
    </div>
  );
};

export default GoogleLogin;