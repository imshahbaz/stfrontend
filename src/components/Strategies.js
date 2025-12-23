import React, { useEffect, useState } from 'react';
import { strategyAPI } from '../api/axios';
import { Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Collapse,
} from '@mui/material';
import { TrendingUp, ShoppingCart } from '@mui/icons-material';

const Strategies = () => {
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [strategyData, setStrategyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cache, setCache] = useState({});

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const response = await strategyAPI.getStrategies();
        setStrategies(response.data);
      } catch (error) {
        console.error('Error fetching strategies:', error);
      }
    };
    fetchStrategies();

    // Load KiteConnect script
    const script = document.createElement('script');
    script.src = 'https://kite.trade/publisher.js?v=3';
    document.head.appendChild(script);
  }, []);

  const fetchStrategyData = async (strategyName) => {
    // Toggle logic: If already showing this strategy, close it
    if (selectedStrategy === strategyName) {
      setSelectedStrategy(null);
      return;
    }

    setSelectedStrategy(strategyName);
    setLoading(true);
    setError('');
    setStrategyData([]);

    // Check cache
    if (cache[strategyName]) {
      setLoading(false);
      setStrategyData(cache[strategyName]);
      return;
    }

    try {
      const response = await strategyAPI.fetchWithMargin(strategyName);
      // Store in cache
      setCache(prev => ({ ...prev, [strategyName]: response.data }));
      setStrategyData(response.data);
    } catch (error) {
      setError('Error fetching data: ' + error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = (stock) => {
    const kite = new window.KiteConnect("kitedemo");
    kite.add({
      "exchange": "NSE",
      "tradingsymbol": stock.symbol,
      "quantity": 1,
      "transaction_type": "BUY",
      "order_type": "MARKET",
      "product": "CNC"
    });
    kite.connect();
  };

  return (
    <Container maxWidth="lg" sx={{ flexGrow: 1, py: 5 }}>
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <TrendingUp sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" color="primary" gutterBottom>
          Available Strategies
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Explore and select a strategy to analyze the market.
        </Typography>
      </Box>

      <Card sx={{ boxShadow: 3, mb: 4 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {strategies.map((strategy, index) => (
                  <TableRow key={`${strategy.id}-${index}`} hover>
                    <TableCell>
                      <Button
                        variant="text"
                        onClick={() => fetchStrategyData(strategy.name)}
                        sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                      >
                        {strategy.name}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {strategies.length === 0 && (
                  <TableRow>
                    <TableCell sx={{ textAlign: 'center' }}>No strategies found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Collapse in={!!selectedStrategy}>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h3" color="primary" gutterBottom>
            Results for: {selectedStrategy}
          </Typography>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading data...</Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {strategyData.length > 0 && (
            <Card sx={{ boxShadow: 3 }}>
              <CardContent sx={{ p: 0 }}>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead sx={{ backgroundColor: 'primary.main' }}>
                      <TableRow>
                        <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>NSE Code</TableCell>
                        <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Close Price</TableCell>
                        <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Margin</TableCell>
                        <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {strategyData.map((stock, index) => (
                        <TableRow key={`${stock.symbol}-${index}`} hover>
                          <TableCell>{stock.symbol}</TableCell>
                          <TableCell>{stock.name}</TableCell>
                          <TableCell>{stock.close}</TableCell>
                          <TableCell>{stock.margin}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              startIcon={<ShoppingCart />}
                              onClick={() => handleBuy(stock)}
                              size="small"
                            >
                              Buy
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Box>
      </Collapse>

      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Button component={Link} to="/" variant="outlined" size="large">
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default Strategies;
