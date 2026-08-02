import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchStrategies } from '../api/service';
import { useAuth } from './AuthContext';

const StrategyContext = createContext(null);

export function StrategyProvider({ children }) {
  const { user } = useAuth();
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const loadStrategies = useCallback(async (force = false) => {
    if (loadedOnce && !force) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchStrategies();
      setStrategies(Array.isArray(data) ? data : []);
      setLoadedOnce(true);
    } catch (err) {
      console.error('Failed to fetch strategies:', err);
      setError(err instanceof Error ? err.message : 'Failed to load strategies');
    } finally {
      setLoading(false);
    }
  }, [loadedOnce]);

  const refreshStrategies = useCallback(async () => {
    return loadStrategies(true);
  }, [loadStrategies]);

  useEffect(() => {
    if (user && !loadedOnce) {
      loadStrategies();
    } else if (!user) {
      setStrategies([]);
      setLoadedOnce(false);
    }
  }, [user, loadedOnce, loadStrategies]);

  return (
    <StrategyContext.Provider
      value={{
        strategies,
        setStrategies,
        loading,
        error,
        loadedOnce,
        loadStrategies,
        refreshStrategies,
      }}
    >
      {children}
    </StrategyContext.Provider>
  );
}

export function useStrategies() {
  const context = useContext(StrategyContext);
  if (!context) {
    throw new Error('useStrategies must be used within a StrategyProvider');
  }
  return context;
}
