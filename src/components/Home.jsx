import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calculator, Grid3X3, Zap } from 'lucide-react';
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
    <div className="container mx-auto px-4 md:px-8 pt-8 md:pt-16 pb-20">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4"
      >
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-br from-primary to-primary-dark bg-clip-text text-transparent mb-2">
            {user ? `Hey, ${user.name || user.email.split('@')[0]}! 👋` : 'Welcome! 👋'}
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Let's see what the markets are doing today.
          </p>
        </div>
      </motion.div>

      {/* Action Cards Grid */}
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