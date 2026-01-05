import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

const Unauthorized = ({ showLogin }) => {
    const navigate = useNavigate();

    return (
        <div className="flex-grow flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-card border border-border rounded-[3rem] p-10 md:p-16 text-center shadow-2xl shadow-black/5"
            >
                <div className="mx-auto w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-8 shadow-xl shadow-destructive/5">
                    <ShieldAlert size={56} />
                </div>

                <h1 className="text-4xl font-black tracking-tight text-destructive mb-4">
                    Access Denied
                </h1>

                <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
                    You do not have permission to access this restricted area. Please contact an administrator if you believe this is an error.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-primary h-14 px-8 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Home size={20} /> Home
                    </button>
                    {showLogin && (
                        <button
                            onClick={() => navigate('/login')}
                            className="btn bg-muted border border-border h-14 px-8 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-muted/80 transition-all"
                        >
                            <LogIn size={20} /> Login
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Unauthorized;