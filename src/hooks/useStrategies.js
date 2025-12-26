import { useReducer, useCallback } from 'react';
import { strategyAPI } from '../api/axios';

const initialState = {
  strategies: [],
  selectedStrategy: null,
  strategyData: [],
  loading: false,
  error: '',
  cache: {},
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_STRATEGIES':
      return { ...state, strategies: action.payload || [] };
    case 'SET_SELECTED_STRATEGY':
      return { ...state, selectedStrategy: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_STRATEGY_DATA':
      return { ...state, strategyData: action.payload || [] };
    case 'SET_CACHE':
      return { ...state, cache: { ...state.cache, [action.key]: action.payload } };
    default:
      return state;
  }
};

export const useStrategies = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchStrategies = useCallback(async () => {
    try {
      const response = await strategyAPI.getStrategies();
      dispatch({ type: 'SET_STRATEGIES', payload: response.data });
    } catch (error) {
      console.error('Error fetching strategies:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load strategies' });
    }
  }, []);

  const fetchStrategyData = useCallback(async (strategyName, retryCount = 0) => {
    if (state.selectedStrategy === strategyName) {
      dispatch({ type: 'SET_SELECTED_STRATEGY', payload: null });
      return;
    }

    dispatch({ type: 'SET_SELECTED_STRATEGY', payload: strategyName });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: '' });
    dispatch({ type: 'SET_STRATEGY_DATA', payload: [] });

    if (state.cache[strategyName]) {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_STRATEGY_DATA', payload: state.cache[strategyName] });
      return;
    }

    try {
      const response = await strategyAPI.fetchWithMargin(strategyName);
      dispatch({ type: 'SET_CACHE', key: strategyName, payload: response.data });
      dispatch({ type: 'SET_STRATEGY_DATA', payload: response.data });
    } catch (error) {
      if (retryCount < 2) {
        setTimeout(() => fetchStrategyData(strategyName, retryCount + 1), 1000 * (retryCount + 1));
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Error fetching data: ' + error.message });
        console.error('Error:', error);
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.selectedStrategy, state.cache]);

  return {
    strategies: state.strategies,
    selectedStrategy: state.selectedStrategy,
    strategyData: state.strategyData,
    loading: state.loading,
    error: state.error,
    fetchStrategies,
    fetchStrategyData,
  };
};
