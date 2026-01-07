import { useState, useRef, useCallback, useEffect } from 'react';
import { truecallerAPI } from '../api/axios';
import { useAuth } from "../context/AuthContext";

const useTruecallerPolling = (onSuccess, onError) => {
  const [status, setStatus] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const pollingInterval = useRef(null);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const initialInterval = 2500;
  const maxInterval = 10000;
  const backoffFactor = 1.5;
  const { setAuthLoading } = useAuth();

  // Use refs to avoid re-creating startPolling when callbacks change
  const successRef = useRef(onSuccess);
  const errorRef = useRef(onError);

  useEffect(() => {
    successRef.current = onSuccess;
    errorRef.current = onError;
  }, [onSuccess, onError]);

  const clearPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearTimeout(pollingInterval.current);
      pollingInterval.current = null;
    }
    setIsPolling(false);
    setAuthLoading(false);
  }, [setAuthLoading]);

  const startPolling = useCallback((requestId) => {
    setIsPolling(true);
    setAuthLoading(true);
    setStatus('Verifying via Truecaller...');
    retryCount.current = 0;
    let currentInterval = initialInterval;

    const poll = async () => {
      if (!pollingActiveRef.current) return;

      try {
        const res = await truecallerAPI.getTruecallerStatus(requestId);
        if (!pollingActiveRef.current) return;

        if (res.status === 200 || res.status === 201) {
          setStatus('Login Successful!');
          successRef.current?.(res.data.data);
          clearPolling();
        } else {
          setStatus('Still verifying...');
          pollingInterval.current = setTimeout(poll, currentInterval);
        }
      } catch (e) {
        if (!pollingActiveRef.current) return;

        retryCount.current += 1;
        if (retryCount.current >= maxRetries) {
          setStatus('Verification failed. Please try again.');
          errorRef.current?.(e);
          clearPolling();
        } else {
          setStatus(`Retrying verification... (${retryCount.current}/${maxRetries})`);
          currentInterval = Math.min(currentInterval * backoffFactor, maxInterval);
          pollingInterval.current = setTimeout(poll, currentInterval);
        }
      }
    };

    const pollingActiveRef = { current: true };
    const originalClear = clearPolling;
    pollingInterval.current = setTimeout(poll, 0);

    // Stop polling after 2 minutes
    const timeoutId = setTimeout(() => {
      if (pollingActiveRef.current) {
        setStatus('Verification timed out. Please try again.');
        clearPolling();
      }
    }, 120000);

    return () => {
      pollingActiveRef.current = false;
      clearTimeout(timeoutId);
    };
  }, [clearPolling, setAuthLoading]);

  useEffect(() => {
    return () => clearPolling();
  }, [clearPolling]);

  return { status, startPolling, clearPolling };
};

export default useTruecallerPolling;
