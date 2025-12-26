import React, { useState, useEffect, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Container, Box, Typography, Chip, CircularProgress } from '@mui/material';
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
  const series = [{
    data: data.map(item => ({
      x: item.index,
      // We use absolute change + 1 to determine the size of the box
      y: Math.abs(item.pChange) + 1, 
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
        distributed: true // Required to use the fillColor from data
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
      },
      // This includes the percentage inside the tile
      formatter: function(text, op) {
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
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          Market Heatmap
        </Typography>
        
        {/* Market Breadth Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: 2, 
          bgcolor: 'action.hover', 
          p: 1.5, 
          borderRadius: 2 
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
      </Box>

      <Box sx={{ 
        bgcolor: 'background.paper', 
        borderRadius: 2, 
        p: 1, 
        boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
        minHeight: '500px'
      }}>
        <Chart 
          options={options} 
          series={series} 
          type="treemap" 
          height={window.innerWidth < 600 ? 500 : 600} 
        />
      </Box>
    </Container>
  );
};

export default Heatmap;