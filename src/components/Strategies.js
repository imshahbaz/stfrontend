import React, { useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Collapse,
  Skeleton,
  Grid,
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
        <Typography variant="h3" component="h1" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
          Available Strategies
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Explore and select a strategy to analyze the market.
        </Typography>
      </Box>

      {/* STRATEGY SELECTION - Standard Grid (No horizontal scroll) */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {loading && strategies.length === 0 ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} md={6} key={`skel-strat-${index}`}>
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
            </Grid>
          ))
        ) : (
          strategies.map((strategy, index) => (
            <Grid item xs={12} md={6} key={`${strategy.id}-${index}`}>
              <Card sx={{ boxShadow: 3 }}>
                <Button
                  variant="text"
                  onClick={() => fetchStrategyData(strategy.name)}
                  sx={{
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    width: '100%',
                    px: 3,
                    py: 2,
                    color: selectedStrategy === strategy.name ? 'primary.main' : 'inherit',
                    fontWeight: selectedStrategy === strategy.name ? 'bold' : 'normal'
                  }}
                >
                  {strategy.name}
                </Button>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* RESULTS SECTION */}
      <Collapse in={!!selectedStrategy}>
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" component="h3" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
            Results for: {selectedStrategy}
          </Typography>

          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <CircularProgress size={20} />
              <Typography sx={{ ml: 2 }}>Updating results...</Typography>
            </Box>
          )}

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* STOCK DATA - Horizontal scroll on mobile ONLY */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: { xs: 'nowrap', md: 'wrap' }, // Scroll on mobile, wrap on desktop
              overflowX: { xs: 'auto', md: 'unset' }, // Enable scroll on mobile
              gap: { xs: 2, md: 0 },
              pb: { xs: 3, md: 0 }, // Room for scrollbar
              px: { xs: 1, md: 0 },
              '&::-webkit-scrollbar': { height: '6px' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '10px' }
            }}
          >
            {strategyData.map((stock, index) => (
              <Box
                key={`${stock.symbol}-${index}`}
                sx={{
                  minWidth: { xs: '85vw', md: 'auto' }, // Very wide cards on mobile
                  flex: { md: '0 0 50%' }, // 2 cards per row on desktop
                  p: 1,
                  display: 'flex'
                }}
              >
                <Card
                  sx={{
                    boxShadow: 2,
                    width: '100%',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                        {stock.symbol}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        ₹{stock.close}
                      </Typography>
                    </Box>

                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {stock.name}
                    </Typography>

                    <Box sx={{ display: 'flex', mt: 'auto', pt: 3, gap: 4 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Margin</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'medium' }}>{stock.margin}x</Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleViewChart(stock)}
                      sx={{ mt: 3, borderRadius: 1.5, py: 1.5 }}
                    >
                      View Chart
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
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