import React, { useState, useEffect, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Container, Box, Typography, CircularProgress, Fade, Card, CardContent, Button } from '@mui/material';
import { strategyAPI } from '../api/axios';

const HeatmapV2 = () => {
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
    return { up, down: data.length - up };
  }, [data]);

  const getColor = (pChange) => {
    if (pChange <= -1.2) return '#8E161B'; // Strong Bearish
    if (pChange <= -0.8) return '#D32F2F'; // Bearish
    if (pChange <= -0.4) return '#E57373'; // Weak Bearish
    if (pChange < 0.4) return '#424242'; // Neutral
    if (pChange < 0.8) return '#81C784'; // Weak Bullish
    if (pChange < 1.2) return '#388E3C'; // Bullish
    return '#004D20'; // Strong Bullish
  };

  // Transform data for ApexCharts
  const isMobile = window.innerWidth < 600;
  const series = [{
    data: data.map(item => ({
      x: item.indexSymbol,
      // We use absolute change + 1 to determine the size of the box
      y: isMobile ? 10 : Math.abs(item.percentChange) + 1,
      pChange: item.percentChange,
      // Explicitly setting colors based on pChange ranges
      fillColor: getColor(item.percentChange),
    }))
  }];

  const options = {
    legend: { show: false },
    chart: {
      toolbar: { show: false },
      animations: { enabled: true }
    },
    plotOptions: {
      treemap: {
        enableShades: true,
        shadeIntensity: 0.5,
        distributed: true,
        dataLabels: { format: 'scale' }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: isMobile ? '12px' : '14px',
        fontWeight: 'bold',
      },
      // This includes the percentage inside the tile
      formatter: function (text, op) {
        const actualChange = op.w.config.series[op.seriesIndex].data[op.dataPointIndex].pChange;
        return [text, `${actualChange > 0 ? '+' : ''}${actualChange}%`];
      },
      offsetY: -4
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val, { seriesIndex, dataPointIndex, w }) => {
          const item = w.config.series[seriesIndex].data[dataPointIndex];
          return `${item.pChange}%`;
        },
        title: {
          formatter: (seriesName, { seriesIndex, dataPointIndex, w }) => {
            const item = w.config.series[seriesIndex].data[dataPointIndex];
            return `${item.x}: `;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={1000}>
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 5 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h3" component="h1" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
            Market Heatmap
          </Typography>

          {/* Market Breadth Header */}
          <Box sx={{ borderRadius: 2, boxShadow: 1, overflow: 'hidden', mb: 0 }}>
            <Box sx={{ display: 'flex' }}>
              <Box
                sx={{
                  width: '50%',
                  bgcolor: '#2e7d32',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 3,
                  px: 2
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  {marketBreadth.up} Advances
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '50%',
                  bgcolor: '#d32f2f',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 3,
                  px: 2
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  {marketBreadth.down} Declines
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button variant={selectedPeriod === 'D' ? 'contained' : 'outlined'} onClick={() => setSelectedPeriod('D')} sx={{ mx: 1 }}>D</Button>
          <Button variant={selectedPeriod === 'W' ? 'contained' : 'outlined'} onClick={() => setSelectedPeriod('W')} sx={{ mx: 1 }}>W</Button>
          <Button variant={selectedPeriod === 'M' ? 'contained' : 'outlined'} onClick={() => setSelectedPeriod('M')} sx={{ mx: 1 }}>M</Button>
          <Button variant={selectedPeriod === 'Y' ? 'contained' : 'outlined'} onClick={() => setSelectedPeriod('Y')} sx={{ mx: 1 }}>Y</Button>
        </Box>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Chart
              options={options}
              series={series}
              type="treemap"
              height={isMobile ? 750 : 600}
            />
          </CardContent>
        </Card>
      </Container>
    </Fade>
  );
};

export default HeatmapV2;