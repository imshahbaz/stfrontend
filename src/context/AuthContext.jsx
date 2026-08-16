import { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react';
import { login as loginRequest, logout as logoutRequest, fetchCurrentUser } from '../api/service';

const AuthContext = createContext(null);

function extractUserAndToken(data) {
  if (!data) return { user: null, token: null };

  const token = data.token || data.accessToken || data.jwt || data.user?.token || null;
  const rawUser = data.user || (data.userId || data.email || data.role ? data : null);

  if (!rawUser || typeof rawUser !== 'object') {
    return { user: null, token };
  }

  const user = {
    userId: rawUser.userId ?? rawUser.id,
    email: rawUser.email || '',
    username: rawUser.username || rawUser.email || '',
    name: rawUser.name || rawUser.username || rawUser.email || '',
    role: (rawUser.role || 'ADMIN').toUpperCase(),
    theme: rawUser.theme || 'DARK',
    mobile: rawUser.mobile,
    profile: rawUser.profile || '',
  };

  return { user, token };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('klikpanel_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [initializing, setInitializing] = useState(true);
  const isLoggingInRef = useRef(false);

  const applySession = useCallback((data) => {
    const { user: normalized, token } = extractUserAndToken(data);
    if (normalized) {
      setUser(normalized);
      localStorage.setItem('klikpanel_user', JSON.stringify(normalized));
    }
    if (token) {
      localStorage.setItem('klikpanel_token', token);
    }
    return normalized;
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    localStorage.removeItem('klikpanel_user');
    localStorage.removeItem('klikpanel_token');
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const userData = await fetchCurrentUser();
        if (!active || isLoggingInRef.current) return;
        const { user: normalized } = extractUserAndToken(userData);
        if (normalized) {
          applySession(userData);
        }
      } catch (err) {
        if (!active || isLoggingInRef.current) return;
        // Only clear session if no user is currently authenticated
        clearSession();
      } finally {
        if (active) setInitializing(false);
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, [applySession, clearSession]);

  const login = useCallback(
    async (email, password) => {
      isLoggingInRef.current = true;
      try {
        const userData = await loginRequest({ email, password });
        const normalized = applySession(userData);
        setInitializing(false);
        return normalized;
      } finally {
        isLoggingInRef.current = false;
      }
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, initializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
