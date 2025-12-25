import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import FinancialChart from './FinancialChart';
import { useChartData } from '../hooks/useChartData';

const ChartPage = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { chartData, chartLoading, chartError, fetchChartData } = useChartData();

  useEffect(() => {
    if (symbol) {
      fetchChartData(symbol);
    }
  }, [symbol, fetchChartData]);

  return (
    <Box sx={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          variant="outlined"
          sx={{ mb: 1 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" color="primary">
          Chart for {symbol}
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
        {chartLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading chart data...</Typography>
          </Box>
        ) : chartError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {chartError}
          </Alert>
        ) : (
          <FinancialChart rawData={chartData} height="100%" />
        )}
      </Box>
    </Box>
  );
};

export default ChartPage;
