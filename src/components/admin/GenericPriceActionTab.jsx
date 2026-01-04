import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  RefreshCcw, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Save, 
  X, 
  Store,
  Edit3,
  Trash2,
  Loader2
} from 'lucide-react';
import dayjs from 'dayjs';

import { marginAPI } from '../../api/axios';
import ConfirmationModal from './ConfirmationModal';
import AdminFormContainer from '../shared/AdminFormContainer';
import AdminListContainer from '../shared/AdminListContainer';
import AdminTable from '../shared/AdminTable';
import StatusAlert from '../shared/StatusAlert';
import { cn } from '../../lib/utils';

const GenericPriceActionTab = ({
    type,
    title,
    fetchKey,
    apiMethods,
    refreshApiMethod
}) => {
    const [margins, setMargins] = useState([]);
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({ symbol: '', date: '', high: '', low: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);

    const [fetchLoading, setFetchLoading] = useState(false);
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [refreshSuccess, setRefreshSuccess] = useState('');
    const [refreshError, setRefreshError] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: null });

    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        fetchMargins();
    }, []);

    const fetchMargins = async () => {
        try {
            const res = await marginAPI.getAllMargins();
            setMargins(res.data.data);
        } catch (err) { console.error(err); }
    };

    const fetchItems = async () => {
        if (!form.symbol) return;
        setFetchLoading(true);
        try {
            const res = await apiMethods.get(form.symbol);
            const data = res.data.data[fetchKey] || [];
            setItems(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
        finally { setFetchLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        setError('');
        try {
            if (editingId) {
                await apiMethods.update(form);
                setSuccess(`${title} entry updated!`);
            } else {
                await apiMethods.create(form);
                setSuccess(`${title} entry created!`);
            }
            fetchItems();
            handleCancel();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to save ${title}`);
        } finally { setLoading(false); }
    };

    const handleEdit = (item) => {
        setForm({
            symbol: item.symbol,
            date: item.date,
            high: item.high,
            low: item.low
        });
        setEditingId(item.date);
        setSearchQuery(item.symbol);
    };

    const handleDelete = async (item) => {
        try {
            await apiMethods.delete(item.symbol, item.date);
            fetchItems();
        } catch (err) { console.error(err); }
    };

    const handleRefreshData = async () => {
        setRefreshLoading(true);
        setRefreshSuccess('');
        setRefreshError('');
        try {
            await refreshApiMethod();
            setRefreshSuccess('Sync operation completed successfully');
            if (form.symbol) fetchItems();
        } catch (err) {
            setRefreshError('Sync failed: Market data provider unavailable');
        } finally { setRefreshLoading(false); }
    };

    const handleCancel = () => {
        setForm({ ...form, date: '', high: '', low: '' });
        setEditingId(null);
    };

    const handleOpenModal = (title, message, onConfirm) => {
        setModalConfig({ title, message, onConfirm });
        setModalOpen(true);
    };

    const filteredMargins = margins.filter(m => 
        m.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8);

    const columns = [
        { field: 'date', label: 'Detection Date', render: (item) => <span className="font-bold">{item.date}</span> },
        { field: 'high', label: 'High', render: (item) => <span className="font-black text-green-500">₹{item.high}</span> },
        { field: 'low', label: 'Low', render: (item) => <span className="font-black text-destructive">₹{item.low}</span> },
        {
            field: 'actions',
            label: 'Actions',
            align: 'right',
            render: (item) => (
                <div className="flex justify-end gap-1">
                    <button onClick={() => handleEdit(item)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                        <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleOpenModal(`Delete ${title}`, `Remove entry for ${item.date}?`, () => handleDelete(item))} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const renderMobileCard = (item) => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="font-black text-primary text-lg">{item.symbol}</span>
                <span className="px-3 py-1 rounded-lg bg-muted text-[10px] font-black uppercase tracking-wider">{item.date}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-green-500/10 text-green-600 border border-green-500/20 text-center">
                    <span className="block text-[10px] font-black uppercase opacity-60">High</span>
                    <span className="text-sm font-black">₹{item.high}</span>
                </div>
                <div className="p-3 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 text-center">
                    <span className="block text-[10px] font-black uppercase opacity-60">Low</span>
                    <span className="text-sm font-black">₹{item.low}</span>
                </div>
            </div>
            <div className="flex gap-3">
                <button onClick={() => handleEdit(item)} className="flex-1 py-3 rounded-xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center gap-2">
                    <Edit3 size={16} /> Edit
                </button>
                <button onClick={() => handleOpenModal(`Delete ${title}`, `Remove entry?`, () => handleDelete(item))} className="flex-1 py-3 rounded-xl bg-destructive/10 text-destructive font-black text-sm flex items-center justify-center gap-2">
                    <Trash2 size={16} /> Delete
                </button>
            </div>
        </div>
    );

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <AdminFormContainer
                        title={editingId ? `Update ${title}` : `Insert ${title}`}
                        onSubmit={handleSubmit}
                    >
                        <StatusAlert success={success} error={error} className="mb-6" />

                        <div className="space-y-6">
                            <div className="relative">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">Market Symbol</label>
                                <div className="relative">
                                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        className="input pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:bg-background"
                                        placeholder="Search stock..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setForm(prev => ({ ...prev, symbol: '' }));
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        required
                                    />
                                </div>
                                {showDropdown && searchQuery && !form.symbol && (
                                    <div className="absolute z-20 w-full mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        {filteredMargins.map(m => (
                                            <button
                                                key={m.symbol}
                                                type="button"
                                                className="w-full text-left px-6 py-4 hover:bg-primary/10 transition-colors border-b border-border last:border-0 flex justify-between items-center"
                                                onClick={() => {
                                                    setForm(prev => ({ ...prev, symbol: m.symbol }));
                                                    setSearchQuery(m.symbol);
                                                    setShowDropdown(false);
                                                }}
                                            >
                                                <span className="font-bold">{m.symbol}</span>
                                                <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-1 rounded-lg">{m.margin}x</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Execution Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="date"
                                        className="input pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:bg-background"
                                        value={form.date}
                                        onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">High Price</label>
                                    <div className="relative group">
                                        <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 opacity-60 group-focus-within:opacity-100 transition-opacity" />
                                        <input
                                            type="number"
                                            step="0.05"
                                            className="input pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:bg-background"
                                            value={form.high}
                                            onChange={(e) => setForm(prev => ({ ...prev, high: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Low Price</label>
                                    <div className="relative group">
                                        <TrendingDown className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive opacity-60 group-focus-within:opacity-100 transition-opacity" />
                                        <input
                                            type="number"
                                            step="0.05"
                                            className="input pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:bg-background"
                                            value={form.low}
                                            onChange={(e) => setForm(prev => ({ ...prev, low: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary flex-grow h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                                >
                                    {loading ? <Loader2 className="animate-spin h-6 w-6 mr-2" /> : <Save className="mr-2 h-6 w-6" />}
                                    {editingId ? 'Update Entry' : 'Add Entry'}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="btn bg-muted border border-border h-14 px-8 rounded-2xl font-black text-muted-foreground"
                                    >
                                        <X size={24} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </AdminFormContainer>
                </div>

                <div>
                    <AdminListContainer
                        title={`${title} Database`}
                        actions={
                            <div className="flex gap-2">
                                <button
                                    onClick={fetchItems}
                                    disabled={fetchLoading || !form.symbol}
                                    className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center gap-2 hover:bg-primary/20 disabled:opacity-50 transition-all"
                                >
                                    {fetchLoading ? <Loader2 className="animate-spin h-3 w-3" /> : <Search size={14} />} Query
                                </button>
                                <button
                                    onClick={handleRefreshData}
                                    disabled={refreshLoading}
                                    className="btn btn-primary px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-primary/20"
                                >
                                    {refreshLoading ? <Loader2 className="animate-spin h-3 w-3" /> : <RefreshCcw size={14} />} Sync
                                </button>
                            </div>
                        }
                    >
                        <AnimatePresence>
                            {(refreshSuccess || refreshError) && (
                                <StatusAlert success={refreshSuccess} error={refreshError} className="mb-4" />
                            )}
                        </AnimatePresence>
                        <AdminTable
                            columns={columns}
                            data={items}
                            renderMobileCard={renderMobileCard}
                            keyField="date"
                        />
                    </AdminListContainer>
                </div>
            </div>

            <ConfirmationModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
            />
        </>
    );
};

export default GenericPriceActionTab;