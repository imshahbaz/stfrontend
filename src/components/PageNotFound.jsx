import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const PageNotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="flex-grow flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-card border border-border rounded-[3rem] p-10 md:p-16 text-center shadow-2xl shadow-black/5"
            >
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-8 shadow-inner">
                    <Ghost size={56} />
                </div>

                <div className="mb-2">
                    <span className="text-primary font-black text-xs uppercase tracking-[0.3em]">Error 404</span>
                </div>
                <h1 className="text-4xl font-black tracking-tight mb-4">
                    Lost in Space
                </h1>

                <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
                    The page you're searching for has moved or no longer exists. Let's get you back on track.
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="btn btn-primary w-full h-14 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Home size={20} /> Take Me Home
                </button>
            </motion.div>
        </div>
    );
};

export default PageNotFound;