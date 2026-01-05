import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    RefreshCcw,
    Code,
    AlertTriangle,
    Loader2,
    FileCode
} from 'lucide-react';
import { configAPI } from '../../api/axios';
import AdminFormContainer from '../shared/AdminFormContainer';
import StatusAlert from '../shared/StatusAlert';

const SystemConfigTab = () => {
    const [configJson, setConfigJson] = useState('');
    const [configLoading, setConfigLoading] = useState(false);
    const [configFetching, setConfigFetching] = useState(false);
    const [configSuccess, setConfigSuccess] = useState('');
    const [configError, setConfigError] = useState('');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setConfigFetching(true);
        setConfigSuccess('');
        setConfigError('');
        try {
            const response = await configAPI.getConfig();
            setConfigJson(JSON.stringify(response.data, null, 2));
            setConfigSuccess('Configuration loaded');
        } catch (error) {
            setConfigError('Failed to load system config');
        } finally {
            setConfigFetching(false);
        }
    };

    const handleUpdateConfig = async (e) => {
        e.preventDefault();
        setConfigLoading(true);
        setConfigSuccess('');
        setConfigError('');
        try {
            const updatedConfig = JSON.parse(configJson);
            await configAPI.updateConfig(updatedConfig);
            setConfigSuccess('System configuration updated!');
        } catch (error) {
            setConfigError(error instanceof SyntaxError ? 'Invalid JSON format' : 'Failed to update config');
        } finally {
            setConfigLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto">
            <AdminFormContainer
                title="System Configuration"
                onSubmit={handleUpdateConfig}
            >
                <StatusAlert success={configSuccess} error={configError} className="mb-6" />

                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4 items-start mb-8 shadow-sm shadow-primary/5">
                    <AlertTriangle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                        <strong className="text-primary font-black uppercase tracking-tighter mr-1">Direct Override:</strong>
                        This modifies core system parameters. Ensure your JSON syntax is 100% valid before committing.
                    </p>
                </div>

                <div className="rounded-[2.5rem] border border-border bg-muted/30 overflow-hidden shadow-2xl shadow-black/5">
                    <div className="px-6 py-3 border-b border-border bg-card flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileCode size={16} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">config_schema.json</span>
                        </div>
                        {configFetching && <Loader2 className="animate-spin h-3 w-3 text-primary" />}
                    </div>
                    <textarea
                        className="w-full min-h-[500px] p-8 bg-transparent focus:outline-none font-mono text-sm leading-relaxed text-blue-600 dark:text-blue-400"
                        value={configJson}
                        onChange={(e) => setConfigJson(e.target.value)}
                        spellCheck={false}
                        placeholder='{ "key": "value" }'
                        disabled={configFetching}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                        type="submit"
                        disabled={configLoading || configFetching}
                        className="btn btn-primary flex-grow h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {configLoading ? <Loader2 className="animate-spin h-6 w-6 mr-2" /> : <Save className="mr-2 h-6 w-6" />}
                        {configLoading ? 'Updating...' : 'Commit Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={fetchConfig}
                        disabled={configFetching || configLoading}
                        className="btn bg-muted border border-border h-16 px-10 rounded-2xl font-black text-muted-foreground hover:bg-muted/80 flex items-center justify-center transition-all"
                    >
                        {configFetching ? <Loader2 className="animate-spin h-6 w-6" /> : <RefreshCcw className="h-6 w-6" />}
                        <span className="hidden sm:inline ml-2">Reload</span>
                    </button>
                </div>
            </AdminFormContainer>
        </motion.div>
    );
};

export default SystemConfigTab;