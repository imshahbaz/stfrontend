import { useState, useRef, useCallback, useEffect } from 'react';
import { truecallerAPI } from '../api/axios';

const useTruecallerPolling = (onSuccess, onError) => {
  const [status, setStatus] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const pollingInterval = useRef(null);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const initialInterval = 2500;
  const maxInterval = 10000;
  const backoffFactor = 1.5;

  const clearPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearTimeout(pollingInterval.current);
      pollingInterval.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback((requestId) => {
    if (isPolling) return;
    setIsPolling(true);
    setStatus('Verifying via Truecaller...');
    retryCount.current = 0;
    let currentInterval = initialInterval;

    const poll = async () => {
      if (!pollingInterval.current) return;

      try {
        const res = await truecallerAPI.getTruecallerStatus(requestId);
        if (!pollingInterval.current) return;

        if (res.status === 200 || res.status === 201) {
          setStatus('Login Successful!');
          onSuccess(res.data.data);
          clearPolling();
        } else {
          setStatus('Still verifying...');
          pollingInterval.current = setTimeout(poll, currentInterval);
        }
      } catch (e) {
        if (!pollingInterval.current) return;

        retryCount.current += 1;
        if (retryCount.current >= maxRetries) {
          setStatus('Verification failed. Please try again.');
          onError && onError(e);
          clearPolling();
        } else {
          setStatus(`Retrying verification... (${retryCount.current}/${maxRetries})`);
          // Exponential backoff
          currentInterval = Math.min(currentInterval * backoffFactor, maxInterval);
          pollingInterval.current = setTimeout(poll, currentInterval);
        }
      }
    };

    pollingInterval.current = setTimeout(poll, 0);

    // Stop polling after 2 minutes
    setTimeout(() => {
      if (isPolling) {
        setStatus('Verification timed out. Please try again.');
        clearPolling();
      }
    }, 120000);
  }, [isPolling, onSuccess, onError, clearPolling]);

  useEffect(() => {
    return () => clearPolling();
  }, [clearPolling]);

  return { status, startPolling, clearPolling };
};

export default useTruecallerPolling;
