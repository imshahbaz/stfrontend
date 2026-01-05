import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import FinancialChart from './FinancialChart';
import { useChartData } from '../hooks/useChartData';

const ChartPage = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { chartData, chartLoading, chartError, fetchChartData } = useChartData();
  const [theme, setTheme] = useState(document.documentElement.classList.contains('light') ? 'light' : 'dark');

  useEffect(() => {
    if (symbol) {
      fetchChartData(symbol);
    }
  }, [symbol, fetchChartData]);

  useEffect(() => {
    const updateTheme = () => {
      setTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark');
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [theme]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background overflow-hidden">
      <div className="px-4 md:px-8 py-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted border border-border hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              {symbol}
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-primary/10 text-primary uppercase tracking-tighter">Live Chart</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-grow p-4 md:p-8 relative">
        <AnimatePresence mode="wait">
          {chartLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background"
            >
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-pulse" />
              </div>
              <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Fetching Market Data</p>
            </motion.div>
          ) : chartError ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6 shadow-xl shadow-destructive/5">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-2">Error Loading Chart</h3>
              <p className="text-muted-foreground font-medium max-w-sm mb-8">{chartError}</p>
              <button
                onClick={() => fetchChartData(symbol)}
                className="btn btn-primary h-12 px-8 rounded-xl font-black"
              >
                Retry Request
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5"
            >
              <FinancialChart
                rawData={chartData}
                height="100%"
                theme={theme}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChartPage;