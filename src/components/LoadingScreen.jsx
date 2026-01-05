import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-6 overflow-hidden">
      {/* Background Glow */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at center, var(--primary) 0%, transparent 70%)'
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-xs gap-10">
        {/* Logo with Pulse Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            boxShadow: [
              "0 0 20px 0px rgba(124, 58, 237, 0.2)",
              "0 0 40px 10px rgba(124, 58, 237, 0.4)",
              "0 0 20px 0px rgba(124, 58, 237, 0.2)"
            ]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="flex h-24 w-24 items-center justify-center rounded-2xl bg-card border border-border/50 backdrop-blur-sm"
        >
          <img
            src="/logo512.png"
            alt="Shahbaz Trades Logo"
            className="h-14 w-14 object-contain"
          />
        </motion.div>

        {/* Text Content */}
        <div className="text-center space-y-2">
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black tracking-tight"
          >
            SHAHBAZ<span className="text-primary">TRADES</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground font-medium uppercase tracking-widest"
          >
            Initializing System
          </motion.p>
        </div>

        {/* Modern Progress Bar */}
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden relative">
          <motion.div
            className="absolute top-0 bottom-0 left-0 bg-primary"
            initial={{ width: "0%", left: "0%" }}
            animate={{ 
              width: ["20%", "50%", "20%"],
              left: ["-20%", "100%", "-20%"] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;