import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { authAPI } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
            refreshUserData();
        }

        // --- DEVICE SYNC LOGIC ---
        // Re-check auth whenever user returns to the tab (Syncs changes from other devices)
        const handleFocus = () => {
            // Optional: only refresh if we already have a user (logged in)
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
        try {
            await authAPI.logout();
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, refreshUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);