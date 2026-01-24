import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, ShieldAlert, ArrowRight, Zap } from 'lucide-react';
import { zerodhaAPI } from '../api/axios';
import StatusAlert from './shared/StatusAlert';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const ZerodhaCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('Verifying your Zerodha account...');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(true);
    const verificationStarted = useRef(false);
    const { user } = useAuth();

    useEffect(() => {
        const currentUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);

        const requestToken = searchParams.get('request_token') || urlParams.get('request_token');
        const stateUserId = searchParams.get('state') || urlParams.get('state');
        const contextUserId = user?.userId || user?.id;

        const finalUserId = contextUserId || stateUserId;

        if (requestToken && !verificationStarted.current) {
            verificationStarted.current = true;
            handleZerodhaLogin(requestToken, finalUserId);
        } else if (!requestToken) {
            const timer = setTimeout(() => {
                if (!verificationStarted.current && isVerifying) {
                    setError('No request token found. Please ensure you were redirected from Zerodha.');
                    setIsVerifying(false);
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [searchParams, user, isVerifying]);

    const handleZerodhaLogin = async (token, userId) => {
        try {
            setStatus('Connecting to Go Backend...');
            const response = await zerodhaAPI.login(token, userId);

            if (response.status === 200 || response.status === 201) {
                setStatus('Login Successful! Redirecting...');
                setIsVerifying(false);
                setTimeout(() => {
                    navigate('/zerodha/dashboard');
                }, 1500);
            } else {
                throw new Error(response.data?.message || 'Failed to exchange token');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred during verification.');
            setIsVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-4 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-card border border-border rounded-[3rem] p-10 md:p-16 text-center shadow-2xl shadow-black/5 flex flex-col items-center"
            >
                <div className="mb-8 relative">
                    <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group animate-pulse">
                        <Zap size={40} className="fill-primary" />
                    </div>
                </div>

                <div className="space-y-4 mb-8 w-full">
                    {isVerifying ? (
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary h-6 w-6 animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight mb-2">Zerodha Authentication</h2>
                                <p className="text-muted-foreground font-medium">{status}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-xl",
                                error ? "bg-destructive/10 text-destructive shadow-destructive/5" : "bg-green-500/10 text-green-500 shadow-green-500/5"
                            )}>
                                {error ? <ShieldAlert size={40} /> : <ShieldCheck size={40} />}
                            </div>
                            <h2 className={cn(
                                "text-3xl font-black tracking-tight",
                                error ? "text-destructive" : "text-foreground"
                            )}>
                                {error ? "Connection Failed" : "Success!"}
                            </h2>
                            {!error && <p className="text-muted-foreground font-medium">Your account is now linked.</p>}
                        </div>
                    )}
                </div>

                <StatusAlert error={error} className="w-full mb-8" />

                {(error || !isVerifying) && (
                    <button
                        onClick={() => navigate(error ? '/zerodha/dashboard' : '/zerodha/dashboard')}
                        className="btn btn-primary h-14 w-full rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {error ? 'Try Again' : 'Go to Dashboard'} <ArrowRight size={20} />
                    </button>
                )}
            </motion.div>
        </div>
    );
};

export default ZerodhaCallback;
