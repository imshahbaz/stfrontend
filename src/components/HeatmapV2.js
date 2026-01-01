import React, { useState, useEffect, useMemo } from 'react';
import Chart from 'react-apexcharts';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Fade,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import { strategyAPI } from '../api/axios';
import { GridView, TrendingUp, TrendingDown } from '@mui/icons-material';

const HeatmapV2 = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [rawData, setRawData] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('D');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await strategyAPI.getAllIndices();
      setRawData(response.data.data);
    } catch (err) {
      console.error("Error fetching heatmap:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPercentChange = (item, period) => {
    switch (period) {
      case 'D': return item.percentChange;
      case 'W': return item.perChange1w;
      case 'M': return item.perChange30d;
      case 'Y': return item.perChange365d;
      default: return item.percentChange;
    }
  };

  useEffect(() => {
    if (rawData.length > 0) {
      const transformed = rawData.map(item => ({
        ...item,
        percentChange: getPercentChange(item, selectedPeriod)
      }));
      const sorted = transformed.sort((a, b) => b.percentChange - a.percentChange);
      setData(sorted);
    }
  }, [rawData, selectedPeriod]);

  const marketBreadth = useMemo(() => {
    const up = data.filter(d => d.percentChange > 0).length;
    return {
      up,
      down: data.length - up,
      percentUp: (up / data.length) * 100
    };
  }, [data]);

  const getColor = (pChange) => {
    if (pChange <= -1.2) return '#ef4444'; // Red 500
    if (pChange <= -0.8) return '#f87171'; // Red 400
    if (pChange <= -0.4) return '#fca5a5'; // Red 300
    if (pChange < 0.4) return '#64748b'; // Slate 500
    if (pChange < 0.8) return '#86efac'; // Green 300
    if (pChange < 1.2) return '#4ade80'; // Green 400
    return '#22c55e'; // Green 500
  };

  const series = [{
    data: data.map(item => ({
      x: item.indexSymbol,
      y: isMobile ? 10 : Math.abs(item.percentChange) + 1,
      pChange: item.percentChange,
      fillColor: getColor(item.percentChange),
    }))
  }];

  const options = {
    legend: { show: false },
    chart: {
      toolbar: { show: false },
      animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    plotOptions: {
      treemap: {
        enableShades: false,
        distributed: true,
        dataLabels: { format: 'scale' }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: isMobile ? '10px' : '14px',
        fontWeight: '900',
        fontFamily: theme.typography.fontFamily
      },
      formatter: function (text, op) {
        const actualChange = op.w.config.series[op.seriesIndex].data[op.dataPointIndex].pChange;
        return [text, `${actualChange > 0 ? '+' : ''}${actualChange}%`];
      },
      offsetY: -2
    },
    stroke: { show: true, width: 2, colors: [theme.palette.background.paper] },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (val, { seriesIndex, dataPointIndex, w }) => {
          const item = w.config.series[seriesIndex].data[dataPointIndex];
          return `${item.pChange}%`;
        }
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress thickness={5} size={60} />
        <Typography sx={{ mt: 2, fontWeight: 700, opacity: 0.6 }}>Loading Market Data...</Typography>
      </Box>
    );
  }

  return (
    <Fade in={true}>
      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 8 }, pb: 12 }}>
        <Box sx={{ mb: 6 }}>
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
              <GridView />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: '-0.5px' }}>
                Indices Heatmap
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sectoral performance and market sentiment
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Market Breadth Bar */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, px: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TrendingUp color="success" />
              <Typography fontWeight="800" color="success.main">{marketBreadth.up} Advances</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography fontWeight="800" color="error.main">{marketBreadth.down} Declines</Typography>
              <TrendingDown color="error" />
            </Stack>
          </Box>
          <Box sx={{
            height: 12,
            width: '100%',
            bgcolor: 'error.main',
            borderRadius: 6,
            overflow: 'hidden',
            display: 'flex',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{
              width: `${marketBreadth.percentUp}%`,
              height: '100%',
              bgcolor: 'success.main',
              transition: 'width 1s ease-in-out'
            }} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <ToggleButtonGroup
            value={selectedPeriod}
            exclusive
            onChange={(e, val) => val && setSelectedPeriod(val)}
            size="small"
            sx={{
              bgcolor: 'background.paper',
              p: 0.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              '& .MuiToggleButton-root': {
                px: 3,
                py: 1,
                borderRadius: 2.5,
                border: 'none',
                fontWeight: 800,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: '#fff',
                  '&:hover': { bgcolor: 'primary.dark' }
                }
              }
            }}
          >
            <ToggleButton value="D">Daily</ToggleButton>
            <ToggleButton value="W">Weekly</ToggleButton>
            <ToggleButton value="M">Monthly</ToggleButton>
            <ToggleButton value="Y">Yearly</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Card sx={{ borderRadius: 6, overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <CardContent sx={{ p: isMobile ? 1 : 3 }}>
            <Chart
              options={options}
              series={series}
              type="treemap"
              height={isMobile ? 600 : 600}
            />
          </CardContent>
        </Card>
      </Container>
    </Fade>
  );
};

export default HeatmapV2;
