import { useState, useCallback, useRef, useEffect } from 'react';
import { googleAPI } from '../api/axios';

const useGooglePolling = (onSuccess, onError) => {
  const [status, setStatus] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  
  const pollingActive = useRef(false);
  const timerRef = useRef(null);
  const attemptsRef = useRef(0);

  const clearPolling = useCallback(() => {
    pollingActive.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback((code, state) => {
    if (pollingActive.current) return;
    
    pollingActive.current = true;
    setIsPolling(true);
    attemptsRef.current = 0;
    setStatus('Waiting for Google authorization...');

    const INITIAL_WAIT = 2000; 
    const POLL_INTERVAL = 3000;
    const MAX_ATTEMPTS = 10;
    
    const executeSinglePoll = async () => {
      if (!pollingActive.current) return;
      
      attemptsRef.current++;

      if (attemptsRef.current > MAX_ATTEMPTS) {
        onError("Verification timed out. Please try again.");
        clearPolling();
        return;
      }

      try {
        const res = await googleAPI.googleCallback(code, state);
        
        if (res.status === 200 || res.status === 201) {
          onSuccess(res.data.data);
          clearPolling();
          return;
        }
      } catch (err) {
        const httpStatus = err.response?.status;

        if (httpStatus === 404) {
          
        } else {
          onError(err.response?.data?.detail || "Auth Error");
          clearPolling();
          return;
        }
      }

      if (pollingActive.current) {
        timerRef.current = setTimeout(executeSinglePoll, POLL_INTERVAL);
      }
    };

    timerRef.current = setTimeout(executeSinglePoll, INITIAL_WAIT);

  }, [onSuccess, onError, clearPolling]);

  useEffect(() => {
    return () => clearPolling();
  }, [clearPolling]);

  return { status, isPolling, startPolling, clearPolling };
};

export default useGooglePolling;