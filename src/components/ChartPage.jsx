import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle, Newspaper, ExternalLink, Clock, Sparkles, TrendingUp, TrendingDown, Brain } from 'lucide-react';
import FinancialChart from './FinancialChart';
import { useChartData } from '../hooks/useChartData';
import { newsApi } from '../api/axios';

const ChartPage = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { chartData, chartLoading, chartError, fetchChartData } = useChartData();
  const [theme, setTheme] = useState(document.documentElement.classList.contains('light') ? 'light' : 'dark');
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (symbol) {
      fetchChartData(symbol);
    }
  }, [symbol, fetchChartData]);

  useEffect(() => {
    const fetchNews = async () => {
      if (!symbol) return;
      try {
        setNewsLoading(true);
        const response = await newsApi.getTvNews(symbol);
        setNews(response.data.data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setNewsLoading(false);
      }
    };

    const fetchAiAnalysis = async () => {
      if (!symbol) return;
      try {
        setAiLoading(true);
        const response = await newsApi.getGenAiAnalysis(symbol);
        setAiAnalysis(response.data.data);
      } catch (error) {
        console.error('Error fetching AI analysis:', error);
      } finally {
        setAiLoading(false);
      }
    };

    fetchNews();
    fetchAiAnalysis();
  }, [symbol]);

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
    <div className="flex flex-col min-h-[calc(100vh-64px)] w-full bg-background overflow-y-auto">
      <div className="px-4 md:px-8 py-4 border-b border-border flex items-center justify-between shrink-0 bg-background/80 backdrop-blur-md sticky top-0 z-10">
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

      <div className="flex-grow p-4 md:p-8 space-y-8">
        {/* Chart Section */}
        <div className="relative min-h-[500px] h-[60vh]">
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
                className="h-full w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5 border border-border"
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

        {/* AI Analysis Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
              <Sparkles className="h-6 w-6 text-primary" />
              AI Technical Analysis
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {aiLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 rounded-[2rem] bg-muted/30 border border-border animate-pulse flex flex-col gap-4"
              >
                <div className="h-8 w-1/3 bg-muted rounded-lg" />
                <div className="h-24 w-full bg-muted rounded-lg" />
              </motion.div>
            ) : aiAnalysis ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 md:p-8 shadow-xl"
              >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 bg-primary/5 blur-3xl rounded-full" />

                <div className="grid md:grid-cols-3 gap-8 relative">
                  {/* Action & Signal */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recommendation</p>
                      <div className={`text-4xl font-black tracking-tighter ${aiAnalysis.action?.toUpperCase() === 'BUY' ? 'text-green-500' :
                        aiAnalysis.action?.toUpperCase() === 'SELL' ? 'text-red-500' : 'text-yellow-500'
                        }`}>
                        {aiAnalysis.action}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Confidence</p>
                        <div className="text-xl font-bold">{aiAnalysis.confidence}%</div>
                      </div>
                      <div className="h-8 w-px bg-border" />
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trend</p>
                        <div className="flex items-center gap-1.5 text-xl font-bold capitalize">
                          {aiAnalysis.trend?.toLowerCase() === 'bullish' ? <TrendingUp className="h-5 w-5 text-green-500" /> : <TrendingDown className="h-5 w-5 text-red-500" />}
                          {aiAnalysis.trend}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Brain className="h-3 w-3" />
                        AI Analysis & Reasoning
                      </p>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
                        {aiAnalysis.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="p-12 text-center bg-card rounded-[2rem] border border-dashed border-border">
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">No AI analysis available for this symbol</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* News Section */}
        <div className="space-y-6 pb-20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
              <Newspaper className="h-6 w-6 text-primary" />
              Market Headlines
            </h2>
          </div>

          <div className="grid gap-3 lg:grid-cols-1">
            {newsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-muted/50 animate-pulse border border-border" />
              ))
            ) : news.length > 0 ? (
              news.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative flex items-start p-4 rounded-xl bg-card text-card-foreground border border-border hover:border-primary/30 transition-all hover:bg-accent/50 shadow-sm"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary mr-4 transition-colors shrink-0 mt-2" />
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-sm md:text-base font-bold leading-snug group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    {item.published && (
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">
                        <Clock className="h-3 w-3" />
                        {new Date(item.published * 1000).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-card rounded-[2rem] border border-dashed border-border">
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">No news available for this symbol</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPage;
