import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calculator, Grid3X3, Zap, ArrowUpRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import ActionCard from './shared/ActionCard';
import { useAuth } from '../context/AuthContext';
import { angelOneApi } from '../api/axios';

const Home = () => {
  const navigate = useNavigate();
  const { user, appConfig } = useAuth();

  const [marketStatus, setMarketStatus] = useState({
    status: 'Loading...',
    color: 'text-muted-foreground',
    details: 'Fetching data...'
  });

  useEffect(() => {
    const fetchMarketStatus = async () => {
      try {
        const response = await angelOneApi.getLtp("99926033");
        if (response.data && response.data.success && response.data.data) {
          const { ltp, close, tradingSymbol } = response.data.data;
          const change = ltp - close;
          const percentChange = ((change / close) * 100).toFixed(2);

          if (change >= 0) {
            setMarketStatus({
              status: 'Bullish',
              color: 'text-[#00FF9D]',
              details: `${tradingSymbol} +${percentChange}%`
            });
          } else {
            setMarketStatus({
              status: 'Bearish',
              color: 'text-[#FF0055]',
              details: `${tradingSymbol} ${percentChange}%`
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch market status", error);
        setMarketStatus({
          status: 'Unknown',
          color: 'text-muted-foreground',
          details: 'Data unavailable'
        });
      }
    };

    fetchMarketStatus();
    const intervalId = setInterval(fetchMarketStatus, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const actions = [
    {
      title: 'Screener',
      description: 'Scan and analyze the market with our advanced strategy tools.',
      icon: TrendingUp,
      path: '/strategies',
      show: false
    },
    {
      title: 'Calculator',
      description: 'Calculate returns and analyze trades with our advanced calculator.',
      icon: Calculator,
      path: '/calculator',
      show: true
    },
    {
      title: 'Market Heat Map',
      description: 'Visualize real-time performance of Nifty indices.',
      icon: Grid3X3,
      path: '/heatmap',
      show: appConfig?.components?.heatMap !== false
    },
    {
      title: 'Zerodha Dashboard',
      description: 'Connect your Zerodha account for real-time tracking and execution.',
      icon: Zap,
      path: '/zerodha/dashboard',
      show: true
    },
    {
      title: 'mStock Dashboard',
      description: 'Manage your mStock API connection and authentication status.',
      icon: TrendingUp,
      path: '/mstock/dashboard',
      show: false
    }
  ].filter(action => action.show);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 pt-8 md:pt-12 pb-20 max-w-7xl">
      {/* Welcome & Balance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card p-8 relative overflow-hidden flex flex-col justify-center"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 text-foreground relative z-10">
            {user ? `Welcome back, ${user.name || user.email.split('@')[0]}` : 'Welcome to 1Klik'}
          </h1>
          <p className="text-muted-foreground text-lg mb-8 relative z-10">
            Your comprehensive crypto and trading dashboard.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">Market Status</h3>
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Activity size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1 text-foreground">{marketStatus.status}</p>
            <p className={`text-sm ${marketStatus.color}`}>{marketStatus.details}</p>
          </div>

          <div className="mt-6">
            <button
              onClick={() => navigate('/strategies')}
              className="w-full py-3 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/50 rounded-xl font-bold text-foreground transition-all duration-300 flex justify-center items-center gap-2 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:text-primary group overflow-hidden relative"
            >
              <span className="relative z-10 flex items-center gap-2">View Screener <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"></div>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Action Cards Grid */}
      <h2 className="text-2xl font-bold mb-6 text-foreground">Dashboard Modules</h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {actions.map((action, idx) => (
          <ActionCard
            key={idx}
            title={action.title}
            description={action.description}
            icon={action.icon}
            onClick={() => navigate(action.path)}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default Home;