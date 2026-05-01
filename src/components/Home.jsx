import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calculator, Grid3X3, Zap, ArrowUpRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import ActionCard from './shared/ActionCard';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user, appConfig } = useAuth();

  const actions = [
    {
      title: 'Screener',
      description: 'Scan and analyze the market with our advanced strategy tools.',
      icon: TrendingUp,
      path: '/strategies',
      show: true
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
      show: true
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
            {user ? `Welcome back, ${user.name || user.email.split('@')[0]}` : 'Welcome to Shahbaz Trades'}
          </h1>
          <p className="text-muted-foreground text-lg mb-8 relative z-10">
            Your comprehensive crypto and trading dashboard.
          </p>

          <div className="flex flex-col md:flex-row gap-6 relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Balance</p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#0080FF]">
                  $124,592.50
                </span>
                <span className="flex items-center text-sm font-bold text-[#00FF9D] bg-[#00FF9D]/10 px-2 py-1 rounded-full">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +2.45%
                </span>
              </div>
            </div>
          </div>
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
            <p className="text-3xl font-bold mb-1 text-foreground">Bullish</p>
            <p className="text-sm text-[#00FF9D]">Global Volume +12.4%</p>
          </div>
          
          <div className="mt-6">
            <button 
              onClick={() => navigate('/strategies')}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-foreground transition-all flex justify-center items-center gap-2"
            >
              View Screener <ArrowUpRight size={16} />
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