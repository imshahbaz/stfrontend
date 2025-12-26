import React, { useState, useEffect, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Container, Box, Typography, Chip, CircularProgress, Fade, Card, CardContent } from '@mui/material';
import { strategyAPI } from '../api/axios';

const Heatmap = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await strategyAPI.getHeatMap();
        // Sorting: Greens first (descending), then Reds
        const sorted = response.data.data.sort((a, b) => b.pChange - a.pChange);
        setData(sorted);
      } catch (err) {
        console.error("Error fetching heatmap:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const marketBreadth = useMemo(() => {
    const up = data.filter(d => d.pChange > 0).length;
    return { up, down: data.length - up };
  }, [data]);

  // Transform data for ApexCharts
  const isMobile = window.innerWidth < 600;
  const series = [{
    data: data.map(item => ({
      x: item.index,
      // We use absolute change + 1 to determine the size of the box
      y: isMobile ? 10 : Math.abs(item.pChange) + 1,
      pChange: item.pChange,
      // Explicitly setting colors: Success Green or Error Red
      fillColor: item.pChange >= 0 ? '#2e7d32' : '#d32f2f',
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
        title: { formatter: () => 'Change: ' }
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
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2
              }}>
                <Chip
                  label={`${marketBreadth.up} Advances`}
                  sx={{ bgcolor: '#2e7d32', color: 'white', fontWeight: 'bold' }}
                  size="small"
                />
                <Chip
                  label={`${marketBreadth.down} Declines`}
                  sx={{ bgcolor: '#d32f2f', color: 'white', fontWeight: 'bold' }}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
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

export default Heatmap;