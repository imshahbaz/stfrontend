import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { authAPI } from '../api/axios';

const AuthContext = createContext(null);
const CONFIG_CACHE_KEY = 'app_global_config';
const CACHE_EXPIRY = 300000;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [configLoading, setConfigLoading] = useState(true);
    const [appConfig, setAppConfig] = useState({
        auth: { google: true, truecaller: true, email: true }
    });

    const fetchGlobalConfig = async (forceRefresh = false) => {
        const cached = JSON.parse(localStorage.getItem(CONFIG_CACHE_KEY));
        const now = Date.now();

        if (!forceRefresh && cached && (now - cached.timestamp < CACHE_EXPIRY)) {
            setAppConfig(cached.data);
            setConfigLoading(false);
            return;
        }

        try {
            const res = await authAPI.clientConfig();
            const data = res.data.data;
            setAppConfig(data);
            localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify({ data, timestamp: now }));
        } catch (err) {
            console.error("Public config fetch failed", err);
        } finally {
            setConfigLoading(false);
        }
    };

    const isInitialized = useRef(false);

    // Function to re-verify session and fetch latest user data
    const refreshUserData = async () => {
        try {
            const res = await authAPI.getMe();
            setUser(res.data.data);
        } catch (err) {
            // Only clear user if the error is an Auth error (401/403)
            if (err.response?.status === 401 || err.response?.status === 403) {
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial Mount Auth Check
        if (!isInitialized.current) {
            isInitialized.current = true;
            fetchGlobalConfig();
            refreshUserData();
        }

        // --- DEVICE SYNC LOGIC ---
        // Re-check auth whenever user returns to the tab (Syncs changes from other devices)
        const handleFocus = () => {
            fetchGlobalConfig(true);
            if (isInitialized.current) {
                refreshUserData();
            }
        };

        const handleExpiry = () => {
            setUser(null);
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('auth-expired', handleExpiry);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('auth-expired', handleExpiry);
        };
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        setLoading(true);
        try {
            await authAPI.logout();
        } finally {
            setUser(null);
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, refreshUserData, configLoading, appConfig }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);