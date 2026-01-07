import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { authAPI } from '../api/axios';
import { googleLogout } from '@react-oauth/google';

const AuthContext = createContext(null);
const CONFIG_CACHE_KEY = 'app_global_config';
const CACHE_EXPIRY = 300000;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [appConfig, setAppConfig] = useState({
        auth: { google: true, truecaller: true, email: true }
    });

    const [appLoading, setAppLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [configLoading, setConfigLoading] = useState(true);
    const authLoadingRef = useRef(false);

    useEffect(() => {
        authLoadingRef.current = authLoading;
    }, [authLoading]);

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
            if (data) {
                setAppConfig(data);
                localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify({ data, timestamp: now }));
            }
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
            if (err.response?.status === 401 || err.response?.status === 403) {
                setUser(null);
            }
        } finally {
            setAppLoading(false);
        }
    };

    useEffect(() => {
        // Initial Mount Auth Check
        if (!isInitialized.current) {
            isInitialized.current = true;
            Promise.all([fetchGlobalConfig(), refreshUserData()]);
        }

        // --- DEVICE SYNC LOGIC ---
        // Re-check auth whenever user returns to the tab (Syncs changes from other devices)
        const handleFocus = () => {
            fetchGlobalConfig(true);
            if (isInitialized.current && !authLoadingRef.current) {
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

    const login = (userData, showLoading = true) => {
        if (showLoading) { setAuthLoading(true) }
        setUser(userData);
        if (showLoading) { setAuthLoading(false) }
    };

    const logout = async () => {
        setAuthLoading(true);
        try {
            await authAPI.logout();
            googleLogout()
        } finally {
            setUser(null);
            setAuthLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            appLoading,
            authLoading,
            refreshUserData,
            configLoading,
            appConfig,
            setAuthLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);