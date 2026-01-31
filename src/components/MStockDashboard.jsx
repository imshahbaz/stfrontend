import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ExternalLink, Zap, Loader2, Key, Shield, Check, X, AlertCircle, User, Search, LogOut
} from 'lucide-react';
import { mstockAPI, marginAPI } from '../api/axios';
import StatusAlert from './shared/StatusAlert';
import ConfirmationModal from './admin/ConfirmationModal';
import { cn } from '../lib/utils';

const MStockDashboard = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [mstockUser, setMstockUser] = useState(null);

    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showRefreshButton, setShowRefreshButton] = useState(false);
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [loginData, setLoginData] = useState({
        apiKey: '',
        password: '',
        username: ''
    });
    const [otp, setOtp] = useState('');
    const [loginSubmitting, setLoginSubmitting] = useState(false);
    const [otpSubmitting, setOtpSubmitting] = useState(false);
    const [statusSuccess, setStatusSuccess] = useState('');
    const [statusError, setStatusError] = useState('');
    const [marginOptions, setMarginOptions] = useState([]);
    const [strikeQuery, setStrikeQuery] = useState('');
    const [showStrikeDropdown, setShowStrikeDropdown] = useState(false);
    const [expiryQuery, setExpiryQuery] = useState('');
    const [showExpiryDropdown, setShowExpiryDropdown] = useState(false);
    const strikeRef = useRef(null);
    const expiryRef = useRef(null);

    const [showOrderForm, setShowOrderForm] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [orderSubmitting, setOrderSubmitting] = useState(false);
    const [orderData, setOrderData] = useState({
        action: 'CALL',
        expiry: '',
        lots: 1,
        name: '',
        profit: '',
        strike: ''
    });


    useEffect(() => {
        checkConnection();
    }, []);

    useEffect(() => {
        const fetchOptions = async () => {
            if (showOrderForm) {
                try {
                    const response = await marginAPI.getOptions();
                    if (response.data.data) {
                        setMarginOptions(response.data.data);
                    }
                } catch (err) {
                    console.error('Failed to fetch margin options', err);
                }
            }
        };
        fetchOptions();
    }, [showOrderForm]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (strikeRef.current && !strikeRef.current.contains(event.target)) {
                setShowStrikeDropdown(false);
            }
            if (expiryRef.current && !expiryRef.current.contains(event.target)) {
                setShowExpiryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (statusSuccess) {
            const timer = setTimeout(() => {
                setStatusSuccess('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [statusSuccess]);

    useEffect(() => {
        if (statusError) {
            const timer = setTimeout(() => {
                setStatusError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [statusError]);

    const checkConnection = async () => {
        try {
            setIsLoading(true);
            setShowLoginForm(false);
            setShowRefreshButton(false);

            const response = await mstockAPI.getMe();

            if (response.data) {
                if (response.data.success === false) {
                    if (response.data.data === "E001") {
                        setShowLoginForm(true);
                        setIsConnected(false);
                    } else if (response.data.data === "E002") {
                        setShowRefreshButton(true);
                        setIsConnected(false);
                    } else {
                        setIsConnected(false);
                    }
                } else if (response.data.data) {
                    setIsConnected(true);
                    setMstockUser(response.data.data);
                    setShowOrderForm(true);
                }
            }
        } catch (error) {
            console.error("mStock connection check failed:", error);
            setIsConnected(false);
            const data = error.response?.data;
            if (data?.error === "E001") {
                setShowLoginForm(true);
            } else if (data?.error === "E002") {
                setShowRefreshButton(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginSubmitting(true);
        setStatusError('');
        setStatusSuccess('');

        try {
            const response = await mstockAPI.login(
                loginData.apiKey,
                loginData.password,
                loginData.username
            );

            // Trigger OTP if S002 or E001, otherwise if success open order form directly
            if (response.data.data === "S002" || response.data.data === "E001") {
                setShowOtpForm(true);
                setShowLoginForm(false);
            } else if (response.data.success) {
                setStatusSuccess('Authenticated successfully!');
                setShowOrderForm(true);
                setShowLoginForm(false);
                setIsConnected(true);
                checkConnection();
            } else {
                setStatusError(response.data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setStatusError(err.response?.data?.message || 'Login request failed.');
        } finally {
            setLoginSubmitting(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setOtpSubmitting(true);
        setStatusError('');

        try {
            const response = await mstockAPI.verifyOtp(otp);
            if (response.data.success) {
                if (response.data.data === "S002") {
                    setStatusSuccess('Session established successfully! Order terminal is now active.');
                    setShowOtpForm(false);
                    setShowOrderForm(true);
                    setIsConnected(true);
                } else {
                    setStatusSuccess('Session established successfully!');
                    setShowOtpForm(false);
                    checkConnection();
                }
            } else {
                if (response.data.data === "E002" || response.data.data === "E001") {
                    setShowOtpForm(false);
                    setStatusError(response.data.data === "E001" ? "OTP Expired" : "Invalid or expired OTP");
                } else {
                    setStatusError(response.data.message || 'OTP verification failed.');
                }
            }
        } catch (err) {
            const data = err.response?.data;
            if (data?.data === "E002" || data?.data === "E001") {
                setShowOtpForm(false);
                setStatusError(data?.data === "E001" ? "OTP Expired" : "Invalid or expired OTP");
            } else {
                setStatusError(err.response?.data?.message || 'OTP verification failed.');
            }
        } finally {
            setOtpSubmitting(false);
            setOtp('');
        }
    };

    const handleOrderSubmit = async (e) => {
        if (e) e.preventDefault();

        // Validation for mandatory fields
        if (!orderData.name) {
            setStatusError('Instrument Name is required');
            return;
        }
        if (!orderData.strike) {
            setStatusError('Strike Price is required');
            return;
        }
        if (!orderData.expiry) {
            setStatusError('Expiry Date is required');
            return;
        }
        if (!orderData.lots || orderData.lots <= 0) {
            setStatusError('Valid number of Lots is required');
            return;
        }
        if (!orderData.profit) {
            setStatusError('Target Profit is required');
            return;
        }

        const numericProfit = parseFloat(orderData.profit);
        if (isNaN(numericProfit) || numericProfit <= 0) {
            setStatusError('Target Profit must be greater than 0');
            return;
        }

        setStatusError(''); // Clear any existing errors
        setShowConfirmModal(true);
    };

    const confirmOrderPlacement = async () => {
        setOrderSubmitting(true);
        setStatusError('');
        setStatusSuccess('');

        try {
            const response = await mstockAPI.placeOrder({
                ...orderData,
                profit: parseFloat(orderData.profit)
            });
            if (response.data.success) {
                setStatusSuccess('Order placed successfully!');
            } else {
                setStatusError(response.data.message || 'Failed to place order.');
            }
        } catch (err) {
            setStatusError(err.response?.data?.message || 'Order placement failed.');
        } finally {
            setOrderSubmitting(false);
        }
    };

    const handleRefreshSession = async () => {
        setIsLoading(true);
        setStatusError('');
        setStatusSuccess('');

        try {
            const response = await mstockAPI.refreshSession();

            if (response.data.data === "S002" || response.data.data === "E001") {
                setShowOtpForm(true);
                setShowRefreshButton(false);
            } else if (response.data.success) {
                setStatusSuccess('Session refreshed successfully!');
                setShowOrderForm(true);
                setShowRefreshButton(false);
                setIsConnected(true);
                checkConnection();
            } else {
                setStatusError(response.data.message || 'Refresh failed. Please check your credentials.');
            }
        } catch (err) {
            setStatusError(err.response?.data?.message || 'Session refresh failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        setIsLoading(true);
        setStatusError('');
        setStatusSuccess('');

        try {
            const response = await mstockAPI.logout();
            if (response.data.success) {
                setStatusSuccess('Logged out from mStock successfully');
                setIsConnected(false);
                setMstockUser(null);
                setShowOrderForm(false);
                checkConnection();
            } else {
                setStatusError(response.data.message || 'Logout failed');
            }
        } catch (err) {
            setStatusError(err.response?.data?.message || 'Logout request failed');
        } finally {
            setIsLoading(false);
        }
    };


    if (isLoading && !isConnected && !showLoginForm && !showOtpForm && !showRefreshButton) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
                <div className="relative">
                    <Loader2 className="h-14 w-14 text-primary animate-spin" />
                    <div className="absolute inset-0 h-14 w-14 border-4 border-primary/20 rounded-full"></div>
                </div>
                <div className="space-y-2 text-center">
                    <p className="text-xl font-black tracking-tight animate-pulse">Establishing Secure Connection</p>
                    <p className="text-muted-foreground text-sm font-medium">Verifying credentials with mStock HQ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24 md:pb-12">
            <div className="container mx-auto px-4 pt-6 md:pt-12">

                <header className="flex flex-col items-center mb-8 md:mb-12 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest border transition-all duration-500 mb-6 ${isConnected
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                            : 'bg-primary/10 text-primary border-primary/20 shadow-lg shadow-primary/5'
                            }`}
                    >
                        {isConnected ? (
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </div>
                        ) : <Zap className="h-3.5 w-3.5" />}
                        {isConnected ? 'LIVE CONNECTION' : 'MSTOCK INTEGRATION READY'}
                    </motion.div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tightest text-center mb-4 leading-[1.1]">
                        {isConnected ? 'Trader' : 'Trading'} <span className="text-primary italic">{isConnected ? (mstockUser?.user_shortname || mstockUser?.user_name || 'Terminal') : 'Terminal'}</span>
                    </h1>

                    <p className="text-sm md:text-lg text-muted-foreground text-center max-w-xl font-medium px-4">
                        {isConnected
                            ? `Secured as ${mstockUser?.user_id}. Your mStock account is successfully linked and active.`
                            : 'Sync your mStock account to initialize the professional trading gateway and unlock real-time execution.'
                        }
                    </p>
                </header>

                <AnimatePresence mode="wait">
                    {showOrderForm ? (
                        <motion.div
                            key="order-form"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="max-w-4xl mx-auto mb-20 md:mb-24 px-2 md:px-0"
                        >
                            <div className="bg-card border border-border rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-3xl shadow-primary/5">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Order Terminal</h2>
                                        <p className="text-xs md:text-sm text-muted-foreground font-medium">Professional grade execution hub</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                                        <div className="flex items-center justify-center gap-3 bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10 flex-1 sm:flex-initial">
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                            </span>
                                            <span className="text-xs font-black uppercase tracking-widest text-primary">Terminal Active</span>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all group flex-1 sm:flex-initial"
                                        >
                                            <LogOut size={16} className="md:w-[18px] md:h-[18px] group-hover:translate-x-0.5 transition-transform" />
                                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Logout Session</span>
                                        </button>
                                    </div>
                                </div>

                                <StatusAlert success={statusSuccess} error={statusError} className="mb-10 rounded-2xl" />

                                <form onSubmit={handleOrderSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Instrument Name</label>
                                        <div className="relative">
                                            <select
                                                required
                                                className="w-full h-14 md:h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all font-bold text-base md:text-lg px-4 md:px-6 outline-none appearance-none"
                                                value={orderData.name}
                                                onChange={(e) => {
                                                    setOrderData({
                                                        ...orderData,
                                                        name: e.target.value,
                                                        strike: '',
                                                        expiry: ''
                                                    });
                                                    setStrikeQuery('');
                                                    setExpiryQuery('');
                                                }}
                                            >
                                                <option value="" disabled>Select Instrument</option>
                                                {marginOptions.map((opt) => (
                                                    <option key={opt.name} value={opt.name}>{opt.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                <Zap size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Action Type</label>
                                        <div className="flex gap-4 p-1.5 bg-muted/30 rounded-2xl border border-border/50">
                                            {['CALL', 'PUT'].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setOrderData({ ...orderData, action: type })}
                                                    className={cn(
                                                        "flex-1 py-2.5 md:py-3.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest transition-all",
                                                        orderData.action === type
                                                            ? type === 'CALL'
                                                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                                                : "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                                                            : "text-muted-foreground hover:bg-muted"
                                                    )}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 relative" ref={strikeRef}>
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Strike Price</label>
                                        <div className="relative">
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-12 md:pl-14 pr-5 h-14 md:h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all font-bold text-base md:text-lg outline-none"
                                                placeholder="Search Strike..."
                                                value={orderData.strike || strikeQuery}
                                                onChange={(e) => {
                                                    setStrikeQuery(e.target.value);
                                                    setOrderData({ ...orderData, strike: '' });
                                                    setShowStrikeDropdown(true);
                                                }}
                                                onFocus={() => setShowStrikeDropdown(true)}
                                                disabled={!orderData.name}
                                            />
                                        </div>

                                        <AnimatePresence>
                                            {showStrikeDropdown && orderData.name && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute z-50 w-full mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-y-auto max-h-[250px] scrollbar-hide"
                                                >
                                                    {(() => {
                                                        const instrument = marginOptions.find(o => o.name === orderData.name);
                                                        const filtered = instrument ? instrument.strike.filter(s =>
                                                            s.toLowerCase().includes(strikeQuery.toLowerCase())
                                                        ) : [];

                                                        return filtered.length > 0 ? (
                                                            filtered.map((s) => (
                                                                <button
                                                                    key={s}
                                                                    type="button"
                                                                    className="w-full text-left px-6 py-4 hover:bg-primary/10 transition-colors border-b border-border last:border-0 font-bold"
                                                                    onClick={() => {
                                                                        setOrderData({ ...orderData, strike: s });
                                                                        setStrikeQuery(s);
                                                                        setShowStrikeDropdown(false);
                                                                    }}
                                                                >
                                                                    {s}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="px-6 py-4 text-center text-muted-foreground text-sm">
                                                                No strikes found
                                                            </div>
                                                        );
                                                    })()}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Lots</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            className="w-full h-14 md:h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all font-bold text-base md:text-lg px-4 md:px-6 outline-none"
                                            value={orderData.lots}
                                            onChange={(e) => setOrderData({ ...orderData, lots: parseInt(e.target.value) })}
                                        />
                                    </div>

                                    <div className="space-y-4 relative" ref={expiryRef}>
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Expiry Date</label>
                                        <div className="relative">
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-12 md:pl-14 pr-5 h-14 md:h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all font-bold text-base md:text-lg outline-none"
                                                placeholder="Search Expiry..."
                                                value={orderData.expiry || expiryQuery}
                                                onChange={(e) => {
                                                    setExpiryQuery(e.target.value);
                                                    setOrderData({ ...orderData, expiry: '' });
                                                    setShowExpiryDropdown(true);
                                                }}
                                                onFocus={() => setShowExpiryDropdown(true)}
                                                disabled={!orderData.name}
                                            />
                                        </div>

                                        <AnimatePresence>
                                            {showExpiryDropdown && orderData.name && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute z-50 w-full mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-y-auto max-h-[250px] scrollbar-hide"
                                                >
                                                    {(() => {
                                                        const instrument = marginOptions.find(o => o.name === orderData.name);
                                                        const filtered = instrument ? instrument.expiry.filter(exp =>
                                                            exp.toLowerCase().includes(expiryQuery.toLowerCase())
                                                        ) : [];

                                                        return filtered.length > 0 ? (
                                                            filtered.map((exp) => (
                                                                <button
                                                                    key={exp}
                                                                    type="button"
                                                                    className="w-full text-left px-6 py-4 hover:bg-primary/10 transition-colors border-b border-border last:border-0 font-bold"
                                                                    onClick={() => {
                                                                        setOrderData({ ...orderData, expiry: exp });
                                                                        setExpiryQuery(exp);
                                                                        setShowExpiryDropdown(false);
                                                                    }}
                                                                >
                                                                    {exp}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="px-6 py-4 text-center text-muted-foreground text-sm">
                                                                No expiry found
                                                            </div>
                                                        );
                                                    })()}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>


                                    <div className="space-y-4">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Target Profit</label>
                                        <input
                                            type="number"
                                            required
                                            min="0.01"
                                            step="0.01"
                                            className="w-full h-14 md:h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all font-bold text-base md:text-lg px-4 md:px-6 outline-none"
                                            value={orderData.profit}
                                            onChange={(e) => setOrderData({ ...orderData, profit: e.target.value })}
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={orderSubmitting}
                                        className="md:col-span-2 w-full h-16 md:h-20 bg-primary text-white font-black text-xl md:text-2xl rounded-2xl md:rounded-3xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center justify-center gap-4 disabled:opacity-50 mt-4"
                                    >
                                        {orderSubmitting ? (
                                            <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin" />
                                        ) : (
                                            <>
                                                <Zap className="h-5 w-5 md:h-7 md:w-7 fill-current" />
                                                Place Order
                                            </>
                                        )}
                                    </motion.button>
                                </form>
                            </div>
                        </motion.div>
                    ) : showOtpForm ? (
                        <motion.div
                            key="otp-modal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-background/40"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                className="bg-card border-2 border-primary/10 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-4xl max-w-md w-full relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

                                <button
                                    onClick={() => setShowOtpForm(false)}
                                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
                                >
                                    <X size={20} />
                                </button>

                                <div className="flex flex-col items-center text-center mb-8 pt-4">
                                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-[2.5rem] bg-amber-500/10 flex items-center justify-center mb-4 md:mb-6 relative group">
                                        <Shield className="h-8 w-8 md:h-10 md:w-10 text-amber-600 relative z-10 animate-pulse" />
                                        <div className="absolute inset-0 bg-amber-500/5 rounded-2xl md:rounded-[2.5rem] animate-ping opacity-20"></div>
                                    </div>

                                    <p className="text-sm md:text-base text-muted-foreground font-medium px-2 md:px-4 leading-relaxed">
                                        Enter the verification code sent to your registered device.
                                    </p>
                                </div>

                                <StatusAlert success={statusSuccess} error={statusError} className="mb-8 rounded-2xl border-none bg-muted/50" />

                                <form onSubmit={handleOtpSubmit} className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="relative h-24 bg-muted/20 rounded-3xl border-2 border-transparent focus-within:border-primary/30 focus-within:bg-background transition-all overflow-hidden flex items-center justify-center group shadow-inner">
                                            <input
                                                type="text"
                                                required
                                                autoFocus
                                                maxLength={6}

                                                className="w-full bg-transparent text-center font-black text-5xl md:text-6xl tracking-[0.3em] md:tracking-[0.4em] outline-none placeholder:text-muted-foreground/20 translate-x-[0.15em] md:translate-x-[0.2em] relative z-10"
                                                value={otp}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    if (val.length <= 6) setOtp(val);
                                                }}
                                            />
                                            {/* Progress indicator */}
                                            <motion.div
                                                className="absolute bottom-0 left-0 h-1.5 bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(otp.length / 6) * 100}%` }}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                                        </div>

                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={otpSubmitting || otp.length < 3}
                                        className="w-full h-18 bg-primary text-white font-black text-xl rounded-[1.5rem] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale"
                                    >
                                        {otpSubmitting ? (
                                            <Loader2 className="h-7 w-7 animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="h-7 w-7 stroke-[3]" />
                                                Authorize Session
                                            </>
                                        )}
                                    </motion.button>
                                </form>


                            </motion.div>
                        </motion.div>
                    ) : showLoginForm ? (
                        <motion.div
                            key="login-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="max-w-md mx-auto mb-12"
                        >
                            <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 shadow-3xl shadow-primary/5 transition-all">
                                <div className="flex flex-col items-center text-center mb-8">
                                    <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-6 relative overflow-hidden group">
                                        <Shield className="h-10 w-10 text-primary relative z-10 group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">mStock Login</h2>
                                    <p className="text-xs md:text-sm text-muted-foreground font-medium px-4">Provide your account details to continue</p>
                                </div>

                                <StatusAlert success={statusSuccess} error={statusError} className="mb-6 rounded-2xl" />

                                <form onSubmit={handleLoginSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">API Key</label>
                                        <div className="relative group">
                                            <Key className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Enter API Key"
                                                className="w-full pl-12 md:pl-14 pr-5 h-14 md:h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all font-bold text-base md:text-lg outline-none"
                                                value={loginData.apiKey}
                                                onChange={(e) => setLoginData({ ...loginData, apiKey: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Username</label>
                                        <div className="relative group">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Enter Username"
                                                className="w-full pl-12 md:pl-14 pr-5 h-14 md:h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all font-bold text-base md:text-lg outline-none"
                                                value={loginData.username}
                                                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Password</label>
                                        <div className="relative group">
                                            <Shield className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="password"
                                                required
                                                placeholder="Enter Password"
                                                className="w-full pl-12 md:pl-14 pr-5 h-14 md:h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all font-bold text-base md:text-lg outline-none"
                                                value={loginData.password}
                                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loginSubmitting}
                                        className="w-full h-14 md:h-16 bg-primary text-white font-black text-lg md:text-xl rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {loginSubmitting ? (
                                            <Loader2 className="h-6 w-6 md:h-7 md:w-7 animate-spin" />
                                        ) : (
                                            <>
                                                <ExternalLink className="h-5 w-5 md:h-6 md:w-6" />
                                                Login Account
                                            </>
                                        )}
                                    </motion.button>
                                </form>
                            </div>
                        </motion.div>
                    ) : showRefreshButton ? (
                        <motion.div
                            key="refresh-session"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="h-24 w-24 rounded-full bg-rose-500/10 flex items-center justify-center relative">
                                <AlertCircle className="h-10 w-10 text-rose-500" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black">Session Required</h3>
                                <p className="text-muted-foreground font-medium max-w-xs">Your existing session needs to be heartbeated or restored.</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRefreshSession}
                                className="px-10 py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/20 flex items-center gap-3"
                            >
                                <Zap className="h-5 w-5 fill-current" />
                                Refresh Session
                            </motion.button>
                        </motion.div>
                    ) : isConnected ? (
                        <motion.div
                            key="account-linked"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="max-w-md mx-auto"
                        >
                            <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-3xl shadow-primary/5 flex flex-col items-center text-center">
                                <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 relative">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full bg-emerald-500/5"
                                    />
                                    <Check className="h-10 w-10 text-emerald-500 relative z-10" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-black tracking-tight mb-2">Account Linked</h2>
                                <p className="text-sm md:text-base text-muted-foreground font-medium mb-8">
                                    Your mStock session is active and ready for operations.
                                </p>

                                <div className="w-full space-y-3">
                                    <p className="text-xs text-muted-foreground italic">Use the login portal for account changes</p>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        !isLoading && (
                            <motion.div
                                key="default-connect"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <p className="text-muted-foreground font-medium">No active session detected.</p>
                                <button
                                    onClick={checkConnection}
                                    className="text-primary font-black uppercase tracking-widest text-xs hover:underline"
                                >
                                    Try Reconnecting
                                </button>
                            </motion.div>
                        )
                    )}
                </AnimatePresence>
            </div>
            {/* Confirmation Modal */}
            <ConfirmationModal
                open={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Confirm Trade"
                message={`Are you sure you want to place this ${orderData.action} order for ${orderData.name} (${orderData.expiry}) at ${orderData.strike} strike with a target profit of ₹${orderData.profit}?`}
                onConfirm={confirmOrderPlacement}
                confirmText="Place Order"
            />
        </div>
    );
};

export default MStockDashboard;
