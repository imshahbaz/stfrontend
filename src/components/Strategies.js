import React, { useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Skeleton,
  Paper,
  Grid,
  Chip,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { TrendingUp, OpenInNew, Assessment } from '@mui/icons-material';
import { useStrategies } from '../hooks/useStrategies';
import StatusAlert from './shared/StatusAlert';
import { motion, AnimatePresence } from 'framer-motion';

const Strategies = memo(() => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'background.default',
      pt: { xs: 2, md: 8 },
      pb: 12
    }}>
      <Container
        maxWidth="lg"
        disableGutters={isMobile}
        sx={{ px: { xs: 0, md: 3 } }}
      >
        <Box sx={{ mb: 6, px: { xs: 2, md: 0 } }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: `0 8px 16px ${theme.palette.primary.main}40`
              }}
            >
              <Assessment />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: '-0.5px' }}>
                Screeners
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time market analysis strategies
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* STRATEGY SELECTION - Horizontal Chips on Mobile */}
        <Box
          sx={{
            mb: 4,
            overflowX: 'auto',
            pb: 1,
            px: { xs: 2, md: 0 },
            '&::-webkit-scrollbar': { display: 'none' }
          }}
        >
          <Stack direction="row" spacing={1.5}>
            {loading && strategies.length === 0 ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" width={100} height={40} sx={{ borderRadius: 10 }} />
              ))
            ) : (
              strategies.map((strategy, index) => (
                <Chip
                  key={`${strategy.id}-${index}`}
                  label={strategy.name}
                  onClick={() => fetchStrategyData(strategy.name)}
                  variant={selectedStrategy === strategy.name ? "filled" : "outlined"}
                  color={selectedStrategy === strategy.name ? "primary" : "default"}
                  sx={{
                    px: 2,
                    py: 2.5,
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    borderRadius: '16px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                />
              ))
            )}
          </Stack>
        </Box>

        {/* RESULTS SECTION */}
        <AnimatePresence mode="wait">
          {selectedStrategy ? (
            <motion.div
              key={selectedStrategy}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Box sx={{ mt: 2 }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                  px: { xs: 2, md: 0 }
                }}>
                  <Typography variant="h6" fontWeight="800">
                    {selectedStrategy} Results
                  </Typography>
                  {loading && <CircularProgress size={20} />}
                </Box>

                <Box sx={{ px: { xs: 2, md: 0 }, mb: 3 }}>
                  <StatusAlert error={error} />
                </Box>

                <Grid
                  container
                  spacing={isMobile ? 0 : 3}
                  sx={{ width: '100%', m: 0 }}
                >
                  {strategyData.map((stock, index) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={`${stock.symbol}-${index}`}
                      sx={{
                        display: 'flex',
                        p: { xs: 0, sm: 1.5 },
                        mb: { xs: 2, sm: 0 },
                        width: '100%'
                      }}
                    >
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        style={{ width: '100%', display: 'flex' }}
                      >
                        <Paper
                          elevation={0}
                          onClick={() => handleViewChart(stock)}
                          sx={{
                            p: 2.5,
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: { xs: 0, sm: '24px' },
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            border: `1px solid ${theme.palette.divider}`,
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              borderColor: 'primary.main',
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
                              boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                            },
                            '&:active': {
                              transform: 'scale(0.98)'
                            }
                          }}
                        >
                          {/* Status Light */}
                          <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: 4,
                            bgcolor: 'success.main',
                            opacity: 0.6
                          }} />

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="h6" fontWeight="900" sx={{
                                letterSpacing: '-0.5px',
                                lineHeight: 1.2
                              }}>
                                {stock.symbol}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontWeight: 600
                              }}>
                                {stock.name}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="h6" fontWeight="800" color="success.main">
                                ₹{stock.close}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
                                <Typography variant="caption" fontWeight="700" color="success.main">
                                  LTP
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          <Box sx={{
                            display: 'flex',
                            gap: 1.5,
                            mt: 'auto',
                            pt: 2,
                            borderTop: `1px dashed ${theme.palette.divider}`
                          }}>
                            <Box sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: '10px',
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                              flex: 1
                            }}>
                              <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ display: 'block' }}>MARGIN</Typography>
                              <Typography variant="body2" fontWeight="900">{stock.margin}x</Typography>
                            </Box>
                            {stock.date && (
                              <Box sx={{
                                px: 1.5,
                                py: 0.5,
                                borderRadius: '10px',
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.05)',
                                flex: 1.5
                              }}>
                                <Typography variant="caption" color="primary.main" fontWeight="700" sx={{ display: 'block' }}>FOUND ON</Typography>
                                <Typography variant="body2" fontWeight="900" color="primary.main">{stock.date}</Typography>
                              </Box>
                            )}
                          </Box>

                          {/* Subtle Action Indicator */}
                          <Box sx={{
                            position: 'absolute',
                            right: 12,
                            bottom: 12,
                            opacity: 0.2
                          }}>
                            <OpenInNew sx={{ fontSize: 16 }} />
                          </Box>
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </motion.div>
          ) : (
            <Box
              sx={{
                py: 10,
                textAlign: 'center',
                border: `2px dashed ${theme.palette.divider}`,
                borderRadius: 6,
                opacity: 0.6
              }}
            >
              <TrendingUp sx={{ fontSize: 64, mb: 2, color: 'text.disabled' }} />
              <Typography variant="h6" fontWeight="700" color="text.secondary">
                Select a strategy to begin screening
              </Typography>
            </Box>
          )}
        </AnimatePresence>

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Button
            component={Link}
            to="/"
            variant="text"
            sx={{ fontWeight: 700, borderRadius: 3 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    </Box>
  );
});

export default Strategies;
