import React, { useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  ExternalLink,
  BarChart3,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { useStrategies } from '../hooks/useStrategies';
import StatusAlert from './shared/StatusAlert';
import { cn } from '../lib/utils';

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

  useEffect(() => {
    if (selectedStrategy) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedStrategy]);

  const handleViewChart = (stock) => {
    sessionStorage.setItem('returning_from_chart', 'true');
    navigate(`/chart/${stock.symbol}`);
  };

  return (
    <div className="min-h-screen bg-background pt-8 md:pt-16 pb-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/30">
              <BarChart3 size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Screeners</h1>
              <p className="text-sm text-muted-foreground font-medium">
                Real-time market analysis strategies
              </p>
            </div>
          </div>
        </div>

        {/* STRATEGY SELECTION */}
        <div className="mb-8 flex gap-3 overflow-x-scroll pb-4 scrollbar-hide">
          {loading && strategies.length === 0 ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-10 w-28 bg-muted animate-pulse rounded-2xl" />
            ))
          ) : (
            strategies.map((strategy, index) => (
              <button
                key={`${strategy.id}-${index}`}
                onClick={() => fetchStrategyData(strategy.name)}
                className={cn(
                  "px-6 py-2.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap",
                  selectedStrategy === strategy.name
                    ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {strategy.name}
              </button>
            ))
          )}
        </div>

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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black tracking-tight">
                  {selectedStrategy} Results
                </h2>
                {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              </div>

              <StatusAlert error={error} className="mb-6" />

              <div className="flex flex-col bg-card sm:bg-transparent sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 rounded-xl sm:rounded-none border-y sm:border-0 border-border overflow-hidden">
                {strategyData.map((stock, index) => (
                  <motion.div
                    key={`${stock.symbol}-${index}`}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={cn(
                      "group relative transition-all cursor-pointer",
                      "bg-background sm:bg-card hover:bg-muted/50 sm:hover:bg-card",
                      "border-b border-border/60 sm:border sm:rounded-[2rem] last:border-b-0",
                      "sm:hover:-translate-y-2 sm:hover:border-primary sm:hover:shadow-2xl sm:hover:shadow-black/10 dark:sm:hover:shadow-black/50"
                    )}
                    onClick={() => handleViewChart(stock)}
                  >
                    <div className="flex flex-col py-3 px-4 sm:p-6 h-full">

                      <div className="flex justify-between items-start">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                              NSE
                            </span>
                          </div>
                          <h3 className="text-[15px] sm:text-xl font-semibold sm:font-bold tracking-tight leading-tight group-hover:text-primary transition-colors">
                            {stock.symbol}
                          </h3>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 mb-0.5 sm:hidden">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase">
                              LTP
                            </span>
                            <span className="text-[13px] font-semibold text-foreground">
                              {stock.close}
                            </span>
                          </div>

                          {/* Desktop Price */}
                          <div className="hidden sm:block">
                            <span className="text-xl font-bold text-foreground block">
                              ₹{stock.close}
                            </span>
                            <span className="text-[10px] font-medium text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-sm uppercase mt-1 inline-block">
                              LTP
                            </span>
                          </div>

                          <div className="text-[13px] font-medium text-green-500 sm:hidden">
                            {stock.margin}x <span className="text-muted-foreground text-[11px] ml-0.5">Margin</span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop specific footer */}
                      <div className="hidden sm:flex gap-3 mt-auto pt-4 border-t border-dashed border-border">
                        <div className="flex-1 px-3 py-1.5 rounded-xl bg-muted/40 group-hover:bg-muted transition-colors">
                          <span className="block text-[10px] font-black text-muted-foreground uppercase">Margin</span>
                          <span className="text-sm font-black">{stock.margin}x</span>
                        </div>
                        {stock.date && (
                          <div className="flex-[1.5] px-3 py-1.5 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors border border-primary/10">
                            <span className="block text-[10px] font-black text-primary uppercase">Found On</span>
                            <span className="text-sm font-black text-primary">{stock.date}</span>
                          </div>
                        )}
                      </div>

                      {/* Mobile specific subtext - Cleaner Zerodha style */}
                      <div className="flex sm:hidden justify-between items-center mt-2 pt-2 border-t border-border/30">
                        <div className="flex items-center gap-1">
                          {stock.date ? (
                            <>
                              <span className="text-[11px] text-muted-foreground uppercase font-medium">Found:</span>
                              <span className="text-[11px] font-semibold">{stock.date}</span>
                            </>
                          ) : (
                            <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[150px]">
                              {stock.name || 'NSE Equity'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-muted-foreground uppercase font-medium">Avg:</span>
                          <span className="text-[11px] font-semibold">₹{stock.close}</span>
                        </div>
                      </div>

                      <ExternalLink className="absolute right-4 bottom-4 h-4 w-4 opacity-5 group-hover:opacity-40 transition-opacity hidden sm:block" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-border bg-muted/20 opacity-60 text-center px-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <TrendingUp size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-foreground/80 mb-2">
                Select a strategy
              </h3>
              <p className="text-sm font-medium text-muted-foreground max-w-xs">
                Pick a screening algorithm from the list above to see high-probability trading setups.
              </p>
            </div>
          )}
        </AnimatePresence>

        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
});

export default Strategies;