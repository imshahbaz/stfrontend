import { useState, useRef, useCallback, useEffect } from 'react';
import { truecallerAPI } from '../api/axios';

const useTruecallerPolling = (onSuccess, onError) => {
  const [status, setStatus] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const pollingTimeout = useRef(null);

  const clearPolling = useCallback(() => {
    if (pollingTimeout.current) {
      clearTimeout(pollingTimeout.current);
      pollingTimeout.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback((requestId) => {
    if (isPolling) return;
    setIsPolling(true);
    setStatus('Verifying via Truecaller...');
    let attempts = 0;
    const maxAttempts = 5;
    const interval = 3000; // 3 seconds

    const poll = async () => {
      attempts += 1;
      try {
        const res = await truecallerAPI.getTruecallerStatus(requestId);

        if (res.status === 200 || res.status === 201) {
          setStatus('Login Successful!');
          onSuccess(res.data.data);
          clearPolling();
          return;
        } else {
          setStatus(`Still verifying... (${attempts}/${maxAttempts})`);
        }
      } catch (e) {
        setStatus(`Verification failed on attempt ${attempts}. Please try again.`);
        onError && onError(e);
        clearPolling();
        return;
      }

      if (attempts < maxAttempts) {
        pollingTimeout.current = setTimeout(poll, interval);
      } else {
        setStatus('Verification failed after 5 attempts. Please try again.');
        clearPolling();
      }
    };

    poll(); // Initial poll
  }, [isPolling, onSuccess, onError, clearPolling]);

  useEffect(() => {
    return () => clearPolling();
  }, [clearPolling]);

  return { status, startPolling, clearPolling };
};

export default useTruecallerPolling;
