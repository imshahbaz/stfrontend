import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Grid3X3, TrendingUp, TrendingDown, Loader2, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { strategyAPI } from '../api/axios';
import { cn } from '../lib/utils';

const TV_COLORS = {
  up: '#26a69a',
  down: '#ef5350',
  upSoft: 'rgba(38, 166, 154, 0.1)',
  downSoft: 'rgba(239, 83, 80, 0.1)',
};

const Heatmap = () => {
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
      case 'D': return parseFloat(item.percentChange);
      case 'W': return parseFloat(item.perChange1w);
      case 'M': return parseFloat(item.perChange30d);
      case 'Y': return parseFloat(item.perChange365d);
      default: return parseFloat(item.percentChange);
    }
  };

  useEffect(() => {
    if (rawData.length > 0) {
      const transformed = rawData.map(item => ({
        ...item,
        currentChange: getPercentChange(item, selectedPeriod)
      }));
      const sorted = transformed.sort((a, b) => b.currentChange - a.currentChange);
      setData(sorted);
    }
  }, [rawData, selectedPeriod]);

  const topMovers = useMemo(() => {
    if (data.length < 6) return { gainers: [], losers: [] };
    return {
      gainers: data.slice(0, 3),
      losers: [...data].reverse().slice(0, 3)
    };
  }, [data]);

  const marketBreadth = useMemo(() => {
    const up = data.filter(d => d.currentChange > 0).length;
    return {
      up,
      down: data.length - up,
      percentUp: data.length > 0 ? (up / data.length) * 100 : 0
    };
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={60} className="text-primary animate-spin" />
        <p className="text-lg font-black text-muted-foreground uppercase tracking-widest">Scanning Market Pulse</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-8 pt-6 md:pt-16 pb-20">
      <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 shrink-0">
            <Grid3X3 size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none uppercase tracking-tighter">Heatmap</h1>
            <p className="text-[10px] md:text-sm text-muted-foreground font-medium uppercase tracking-wider mt-1">
              Market Pulse
            </p>
          </div>
        </div>

        {/* Period Selector - Responsive */}
        <div className="flex bg-card/50 backdrop-blur-md border border-border p-1 rounded-xl md:rounded-2xl shadow-xl overflow-x-auto no-scrollbar">
          {['D', 'W', 'M', 'Y'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={cn(
                "px-4 md:px-8 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all flex-1 min-w-[70px]",
                selectedPeriod === p
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/80"
              )}
            >
              {p === 'D' ? 'DAILY' : p === 'W' ? 'WEEKLY' : p === 'M' ? 'MONTHLY' : 'YEARLY'}
            </button>
          ))}
        </div>
      </div>

      {/* Spotlight Section - Optimized for Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
        {/* Top Gainers */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Zap size={14} className="text-[#26a69a]" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-[#26a69a]">Top Gainers</span>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {topMovers.gainers.map((item) => (
              <div key={item.indexSymbol} className="bg-[#26a69a]/10 border border-[#26a69a]/20 p-2.5 md:p-4 rounded-xl md:rounded-2xl flex flex-col gap-0.5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 md:p-2 opacity-10 md:opacity-20 group-hover:opacity-40 transition-opacity">
                  <ArrowUpRight size={16} className="text-[#26a69a] md:w-6 md:h-6" />
                </div>
                <span className="text-[8px] md:text-[10px] font-black text-[#26a69a]/70 truncate">{item.indexSymbol}</span>
                <span className="text-sm md:text-xl font-black tabular-nums text-[#26a69a]">+{item.currentChange}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2 px-1">
            <TrendingDown size={14} className="text-[#ef5350]" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-[#ef5350]">Top Losers</span>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {topMovers.losers.map((item) => (
              <div key={item.indexSymbol} className="bg-[#ef5350]/10 border border-[#ef5350]/20 p-2.5 md:p-4 rounded-xl md:rounded-2xl flex flex-col gap-0.5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 md:p-2 opacity-10 md:opacity-20 group-hover:opacity-40 transition-opacity">
                  <ArrowDownRight size={16} className="text-[#ef5350] md:w-6 md:h-6" />
                </div>
                <span className="text-[8px] md:text-[10px] font-black text-[#ef5350]/70 truncate">{item.indexSymbol}</span>
                <span className="text-sm md:text-xl font-black tabular-nums text-[#ef5350]">{item.currentChange}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sentiment Breadth Bar - Optimized for Mobile */}
      <div className="mb-8 md:mb-12 space-y-3 md:space-y-4 bg-muted/30 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-border/50">
        <div className="flex justify-between items-end px-1">
          <div className="flex flex-col gap-0.5 md:gap-1">
            <span className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Bullish</span>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="text-[#26a69a] h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-lg font-black text-[#26a69a] uppercase tracking-tight">{marketBreadth.up}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-0.5 md:gap-1">
            <span className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Bearish</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm md:text-lg font-black text-[#ef5350] uppercase tracking-tight">{marketBreadth.down}</span>
              <TrendingDown className="text-[#ef5350] h-4 w-4 md:h-5 md:w-5" />
            </div>
          </div>
        </div>
        <div className="h-4 md:h-6 w-full bg-[#ef5350]/10 rounded-full md:rounded-2xl overflow-hidden flex border border-[#ef5350]/20 relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${marketBreadth.percentUp}%` }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-[#26a69a] relative z-10 shadow-[4px_0_15px_rgba(38,166,154,0.4)]"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-hidden text-center">
            <span className="hidden md:block text-[10px] font-black text-white mix-blend-difference opacity-50 tracking-[0.5em] whitespace-nowrap uppercase">Market Breadth Indicator</span>
            <span className="md:hidden text-[8px] font-black text-white mix-blend-difference opacity-40 tracking-[0.2em] whitespace-nowrap uppercase">Market Pulse</span>
          </div>
        </div>
      </div>

      {/* The Heatmap Grid - Responsive Columns and Sizing */}
      <LayoutGroup>
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3"
        >
          <AnimatePresence mode="popLayout">
            {data.map((item) => {
              const isPositive = item.currentChange > 0;
              const color = isPositive ? TV_COLORS.up : TV_COLORS.down;
              const bgColor = isPositive ? TV_COLORS.upSoft : TV_COLORS.downSoft;

              // Dynamic opacity based on magnitude
              const intensity = Math.min(Math.abs(item.currentChange) / 2, 1);
              const borderOpacity = 0.1 + (intensity * 0.4);

              return (
                <motion.div
                  key={item.indexSymbol}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={cn(
                    "relative overflow-hidden p-4 md:p-6 rounded-2xl md:rounded-[2rem] border transition-colors cursor-default select-none group h-32 md:h-40 flex flex-col justify-between",
                    isPositive ? 'bg-[#26a69a]/5' : 'bg-[#ef5350]/5'
                  )}
                  style={{
                    borderColor: `${color}${Math.round(borderOpacity * 255).toString(16).padStart(2, '0')}`,
                    boxShadow: `0 10px 30px -15px ${color}20`
                  }}
                >
                  {/* Subtle Gradient Glow */}
                  <div
                    className="absolute inset-x-0 -top-10 h-24 md:h-32 blur-[40px] md:blur-[60px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-40"
                    style={{ background: color }}
                  />

                  <div className="relative z-10 space-y-0.5 md:space-y-1">
                    <span className="text-[8px] md:text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">{item.indexSymbol}</span>
                    <h3 className="text-[11px] md:text-sm font-black text-foreground/90 truncate pr-2 leading-none uppercase tracking-tight">{item.indexSymbol}</h3>
                  </div>

                  <div className="relative z-10 flex flex-col items-start">
                    <div className="flex items-center gap-1 md:gap-1.5 mb-1">
                      {isPositive ? <ArrowUpRight size={12} className="md:w-[14px] md:h-[14px]" style={{ color }} /> : <ArrowDownRight size={12} className="md:w-[14px] md:h-[14px]" style={{ color }} />}
                      <span className="text-xl md:text-2xl font-black tabular-nums tracking-tight" style={{ color }}>
                        {isPositive ? '+' : ''}{item.currentChange}%
                      </span>
                    </div>
                  </div>

                  {/* Intensity indicator line */}
                  <div
                    className="absolute bottom-0 left-0 h-0.5 md:h-1 transition-all duration-500"
                    style={{ width: `${Math.min(intensity * 100, 100)}%`, background: color }}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {data.length === 0 && !loading && (
        <div className="text-center py-20 bg-muted/20 rounded-2xl md:rounded-[3rem] border border-dashed border-border/50">
          <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No indices found</p>
        </div>
      )}
    </div>
  );
};

export default Heatmap;