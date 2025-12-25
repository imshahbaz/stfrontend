import { useState, useCallback } from 'react';
import { strategyAPI } from '../api/axios';

export const useChartData = () => {
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState('');

  const fetchChartData = useCallback(async (symbol, retryCount = 0) => {
    setChartLoading(true);
    setChartError('');
    setChartData([]);

    try {
      const response = await strategyAPI.fetchChartData(symbol);
      setChartData(response.data);
    } catch (error) {
      if (retryCount < 2) {
        setTimeout(() => fetchChartData(symbol, retryCount + 1), 1000 * (retryCount + 1));
      } else {
        setChartError('Error fetching chart data: ' + error.message);
        console.error('Error fetching chart data:', error);
      }
    } finally {
      setChartLoading(false);
    }
  }, []);

  return {
    chartData,
    chartLoading,
    chartError,
    fetchChartData,
  };
};
