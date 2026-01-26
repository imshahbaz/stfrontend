import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ExternalLink, Zap, Loader2, CheckCircle2, Send, Calendar,
    Hash, Search, AlertCircle, ShoppingBag, Clock, ArrowUpRight,
    Edit2, X, Save, Trash2, Key, Shield, Settings, TrendingUp, History, User,
    Copy, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { zerodhaAPI, marginAPI } from '../api/axios';
import StatusAlert from './shared/StatusAlert';
import ConfirmationModal from './admin/ConfirmationModal';
import { cn } from '../lib/utils';

const ZerodhaDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [zerodhaUser, setZerodhaUser] = useState(null);
    const [backendApiKey, setBackendApiKey] = useState('');
    const [activeTab, setActiveTab] = useState('trade');

    const [formData, setFormData] = useState({
        symbol: '',
        date: '',
        quantity: ''
    });
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState('');
    const [orderError, setOrderError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);

    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);

    const [needsConfig, setNeedsConfig] = useState(false);
    const [configData, setConfigData] = useState({
        apiKey: '',
        apiSecret: ''
    });
    const [configSubmitting, setConfigSubmitting] = useState(false);

    const [margins, setMargins] = useState([]);
    const [loadingMargins, setLoadingMargins] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [copiedField, setCopiedField] = useState("");

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(""), 2000);
    };

    const getISTDate = () => {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());
    };

    useEffect(() => {
        setFormData(prev => ({ ...prev, date: getISTDate() }));
        checkConnection();
        fetchMargins();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchMargins = async () => {
        setLoadingMargins(true);
        try {
            const response = await marginAPI.getAllMargins();
            setMargins(response.data.data);
        } catch (error) {
            console.error("Error fetching stocks:", error);
        } finally {
            setLoadingMargins(false);
        }
    };

    const fetchOrders = async () => {
        const userId = user?.userId || user?.id;
        if (!userId) return;

        setLoadingOrders(true);
        try {
            const response = await zerodhaAPI.getUserOrders(userId);
            if (response.data && Array.isArray(response.data)) {
                setOrders(response.data);
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const checkConnection = async () => {
        try {
            setIsLoading(true);
            const response = await zerodhaAPI.getMe();

            if (response.status === 200 && response.data) {
                if (response.data.success === false) {
                    const message = response.data.message || "";
                    if (message.includes("Token expired")) {
                        setIsConnected(false);
                        setNeedsConfig(false);
                        if (response.data.data) {
                            setBackendApiKey(response.data.data);
                        }
                    } else if (message.includes("E001") || !response.data.data) {
                        setNeedsConfig(true);
                    }
                } else if (response.data.data) {
                    setIsConnected(true);
                    setNeedsConfig(false);
                    setZerodhaUser(response.data.data);
                }
            }
        } catch (error) {
            console.error("Zerodha connection check failed:", error);
            setIsConnected(false);

            const data = error.response?.data;
            const errorMsg = (typeof data === 'string' ? data : (data?.message || data?.error || "")).toString();

            if (errorMsg.includes("E001") || error.response?.status === 404) {
                if (errorMsg.includes("Token expired")) {
                    setNeedsConfig(false);
                } else {
                    setNeedsConfig(true);
                }
            } else {
                setNeedsConfig(false);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfigSubmit = async (e) => {
        e.preventDefault();
        setConfigSubmitting(true);
        setOrderError('');
        setOrderSuccess('');

        try {
            const response = await zerodhaAPI.saveConfig({
                apiKey: configData.apiKey,
                apiSecret: configData.apiSecret
            });
            if (response.status === 200 || response.status === 201) {
                setOrderSuccess('Zerodha configuration saved successfully!');
                setNeedsConfig(false);
                checkConnection();
            }
        } catch (err) {
            setOrderError(err.response?.data?.message || 'Failed to save configuration. Please try again.');
        } finally {
            setConfigSubmitting(false);
        }
    };

    const filteredMargins = Array.isArray(margins) ? margins
        .filter(m => m.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            const q = searchQuery.toLowerCase();
            const sA = a.symbol.toLowerCase();
            const sB = b.symbol.toLowerCase();
            if (sA === q) return -1;
            if (sB === q) return 1;
            const startsA = sA.startsWith(q);
            const startsB = sB.startsWith(q);
            if (startsA && !startsB) return -1;
            if (!startsA && startsB) return 1;
            return sA.localeCompare(sB);
        }).slice(0, 10) : [];

    const handleConnect = () => {
        const apiKey = backendApiKey || import.meta.env.VITE_ZERODHA_API_KEY;
        const zerodhaLoginUrl = `https://kite.trade/connect/login?v=3&api_key=${apiKey}`;
        window.location.href = zerodhaLoginUrl;
    };

    const resetForm = () => {
        setFormData({
            symbol: '',
            date: getISTDate(),
            quantity: ''
        });
        setSearchQuery('');
        setIsEditing(false);
        setEditingOrder(null);
    };

    const handleEditOrder = (order) => {
        setIsEditing(true);
        setEditingOrder(order);
        setFormData({
            symbol: order.symbol,
            date: order.date?.split('T')[0],
            quantity: order.quantity.toString()
        });
        setSearchQuery(order.symbol);
        setActiveTab('trade');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = (id) => {
        setOrderToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!orderToDelete) return;

        setLoadingOrders(true);
        setOrderSuccess('');
        setOrderError('');

        try {
            const response = await zerodhaAPI.deleteOrder(orderToDelete);
            if (response.status === 200) {
                setOrderSuccess('Order deleted successfully!');

                if (isEditing && editingOrder?.id === orderToDelete) {
                    resetForm();
                }

                fetchOrders();

                setTimeout(() => {
                    setOrderSuccess('');
                }, 3000);
            }
        } catch (err) {
            setOrderError(err.response?.data?.message || 'Failed to delete order.');
        } finally {
            setLoadingOrders(false);
            setOrderToDelete(null);
        }
    };

    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        setOrderLoading(true);
        setOrderSuccess('');
        setOrderError('');

        const payload = {
            date: formData.date,
            quantity: parseInt(formData.quantity),
            symbol: formData.symbol.toUpperCase(),
            userId: parseInt(user?.userId || user?.id || 0),
            id: isEditing ? editingOrder.id : ""
        };

        try {
            let response;
            if (isEditing) {
                response = await zerodhaAPI.updateOrder(editingOrder.id, payload);
            } else {
                response = await zerodhaAPI.placeMTFOrder(payload);
            }

            if (response.status === 200 || response.status === 201) {
                setOrderSuccess(isEditing ? 'Order updated successfully!' : 'Order placed successfully!');
                resetForm();
                fetchOrders();

                setTimeout(() => {
                    setOrderSuccess('');
                }, 3000);

                if (!isEditing) setActiveTab('history');
            }
        } catch (err) {
            setOrderError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'place'} order. Please check your connection.`);
        } finally {
            setOrderLoading(false);
        }
    };

    if (isLoading && !isConnected && !needsConfig) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
                <div className="relative">
                    <Loader2 className="h-14 w-14 text-primary animate-spin" />
                    <div className="absolute inset-0 h-14 w-14 border-4 border-primary/20 rounded-full"></div>
                </div>
                <div className="space-y-2 text-center">
                    <p className="text-xl font-black tracking-tight animate-pulse">Establishing Secure Connection</p>
                    <p className="text-muted-foreground text-sm font-medium">Verifying credentials with Zerodha HQ...</p>
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
                        {isConnected ? 'LIVE CONNECTION' : 'KITE INTEGRATION READY'}
                    </motion.div>

                    <h1 className="text-3xl md:text-6xl font-black tracking-tightest text-center mb-4 leading-[1.1]">
                        {isConnected ? 'Trader' : 'Trading'} <span className="text-primary italic">{isConnected ? (zerodhaUser?.user_shortname || zerodhaUser?.user_name || 'Terminal') : 'Terminal'}</span>
                    </h1>

                    <p className="text-sm md:text-lg text-muted-foreground text-center max-w-xl font-medium px-4">
                        {isConnected
                            ? `Secured as ${zerodhaUser?.user_id}. Monitor execution flows and manage assets in real-time.`
                            : 'Sync your Zerodha account to unlock professional execution tools and precision portfolio management.'
                        }
                    </p>
                </header>

                <AnimatePresence mode="wait">
                    {needsConfig ? (
                        <motion.div
                            key="config-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-md mx-auto mb-12"
                        >
                            <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 shadow-3xl shadow-primary/5 transition-all">
                                <div className="flex flex-col items-center text-center mb-8">
                                    <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-6 relative overflow-hidden group">
                                        <Shield className="h-10 w-10 text-primary relative z-10 group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
                                        {isConnected && (
                                            <button
                                                onClick={() => setNeedsConfig(false)}
                                                className="absolute top-2 right-2 p-1.5 bg-background border border-border rounded-full hover:bg-muted transition-colors z-20"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tight mb-2">Zerodha Setup</h2>
                                    <p className="text-muted-foreground font-medium px-4">Identify your credentials to initialize the gateway</p>
                                </div>

                                <StatusAlert success={orderSuccess} error={orderError} className="mb-6 rounded-2xl" />

                                <form onSubmit={handleConfigSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">API Key</label>
                                        <div className="relative group">
                                            <Key className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Enter your API Key"
                                                className="w-full pl-14 pr-5 h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all font-bold text-lg outline-none"
                                                value={configData.apiKey}
                                                onChange={(e) => setConfigData({ ...configData, apiKey: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">API Secret</label>
                                        <div className="relative group">
                                            <Shield className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="password"
                                                required
                                                placeholder="Enter your API Secret"
                                                className="w-full pl-14 pr-5 h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all font-bold text-lg outline-none"
                                                value={configData.apiSecret}
                                                onChange={(e) => setConfigData({ ...configData, apiSecret: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={configSubmitting}
                                        className="w-full h-16 bg-primary text-white font-black text-xl rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {configSubmitting ? (
                                            <Loader2 className="h-7 w-7 animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="h-6 w-6" />
                                                Save Credentials
                                            </>
                                        )}
                                    </motion.button>
                                </form>

                                <div className="mt-10 pt-8 border-t border-border/50">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Quick Setup Guide
                                    </h3>
                                    <div className="space-y-4 text-sm font-medium text-muted-foreground leading-relaxed">
                                        <div className="flex gap-3">
                                            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                                            <p>Log in to the <a href="https://developers.kite.trade/login" target="_blank" rel="noopener noreferrer" className="text-foreground font-black underline decoration-primary/30 hover:decoration-primary transition-all inline-flex items-center gap-1">Kite Developer Portal <ExternalLink size={12} /></a></p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                                            <div className="space-y-3 w-full">
                                                <p>Create a New App with these parameters:</p>

                                                <div className="space-y-2">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">App Name</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 p-3 rounded-xl bg-muted/50 border border-border/50 font-mono text-[10px] select-all">
                                                            Shahbaz Trades
                                                        </div>
                                                        <button
                                                            onClick={() => handleCopy("Shahbaz Trades", "app")}
                                                            className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shrink-0"
                                                        >
                                                            {copiedField === "app" ? <Check size={14} /> : <Copy size={14} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Redirect URL</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 p-3 rounded-xl bg-muted/50 border border-border/50 font-mono text-[10px] break-all select-all">
                                                            {window.location.origin}/zerodha/redirect
                                                        </div>
                                                        <button
                                                            onClick={() => handleCopy(`${window.location.origin}/zerodha/redirect`, "url")}
                                                            className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shrink-0"
                                                        >
                                                            {copiedField === "url" ? <Check size={14} /> : <Copy size={14} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                                            <p>Copy your generated <strong>API Key</strong> and <strong>Secret</strong> into the form above.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        !isConnected && (
                            <motion.div
                                key="connect-button"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex justify-center mb-12"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleConnect}
                                    className="group relative flex items-center gap-4 px-10 py-5 bg-primary text-white text-lg md:text-xl font-black rounded-[2rem] shadow-2xl shadow-primary/40 transition-all overflow-hidden"
                                >
                                    <span className="relative z-10">Initialize Connection</span>
                                    <ExternalLink className="relative z-10 h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:rotate-12" />
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </motion.button>
                            </motion.div>
                        )
                    )}
                </AnimatePresence>

                {isConnected && (
                    <div className="max-w-5xl mx-auto">
                        <div className="flex md:hidden bg-muted/30 p-1.5 rounded-2xl mb-6 backdrop-blur-xl border border-border/50">
                            <button
                                onClick={() => setActiveTab('trade')}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all duration-300",
                                    activeTab === 'trade' ? "bg-background text-primary shadow-lg" : "text-muted-foreground"
                                )}
                            >
                                <TrendingUp size={16} />
                                EXECUTE
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all duration-300",
                                    activeTab === 'history' ? "bg-background text-primary shadow-lg" : "text-muted-foreground"
                                )}
                            >
                                <History size={16} />
                                HISTORY
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
                            <motion.div
                                className={cn(
                                    "lg:col-span-5 w-full",
                                    activeTab === 'trade' ? "block" : "hidden md:block"
                                )}
                                layout
                            >
                                <div className="bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-3xl shadow-primary/5 sticky top-24">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            {isEditing ? <Edit2 className="h-6 w-6 text-primary" /> : <TrendingUp className="h-6 w-6 text-primary" />}
                                        </div>
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-black tracking-tight">{isEditing ? 'Modify Position' : 'Quick Order'}</h2>
                                            <p className="text-[10px] md:text-xs text-muted-foreground font-black uppercase tracking-widest">MTF EXECUTION GATEWAY</p>
                                        </div>
                                        {isEditing && (
                                            <button onClick={resetForm} className="ml-auto p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>

                                    <StatusAlert success={orderSuccess} error={orderError} className="mb-6 rounded-2xl" />

                                    <form onSubmit={handleOrderSubmit} className="space-y-6">
                                        <div className="space-y-2 relative" ref={dropdownRef}>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Digital Asset (Symbol)</label>
                                            <div className="relative group">
                                                <Search className={cn(
                                                    "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors",
                                                    isEditing && "opacity-50"
                                                )} />
                                                <input
                                                    type="text"
                                                    required
                                                    autoComplete="off"
                                                    placeholder={loadingMargins ? "Connecting to NSE..." : "Search stocks..."}
                                                    className={cn(
                                                        "w-full pl-12 pr-4 h-14 md:h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all font-bold text-sm md:text-lg outline-none",
                                                        isEditing && "opacity-60 cursor-not-allowed bg-muted/50"
                                                    )}
                                                    value={searchQuery}
                                                    onChange={(e) => {
                                                        if (isEditing) return;
                                                        setSearchQuery(e.target.value);
                                                        setFormData({ ...formData, symbol: e.target.value });
                                                        setShowDropdown(true);
                                                    }}
                                                    onFocus={() => !isEditing && setShowDropdown(true)}
                                                    disabled={loadingMargins || isEditing}
                                                />
                                            </div>

                                            <AnimatePresence>
                                                {showDropdown && searchQuery && !loadingMargins && !isEditing && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                                        className="absolute z-50 w-full mt-3 bg-card/95 backdrop-blur-3xl border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto scrollbar-hide ring-1 ring-black/5"
                                                    >
                                                        {filteredMargins.length > 0 ? (
                                                            filteredMargins.map(m => (
                                                                <button
                                                                    key={m.symbol}
                                                                    type="button"
                                                                    className="w-full text-left px-6 py-4.5 hover:bg-primary/5 transition-all border-b border-border last:border-0 flex justify-between items-center group"
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, symbol: m.symbol });
                                                                        setSearchQuery(m.symbol);
                                                                        setShowDropdown(false);
                                                                    }}
                                                                >
                                                                    <span className="font-black text-sm group-hover:text-primary transition-colors">{m.symbol}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-1 rounded-md uppercase">
                                                                            {m.margin}x Margin
                                                                        </span>
                                                                        <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                                                    </div>
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="px-6 py-10 text-center flex flex-col items-center gap-2">
                                                                <AlertCircle className="h-6 w-6 text-muted-foreground/30" />
                                                                <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">No matching symbols</span>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Units</label>
                                                <div className="relative group">
                                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <input
                                                        type="number"
                                                        required
                                                        min="1"
                                                        placeholder="0"
                                                        className="w-full pl-12 pr-4 h-14 md:h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all font-black text-lg outline-none"
                                                        value={formData.quantity}
                                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Target Date</label>
                                                <div className="relative group">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <input
                                                        type="date"
                                                        required
                                                        min={isEditing ? undefined : getISTDate()}
                                                        className="w-full pl-12 pr-3 h-14 md:h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all font-bold text-xs md:text-sm outline-none"
                                                        value={formData.date}
                                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={orderLoading}
                                            type="submit"
                                            className="w-full h-16 md:h-18 bg-primary text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
                                        >
                                            {orderLoading ? (
                                                <Loader2 className="h-7 w-7 animate-spin" />
                                            ) : (
                                                <>
                                                    {isEditing ? <Save className="h-6 w-6" /> : <Send className="h-6 w-6" />}
                                                    {isEditing ? 'UPDATE ORDER' : 'PLACE ORDER'}
                                                </>
                                            )}
                                        </motion.button>
                                    </form>

                                    <div className="mt-8 p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex gap-4 items-center">
                                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                            <AlertCircle className="h-6 w-6 text-amber-500" />
                                        </div>
                                        <p className="text-[10px] text-amber-600/80 leading-relaxed font-bold uppercase tracking-wider">
                                            Ensure sufficient equity before transmission.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                className={cn(
                                    "lg:col-span-7 w-full",
                                    activeTab === 'history' ? "block" : "hidden md:block"
                                )}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="bg-card border border-border rounded-[2.5rem] p-6 md:p-10 shadow-3xl shadow-primary/5 min-h-[500px]">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                <History className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl md:text-2xl font-black tracking-tight">Order History</h2>
                                                <p className="text-[10px] md:text-xs text-muted-foreground font-black uppercase tracking-widest">REAL-TIME EXECUTION LOG</p>
                                            </div>
                                        </div>
                                        {loadingOrders && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
                                    </div>

                                    <div className="space-y-4">
                                        {loadingOrders && orders.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-24 grayscale opacity-40">
                                                <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
                                                <span className="font-black text-xs uppercase tracking-[0.3em]">Querying Orders</span>
                                            </div>
                                        ) : orders.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                {orders.map((order, idx) => (
                                                    <motion.div
                                                        key={order.id || idx}
                                                        initial={{ opacity: 0, x: 10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="group p-4 md:p-6 rounded-3xl md:rounded-[2rem] bg-muted/20 border border-border/50 hover:border-primary/30 hover:bg-muted/40 transition-all duration-300 flex items-center justify-between gap-3"
                                                    >
                                                        <div className="flex items-center gap-3 md:gap-5 min-w-0">
                                                            <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-background border-2 border-border flex items-center justify-center font-black text-xs md:text-lg text-primary shadow-sm shrink-0">
                                                                {order.symbol?.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="font-black text-sm md:text-xl tracking-tight group-hover:text-primary transition-colors truncate">{order.symbol}</h4>
                                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                                    <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest whitespace-nowrap">
                                                                        <Clock size={10} className="text-primary md:w-3 md:h-3" />
                                                                        <span>{order.date?.split('T')[0]}</span>
                                                                    </div>
                                                                    <div className="hidden xs:block h-1 w-1 rounded-full bg-border"></div>
                                                                    <span className="text-[9px] md:text-[10px] font-black text-primary uppercase whitespace-nowrap">{order.quantity} Units</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <button
                                                                onClick={() => handleEditOrder(order)}
                                                                className="h-9 w-9 md:h-11 md:w-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-background border border-border hover:border-primary/50 text-foreground hover:text-primary transition-all shadow-sm"
                                                            >
                                                                <Edit2 size={14} className="md:w-4 md:h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(order.id)}
                                                                className="h-9 w-9 md:h-11 md:w-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-background border border-border hover:border-rose-500/50 text-foreground hover:text-rose-500 transition-all shadow-sm"
                                                            >
                                                                <Trash2 size={14} className="md:w-4 md:h-4" />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                                                <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center mb-6 relative overflow-hidden group">
                                                    <ShoppingBag className="h-10 w-10 text-muted-foreground/30 relative z-10 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12" />
                                                    <div className="absolute inset-0 bg-primary/5 -translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                                </div>
                                                <h3 className="text-2xl font-black tracking-tight mb-2">No Orders</h3>
                                                <p className="text-muted-foreground text-sm font-medium leading-relaxed uppercase tracking-widest">
                                                    Your order history is empty.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmationModal
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Order"
                message="Are you sure you want to delete this order record? This action cannot be undone."
            />

        </div>
    );
};

export default ZerodhaDashboard;
