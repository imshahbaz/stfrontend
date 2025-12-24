import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { authAPI } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const isInitialized = useRef(false);

    useEffect(() => {
        const checkAuth = async () => {
            if (isInitialized.current) return;
            isInitialized.current = true;

            try {
                const res = await authAPI.getMe();
                setUser(res.data);
            } catch (err) {
                setUser(null);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        window.addEventListener('auth-expired', handleExpiry);

        return () => {
            window.removeEventListener('auth-expired', handleExpiry);
        };
    }, []);

    const handleExpiry = () => {
        setUser(null);
    };

    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        await authAPI.logout();
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);