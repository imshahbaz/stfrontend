import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { login as loginRequest, fetchCurrentUser } from '../api/service';

const AuthContext = createContext(null);

/**
 * @param {import('../api/types').User} data
 */
function toStoredUser(data) {
  return {
    userId: data.userId,
    email: data.email,
    username: data.username,
    name: data.name,
    role: data.role,
    theme: data.theme,
    mobile: data.mobile,
    profile: data.profile,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('klikpanel_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [initializing, setInitializing] = useState(true);

  const applySession = useCallback((data) => {
    const normalized = toStoredUser(data);
    setUser(normalized);
    localStorage.setItem('klikpanel_user', JSON.stringify(normalized));
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const userData = await fetchCurrentUser();
        if (!active) return;
        if (userData.role === 'ADMIN') {
          applySession(userData);
        } else {
          setUser(null);
          localStorage.removeItem('klikpanel_user');
        }
      } catch {
        if (active) {
          setUser(null);
          localStorage.removeItem('klikpanel_user');
        }
      } finally {
        if (active) setInitializing(false);
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, [applySession]);

  const login = useCallback(
    async (email, password) => {
      const userData = await loginRequest({ email, password });
      if (userData.role !== 'ADMIN') {
        throw new Error('Only admin users can access this panel');
      }
      applySession(userData);
      return userData;
    },
    [applySession]
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('klikpanel_user');
  }, []);

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
