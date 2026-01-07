import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TruecallerLogin from '../TruecallerLogin';
import { GoogleButton } from '../auth/GoogleAuth';
import StatusAlert from './StatusAlert';

const AuthWrapper = ({ title, subtitle, children, isLogin }) => {
    const navigate = useNavigate();
    const authContext = useAuth();
    const [error, setError] = React.useState('');

    useEffect(() => {
        if (authContext && !authContext.loading && authContext.user) {
            navigate('/', { replace: true });
        }
    }, [authContext?.user, authContext?.loading, navigate]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 6000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    if (!authContext || authContext.loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    const { user, login, appConfig, refreshUserData } = authContext;
    const auth = appConfig?.auth || { google: true, truecaller: true, email: true };

    return (
        <div className="min-h-[calc(100vh-160px)] md:min-h-screen flex flex-col items-center justify-start md:justify-center p-4 pt-10 md:pt-0 bg-background relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-black/5">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-black tracking-tight mb-3 bg-gradient-to-br from-foreground to-primary bg-clip-text text-transparent">
                            {title}
                        </h1>
                        <p className="text-muted-foreground font-medium">
                            {subtitle}
                        </p>
                    </div>

                    {error && <StatusAlert error={error} className="mb-6" />}

                    <div className="space-y-6">
                        {auth.truecaller && (
                            <TruecallerLogin
                                login={login}
                                user={user}
                                isLogin={isLogin}
                                setError={setError}
                                refreshUserData={refreshUserData} />
                        )}

                        {auth.google && <GoogleButton />}

                        {auth.email && (
                            <>
                                <div className="flex items-center gap-4 py-2">
                                    <div className="h-px grow bg-border" />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        OR CONTINUE WITH EMAIL
                                    </span>
                                    <div className="h-px grow bg-border" />
                                </div>
                                {children}
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthWrapper;