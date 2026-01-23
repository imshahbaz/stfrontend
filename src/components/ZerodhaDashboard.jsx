import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Zap, Loader2, CheckCircle2, Send, Calendar, Hash, Search, AlertCircle, ShoppingBag, Clock, ArrowUpRight, Edit2, X, Save, Trash2 } from 'lucide-react';
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

    // Form States
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

    // Orders States
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);

    // Stock Search States
    const [margins, setMargins] = useState([]);
    const [loadingMargins, setLoadingMargins] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

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

        // Close dropdown when clicking outside
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
                // Sort by date descending if possible, or just as they come
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
            const response = await zerodhaAPI.getMe();
            if (response.status === 200 && response.data.data) {
                setIsConnected(true);
                setZerodhaUser(response.data.data);
            }
        } catch (error) {
            console.error("Zerodha connection check failed:", error);
            setIsConnected(false);
        } finally {
            setIsLoading(false);
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
        const apiKey = import.meta.env.VITE_ZERODHA_API_KEY || "YOUR_API_KEY";
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

                // If the deleted order was being edited, reset the form
                if (isEditing && editingOrder?.id === orderToDelete) {
                    resetForm();
                }

                fetchOrders();

                // Clear success message after 3 seconds
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
                // Refresh orders after successful placement
                fetchOrders();

                // Clear success message after 2 seconds
                setTimeout(() => {
                    setOrderSuccess('');
                }, 3000);
            }
        } catch (err) {
            setOrderError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'place'} order. Please check your connection.`);
        } finally {
            setOrderLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-muted-foreground font-medium animate-pulse">Checking connection status...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-8 pt-8 md:pt-16 pb-20">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center mb-12"
            >
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm mb-6 border ${isConnected ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                    {isConnected ? <CheckCircle2 className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                    {isConnected ? 'Kite Connected' : 'Kite Connect Integration'}
                </div>

                <h1 className="text-3xl md:text-7xl font-black tracking-tighter mb-4 md:mb-6">
                    {isConnected ? 'Welcome Back,' : 'Connect Your'} <span className="text-primary italic">{isConnected ? (zerodhaUser?.user_name || 'Trader') : 'Zerodha'}</span> {isConnected ? '' : 'Account'}
                </h1>

                <p className="text-base md:text-xl text-muted-foreground max-w-2xl mb-8 md:mb-10 font-medium leading-relaxed">
                    {isConnected
                        ? `You are successfully connected to your Zerodha account (${zerodhaUser?.user_id || user?.email}). Enjoy advanced trading tools and real-time execution.`
                        : 'Unlock advanced trading features, real-time portfolio tracking, and seamless execution by connecting your Zerodha account.'
                    }
                </p>

                {/* Daily Re-authentication Notice */}
                <div className="mb-8 md:mb-10 p-3 md:p-4 px-4 md:px-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 max-w-xl mx-auto flex items-center gap-3 text-amber-500 text-xs md:text-sm font-bold text-left">
                    <Zap className="h-4 w-4 shrink-0" />
                    <span>Please Note: Per SEBI regulations, you must re-authenticate your Zerodha account every morning.</span>
                </div>

                {!isConnected && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleConnect}
                        className="group relative flex items-center gap-3 px-6 md:px-8 py-3.5 md:py-4 bg-primary text-white text-base md:text-lg font-black rounded-2xl shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative">Connect to Zerodha</span>
                        <ExternalLink className="relative h-4 w-4 md:h-5 md:w-5 group-hover:rotate-45 transition-transform" />
                    </motion.button>
                )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
                {/* MTF Order Form - Only shown when connected */}
                {isConnected && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full"
                    >
                        <div className="bg-card border border-border rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-black/5 h-full transition-all">
                            <div className="flex items-center justify-between mb-6 md:mb-8">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center">
                                        {isEditing ? <Edit2 className="h-5 w-5 md:h-6 md:w-6 text-primary" /> : <Send className="h-5 w-5 md:h-6 md:w-6 text-primary" />}
                                    </div>
                                    <div>
                                        <h2 className="text-lg md:text-2xl font-black tracking-tight">{isEditing ? 'Update MTF Order' : 'Place MTF Order'}</h2>
                                        <p className="text-xs md:text-sm text-muted-foreground font-medium">Margin Trade Funding</p>
                                    </div>
                                </div>
                                {isEditing && (
                                    <button
                                        onClick={resetForm}
                                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                        title="Cancel editing"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>

                            <StatusAlert success={orderSuccess} error={orderError} className="mb-6 md:mb-8" />

                            <form onSubmit={handleOrderSubmit} className="space-y-5 md:space-y-6">
                                <div className="space-y-2 relative" ref={dropdownRef}>
                                    <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Search Symbol</label>
                                    <div className="relative group">
                                        <Search className={cn(
                                            "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground group-focus-within:text-primary transition-colors",
                                            isEditing && "opacity-50"
                                        )} />
                                        <input
                                            type="text"
                                            required
                                            placeholder={loadingMargins ? "Loading..." : "Stock name..."}
                                            className={cn(
                                                "input pl-10 md:pl-12 h-12 md:h-14 rounded-xl md:rounded-2xl bg-muted/30 border-border/50 focus:bg-background transition-all font-bold text-sm md:text-base",
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
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute z-20 w-full mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden max-h-[250px] overflow-y-auto scrollbar-hide"
                                            >
                                                {filteredMargins.length > 0 ? (
                                                    filteredMargins.map(m => (
                                                        <button
                                                            key={m.symbol}
                                                            type="button"
                                                            className="w-full text-left px-6 py-4 hover:bg-primary/10 transition-colors border-b border-border last:border-0 flex justify-between items-center"
                                                            onClick={() => {
                                                                setFormData({ ...formData, symbol: m.symbol });
                                                                setSearchQuery(m.symbol);
                                                                setShowDropdown(false);
                                                            }}
                                                        >
                                                            <span className="font-bold">{m.symbol}</span>
                                                            <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-1 rounded-lg uppercase tracking-tighter">Listed</span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-6 py-4 text-center text-muted-foreground text-sm">
                                                        No stocks found
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Quantity</label>
                                        <div className="relative group">
                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                placeholder="100"
                                                className="input pl-10 md:pl-12 h-12 md:h-14 rounded-xl md:rounded-2xl bg-muted/30 border-border/50 focus:bg-background transition-all font-bold text-sm md:text-base"
                                                value={formData.quantity}
                                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Date</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="date"
                                                required
                                                min={isEditing ? undefined : getISTDate()}
                                                className="input pl-10 md:pl-12 h-12 md:h-14 rounded-xl md:rounded-2xl bg-muted/30 border-border/50 focus:bg-background transition-all font-bold text-sm md:text-base"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={orderLoading}
                                    type="submit"
                                    className="w-full h-14 md:h-16 bg-primary text-white font-black text-base md:text-lg rounded-xl md:rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none mt-2 md:mt-4"
                                >
                                    {orderLoading ? (
                                        <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
                                    ) : (
                                        <>
                                            {isEditing ? <Save className="h-4 w-4 md:h-5 md:w-5" /> : <Send className="h-4 w-4 md:h-5 md:w-5" />}
                                            {isEditing ? 'Update Order' : 'Place Order'}
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            {/* Trading Notice inside the card for better flow */}
                            <div className="mt-6 md:mt-8 p-4 md:p-6 rounded-2xl md:rounded-3xl bg-muted/50 border border-border flex gap-3 md:gap-4 items-start">
                                <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0 mt-0.5 md:mt-1" />
                                <div>
                                    <h4 className="font-bold mb-0.5 md:mb-1 text-xs md:text-base">Trading Notice</h4>
                                    <p className="text-[10px] md:text-sm text-muted-foreground leading-relaxed font-medium">
                                        MTF orders are executed through your linked Zerodha account. Ensure sufficient margin is available.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Orders List Section */}
                {isConnected && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full"
                    >
                        <div className="bg-card border border-border rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-black/5 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-6 md:mb-8">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <ShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg md:text-2xl font-black tracking-tight">Your Orders</h2>
                                        <p className="text-xs md:text-sm text-muted-foreground font-medium">Recent execution history</p>
                                    </div>
                                </div>
                                {loadingOrders && <Loader2 className="h-4 w-4 md:h-5 md:w-5 text-primary animate-spin" />}
                            </div>

                            <div className="flex-grow overflow-y-auto max-h-[500px] md:max-h-[600px] pr-2 scrollbar-hide">
                                {loadingOrders && orders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 md:py-20 grayscale opacity-50">
                                        <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin mb-4" />
                                        <span className="font-bold text-sm">Fetching history...</span>
                                    </div>
                                ) : orders.length > 0 ? (
                                    <div className="space-y-3 md:space-y-4">
                                        {orders.map((order, idx) => (
                                            <motion.div
                                                key={order.id || idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                                                className="group p-4 md:p-5 rounded-2xl md:rounded-3xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-background border border-border flex items-center justify-center font-black text-[10px] md:text-xs shrink-0">
                                                        {order.symbol?.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-black text-base md:text-lg group-hover:text-primary transition-colors truncate">{order.symbol}</h4>
                                                        <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-wider">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{order.date?.split('T')[0]}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditOrder(order)}
                                                        className="p-2 hover:bg-primary/20 rounded-xl transition-colors text-muted-foreground hover:text-primary"
                                                        title="Edit Order"
                                                    >
                                                        <Edit2 className="h-4 w-4 md:h-5 md:w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(order.id)}
                                                        className="p-2 hover:bg-red-500/20 rounded-xl transition-colors text-muted-foreground hover:text-red-500"
                                                        title="Delete Order"
                                                    >
                                                        <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
                                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-muted flex items-center justify-center mb-4 md:mb-6">
                                            <ShoppingBag className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground/30" />
                                        </div>
                                        <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">No Orders</h3>
                                        <p className="text-[10px] md:text-sm text-muted-foreground max-w-[180px] md:max-w-[200px] font-medium leading-relaxed">
                                            Place your first MTF order to see them here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <ConfirmationModal
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Order"
                message="Are you sure you want to delete this MTF order? This action cannot be undone."
            />
        </div>
    );
};

export default ZerodhaDashboard;
