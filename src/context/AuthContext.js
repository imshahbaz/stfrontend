import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Stores { email, role }
    const [token, setToken] = useState(null); // Stores JWT token
    const [loading, setLoading] = useState(true);

    // Initial check: Runs once when the app opens
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // This calls your protected GET /auth/me (token is in cookies)
                const res = await api.get('api/auth/me');
                setUser(res.data);
                setToken('cookie'); // Indicate token is in cookies
            } catch (err) {
                setUser(null);
                setToken(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        // Listen for the 401 interceptor event
        const handleExpiry = () => {
            setUser(null);
            setToken(null);
        };
        window.addEventListener('auth-expired', handleExpiry);
        return () => window.removeEventListener('auth-expired', handleExpiry);
    }, []);

    const login = (userData) => {
        setUser(userData);
        setToken('cookie'); // Token is in cookies
    };

    const logout = async () => {
        await api.post('/api/auth/logout');
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);