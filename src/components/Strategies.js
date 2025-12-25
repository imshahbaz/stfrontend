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
  useMediaQuery,
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

  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <Container maxWidth="lg" sx={{ flexGrow: 1, py: 5 }}>
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <TrendingUp sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
          Available Strategies
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Explore and select a strategy to analyze the market.
        </Typography>
      </Box>

      {/* Strategy Selection Table */}
      <Card sx={{ boxShadow: 3, mb: 4 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Strategy Name</TableCell>
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
                          sx={{ textTransform: 'none', justifyContent: 'flex-start', width: '100%' }}
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

      {/* Results Section */}
      <Collapse in={!!selectedStrategy}>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h3" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
            Results for: {selectedStrategy}
          </Typography>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 3 }}>
              <CircularProgress size={24} />
              <Typography sx={{ ml: 2 }}>Refreshing data...</Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {strategyData.length > 0 && (
            isMobile ? (
              /* MOBILE VIEW: ONE FULL-WIDTH CARD PER ROW */
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {strategyData.map((stock, index) => (
                  <Card
                    key={`${stock.symbol}-${index}`}
                    sx={{
                      boxShadow: 2,
                      width: '100%', // Ensures full width
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                          {stock.symbol}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          ₹{stock.close}
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {stock.name}
                      </Typography>

                      <Box sx={{ display: 'flex', mt: 2, gap: 4 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Margin</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{stock.margin}x</Typography>
                        </Box>
                        {/* You can add more metrics here like Volume or Change % */}
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleViewChart(stock)}
                        sx={{ mt: 3, borderRadius: 1.5, py: 1 }}
                      >
                        View Chart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              /* DESKTOP TABLE VIEW */
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
                          <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {strategyData.map((stock, index) => (
                          <TableRow key={`${stock.symbol}-${index}`} hover>
                            <TableCell sx={{ fontWeight: 'medium' }}>{stock.symbol}</TableCell>
                            <TableCell>{stock.name}</TableCell>
                            <TableCell>₹{stock.close}</TableCell>
                            <TableCell>{stock.margin}%</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
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
            )
          )}
        </Box>
      </Collapse>

      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Button component={Link} to="/" variant="text" size="large">
          Back to Home
        </Button>
      </Box>
    </Container>
  );
});

export default Strategies;