import React, { useState, useEffect, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { strategyAPI } from '../api/axios';
import { cn } from '../lib/utils';

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
    return {
      up,
      down: data.length - up,
      percentUp: data.length > 0 ? (up / data.length) * 100 : 0
    };
  }, [data]);

  const getColor = (pChange) => {
    if (pChange <= -1.2) return '#ef4444';
    if (pChange <= -0.8) return '#f87171';
    if (pChange <= -0.4) return '#fca5a5';
    if (pChange < 0.4) return '#64748b';
    if (pChange < 0.8) return '#86efac';
    if (pChange < 1.2) return '#4ade80';
    return '#22c55e';
  };

  const series = [{
    data: data.map(item => ({
      x: item.indexSymbol,
      y: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : Math.abs(item.percentChange) + 1,
      pChange: item.percentChange,
      fillColor: getColor(item.percentChange),
    }))
  }];

  const options = {
    legend: { show: false },
    chart: {
      toolbar: { show: false },
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
      background: 'transparent'
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
        fontSize: '12px',
        fontWeight: '900',
        fontFamily: 'inherit'
      },
      formatter: function (text, op) {
        const actualChange = op.w.config.series[op.seriesIndex].data[op.dataPointIndex].pChange;
        return [text, `${actualChange > 0 ? '+' : ''}${actualChange}%`];
      },
      offsetY: -2
    },
    stroke: { show: true, width: 2, colors: ['var(--background)'] },
    theme: { mode: document.documentElement.classList.contains('dark') ? 'dark' : 'light' },
    tooltip: {
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={60} className="text-primary animate-spin" />
        <p className="text-lg font-black text-muted-foreground uppercase tracking-widest">Scanning Market Pulse</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 pt-8 md:pt-16 pb-20">
      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/30">
          <Grid3X3 size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Indices Heatmap</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Sectoral performance and market sentiment
          </p>
        </div>
      </div>

      {/* Market Breadth Bar */}
      <div className="mb-12 space-y-3">
        <div className="flex justify-between items-end px-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-green-500 h-5 w-5" />
            <span className="text-sm font-black text-green-600 dark:text-green-400 uppercase tracking-tight">{marketBreadth.up} Advances</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-destructive uppercase tracking-tight">{marketBreadth.down} Declines</span>
            <TrendingDown className="text-destructive h-5 w-5" />
          </div>
        </div>
        <div className="h-4 w-full bg-destructive/20 rounded-full overflow-hidden flex shadow-inner border border-border/50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${marketBreadth.percentUp}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
          />
        </div>
      </div>

      <div className="flex justify-center mb-10">
        <div className="flex bg-card border border-border p-1.5 rounded-2xl shadow-xl shadow-black/5">
          {['D', 'W', 'M', 'Y'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={cn(
                "px-4 md:px-8 py-2.5 rounded-xl text-xs font-black transition-all",
                selectedPeriod === p
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                  : "text-muted-foreground hover:bg-muted/80"
              )}
            >
              {p === 'D' ? 'Daily' : p === 'W' ? 'Weekly' : p === 'M' ? 'Monthly' : 'Yearly'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-[3rem] p-4 md:p-8 shadow-2xl shadow-black/5 overflow-hidden">
        <Chart
          options={options}
          series={series}
          type="treemap"
          height={600}
        />
      </div>
    </div>
  );
};

export default HeatmapV2;