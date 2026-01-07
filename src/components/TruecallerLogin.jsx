import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Loader2 } from 'lucide-react';
import { truecallerAPI } from '../api/axios';
import useTruecallerPolling from '../hooks/useTruecallerPolling';
import { cn } from '../lib/utils';

const TruecallerLogin = ({
  login,
  setError,
  refreshUserData }) => {
  const navigate = useNavigate();
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const isLoading = internalIsLoading;

  const { startPolling, clearPolling } = useTruecallerPolling(
    async (data) => {
      setInternalIsLoading(false);
      login(data);
    },
    (error) => {
      console.error('Truecaller polling error:', error);
      setInternalIsLoading(false);
      setError('Verification failed or timed out. Please try again.');
    }
  );

  const generateNonce = () => crypto.randomUUID();

  const handleLogin = () => {
    setError('');

    // Basic mobile check - Truecaller SDK only works on mobile devices with the app installed
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      setError('Truecaller login is only available on mobile devices.');
      return;
    }

    const requestId = generateNonce();
    setInternalIsLoading(true);

    // Attempt to launch Truecaller
    window.location.href = truecallerAPI.truecallerLogin(requestId);

    // If after 1.5s the document still has focus, the app likely didn't launch
    setTimeout(() => {
      if (document.hasFocus()) {
        setInternalIsLoading(false);
        clearPolling();
        setError('Truecaller app is not installed or failed to open.');
      } else {
        startPolling(requestId);
      }
    }, 1500);
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={cn(
        "w-full h-14 flex items-center justify-center gap-3 bg-background border border-border rounded-2xl font-bold transition-all hover:bg-muted/50 active:scale-95 disabled:opacity-50",
        isLoading && "opacity-70"
      )}
    >
      {isLoading ? (
        <Loader2 className="animate-spin h-5 w-5 text-[#0087FF]" />
      ) : (
        <Smartphone className="h-5 w-5 text-[#0087FF]" />
      )}
      {isLoading ? 'Verifying with Phone...' : 'Continue with Truecaller'}
    </button>
  );
};

export default TruecallerLogin;