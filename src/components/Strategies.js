import React, { useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Skeleton,
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { useStrategies } from '../hooks/useStrategies';

const Strategies = memo(() => {
  const navigate = useNavigate();

  const {
    strategies,
    selectedStrategy,
    strategyData,
    loading,
    error,
    fetchStrategies,
    fetchStrategyData,
  } = useStrategies();

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  const handleViewChart = (stock) => {
    navigate(`/chart/${stock.symbol}`);
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
                {loading && strategies.length === 0 ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <Skeleton variant="text" width="60%" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  strategies.map((strategy, index) => (
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
                  ))
                )}
                {strategies.length === 0 && !loading && (
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
                        <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Actions</TableCell>
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
                            {/* <Button
                              variant="contained"
                              startIcon={<ShoppingCart />}
                              onClick={() => handleBuy(stock)}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              Buy
                            </Button> */}
                            <Button
                              variant="outlined"
                              onClick={() => handleViewChart(stock)}
                              size="small"
                            >
                              View Chart
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
});

export default Strategies;
