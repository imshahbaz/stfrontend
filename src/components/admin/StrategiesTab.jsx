import React, { useState, useEffect } from 'react';
import {
    Type,
    Code,
    Save,
    X,
    Settings,
    Power,
    Edit3,
    Trash2,
    Loader2
} from 'lucide-react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';

import { strategyAPI } from '../../api/axios';
import ConfirmationModal from './ConfirmationModal';
import AdminFormContainer from '../shared/AdminFormContainer';
import AdminListContainer from '../shared/AdminListContainer';
import AdminTable from '../shared/AdminTable';
import StatusAlert from '../shared/StatusAlert';
import { cn } from '../../lib/utils';

const StrategiesTab = () => {
    const [strategies, setStrategies] = useState([]);
    const [strategyForm, setStrategyForm] = useState({ name: '', scanClause: '', active: false });
    const [editingId, setEditingId] = useState(null);
    const [strategyLoading, setStrategyLoading] = useState(false);
    const [strategySuccess, setStrategySuccess] = useState('');
    const [strategyError, setStrategyError] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: null });

    const toTitleCase = (str) => {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    useEffect(() => {
        fetchStrategies();
    }, []);

    const fetchStrategies = async () => {
        try {
            const response = await strategyAPI.getStrategiesAdmin();
            const rawData = Array.isArray(response.data.data) ? response.data.data : [];
            const sortedData = [...rawData].sort((a, b) => a.name.localeCompare(b.name));
            setStrategies(sortedData);
        } catch (error) { console.error(error); }
    };

    const handleStrategySubmit = async (e) => {
        e.preventDefault();
        setStrategyLoading(true);
        setStrategySuccess('');
        setStrategyError('');
        try {
            if (editingId) {
                await strategyAPI.updateStrategy(strategyForm);
                setStrategySuccess('Strategy updated!');
            } else {
                await strategyAPI.createStrategy(strategyForm);
                setStrategySuccess('Strategy created!');
            }
            fetchStrategies();
            handleCancel();
        } catch (error) {
            setStrategyError(error.response?.data?.message || 'Failed to save strategy');
        } finally { setStrategyLoading(false); }
    };

    const handleCancel = () => {
        setStrategyForm({ name: '', scanClause: '', active: false });
        setEditingId(null);
    };

    const handleOpenModal = (title, message, onConfirm) => {
        setModalConfig({ title, message, onConfirm });
        setModalOpen(true);
    };

    const columns = [
        {
            field: 'name',
            label: 'Strategy Name',
            render: (s) => (
                <div className="flex flex-col">
                    <span className="font-black text-primary">{toTitleCase(s.name)}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mt-1 opacity-60">
                        {s.name}
                    </span>
                </div>
            )
        },
        {
            field: 'active',
            label: 'Status',
            render: (s) => (
                <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                    s.active ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                )}>
                    {s.active ? "Live" : "Disabled"}
                </span>
            )
        },
        {
            field: 'actions',
            label: 'Actions',
            align: 'right',
            render: (s) => (
                <div className="flex justify-end gap-1">
                    <button
                        onClick={() => { setStrategyForm(s); setEditingId(s.name); }}
                        className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                    >
                        <Edit3 size={16} />
                    </button>
                    <button
                        onClick={() => handleOpenModal('Delete Strategy', `Remove ${toTitleCase(s.name)}?`, () => strategyAPI.deleteStrategy(s.name).then(fetchStrategies))}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const renderMobileCard = (s) => (
        <div className="flex flex-col py-3 px-4 h-full group">
            <div className="flex justify-between items-start">
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Strategy
                        </span>
                    </div>
                    <h3 className="text-[15px] font-semibold tracking-tight leading-tight group-hover:text-primary transition-colors">
                        {toTitleCase(s.name)}
                    </h3>
                </div>

                <div className="text-right">
                    <div className="flex items-center justify-end gap-1 mb-0.5 uppercase">
                        <span className="text-[10px] font-medium text-muted-foreground">
                            Status
                        </span>
                        <span className={cn(
                            "text-[13px] font-bold",
                            s.active ? "text-green-500" : "text-muted-foreground/60"
                        )}>
                            {s.active ? "Live" : "Disabled"}
                        </span>
                    </div>
                    <div className="text-[13px] font-semibold text-primary/80">
                        Operational <span className="text-muted-foreground text-[11px] font-medium ml-0.5">State</span>
                    </div>
                </div>
            </div>

            {/* Info Row - Exact match to Strategies Results style */}
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/40">
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">ID:</span>
                    <span className="text-[11px] font-bold uppercase tracking-tighter">{s.name}</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { setStrategyForm(s); setEditingId(s.name); }}
                        className="flex items-center gap-1 text-primary hover:opacity-80 transition-opacity"
                    >
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Edit</span>
                        <Edit3 size={14} />
                    </button>
                    <button
                        onClick={() => handleOpenModal('Delete Strategy', `Remove ${toTitleCase(s.name)}?`, () => strategyAPI.deleteStrategy(s.name).then(fetchStrategies))}
                        className="flex items-center gap-1 text-destructive hover:opacity-80 transition-opacity"
                    >
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Delete</span>
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="flex flex-col gap-8">
                <div>
                    <AdminFormContainer
                        title={editingId ? 'Update Strategy' : 'Insert Strategy'}
                        onSubmit={handleStrategySubmit}
                    >
                        <StatusAlert success={strategySuccess} error={strategyError} className="mb-6" />

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Execution Label</label>
                                <div className="relative">
                                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        disabled={!!editingId}
                                        className="input pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:bg-background"
                                        value={strategyForm.name}
                                        onChange={(e) => setStrategyForm(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Scan Logic (JSON)</label>
                                <div className="relative">
                                    <Code className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                                    <textarea
                                        rows={6}
                                        className="input pl-12 py-4 h-auto rounded-2xl bg-muted/30 border-border/50 focus:bg-background font-mono text-xs"
                                        value={strategyForm.scanClause}
                                        onChange={(e) => setStrategyForm(prev => ({ ...prev, scanClause: e.target.value }))}
                                        required
                                        placeholder='{ "condition": "price > 100" }'
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border">
                                <Checkbox.Root
                                    className="flex h-6 w-6 appearance-none items-center justify-center rounded-lg bg-background border border-border outline-none focus:ring-2 focus:ring-primary data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 transition-colors"
                                    id="active"
                                    checked={strategyForm.active}
                                    onCheckedChange={(checked) => setStrategyForm(prev => ({ ...prev, active: checked }))}
                                >
                                    <Checkbox.Indicator>
                                        <CheckIcon className="h-4 w-4 text-white font-black" />
                                    </Checkbox.Indicator>
                                </Checkbox.Root>
                                <label className="flex items-center gap-2 cursor-pointer" htmlFor="active">
                                    <Power size={16} className={strategyForm.active ? "text-green-500" : "text-muted-foreground"} />
                                    <span className="text-sm font-black uppercase tracking-tight">Operational Status</span>
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={strategyLoading}
                                    className="btn btn-primary flex-grow h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                                >
                                    {strategyLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="mr-2 h-5 w-5" />}
                                    {editingId ? 'Update Entry' : 'Add Entry'}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="btn bg-muted border border-border h-14 px-8 rounded-2xl font-black text-muted-foreground hover:bg-muted/80"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </AdminFormContainer>
                </div>

                <div>
                    <AdminListContainer>
                        <AdminTable
                            columns={columns}
                            data={strategies}
                            renderMobileCard={renderMobileCard}
                            keyField="name"
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

export default StrategiesTab;