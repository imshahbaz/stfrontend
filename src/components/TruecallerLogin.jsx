import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Loader2 } from 'lucide-react';
import { truecallerAPI } from '../api/axios';
import useTruecallerPolling from '../hooks/useTruecallerPolling';
import { cn } from '../lib/utils';

const TruecallerLogin = ({ login, user, loading, isLoading: externalIsLoading = false, refreshUserData }) => {
  const navigate = useNavigate();
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const isLoading = externalIsLoading || internalIsLoading;

  const { startPolling, clearPolling } = useTruecallerPolling(
    async (data) => {
      setInternalIsLoading(false);
      login(data);
      await refreshUserData()
      navigate('/', { replace: true });
    },
    (error) => {
      console.error('Truecaller polling error:', error);
      setInternalIsLoading(false);
    }
  );

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const generateNonce = () => crypto.randomUUID();

  const handleLogin = () => {
    const requestId = generateNonce();

    setInternalIsLoading(true);
    window.location.href = truecallerAPI.truecallerLogin(requestId);

    setTimeout(() => {
      if (document.hasFocus()) {
        setInternalIsLoading(false);
        clearPolling();
      } else {
        startPolling(requestId);
      }
    }, 1000);
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