import { useReducer, useCallback, useEffect } from 'react';
import { strategyAPI, priceActionAPI } from '../api/axios';

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
    case 'HYDRATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const useStrategies = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Restore state from sessionStorage ONLY if returning from chart
  useEffect(() => {
    const returningFlag = sessionStorage.getItem('returning_from_chart');
    if (returningFlag === 'true') {
      const savedState = sessionStorage.getItem('strategies_state');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          dispatch({ type: 'HYDRATE', payload: parsed });
        } catch (e) {
          console.error('Failed to restore strategies state', e);
        }
      }
      // Clear the flag after restoration
      sessionStorage.removeItem('returning_from_chart');
    }
  }, []);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (state.selectedStrategy) {
      const stateToSave = {
        selectedStrategy: state.selectedStrategy,
        strategyData: state.strategyData,
        cache: state.cache
      };
      sessionStorage.setItem('strategies_state', JSON.stringify(stateToSave));
    }
  }, [state.selectedStrategy, state.strategyData, state.cache]);

  const fetchStrategies = useCallback(async () => {
    try {
      const response = await strategyAPI.getStrategies();
      const apiData = Array.isArray(response.data.data) ? response.data.data : [];
      const strategiesWithOrderBlock = [...apiData, { name: 'Order Block' }, { name: 'Fair Value Gap' }];
      dispatch({ type: 'SET_STRATEGIES', payload: strategiesWithOrderBlock });
    } catch (error) {
      console.error('Error fetching strategies:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load strategies' });
    }
  }, []);

  const fetchStrategyData = useCallback(async (strategyName, retryCount = 0) => {
    // If the strategy is already selected, toggle it off
    if (state.selectedStrategy === strategyName) {
      dispatch({ type: 'SET_SELECTED_STRATEGY', payload: null });
      dispatch({ type: 'SET_STRATEGY_DATA', payload: [] });
      return;
    }

    dispatch({ type: 'SET_SELECTED_STRATEGY', payload: strategyName });

    // Check cache first
    if (state.cache[strategyName]) {
      dispatch({ type: 'SET_STRATEGY_DATA', payload: state.cache[strategyName] });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: '' });
    dispatch({ type: 'SET_STRATEGY_DATA', payload: [] });

    try {
      let response;
      if (strategyName === 'Order Block') {
        response = await priceActionAPI.checkOrderBlock();
        dispatch({ type: 'SET_CACHE', key: strategyName, payload: response.data.data });
        dispatch({ type: 'SET_STRATEGY_DATA', payload: response.data.data });
      } else if (strategyName === 'Fair Value Gap') {
        response = await priceActionAPI.checkFVGMitigation();
        dispatch({ type: 'SET_CACHE', key: strategyName, payload: response.data.data });
        dispatch({ type: 'SET_STRATEGY_DATA', payload: response.data.data });
      } else {
        response = await strategyAPI.fetchWithMargin(strategyName);
        dispatch({ type: 'SET_CACHE', key: strategyName, payload: response.data.data });
        dispatch({ type: 'SET_STRATEGY_DATA', payload: response.data.data });
      }
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
