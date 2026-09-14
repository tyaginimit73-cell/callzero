import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (identifier, password) => {
    const { data } = await api.post('/auth/login', { identifier, password });
    setUser(data.data.user);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setUser(data.data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((u) => (u ? { ...u, ...patch } : u));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, ready, login, register, logout, refresh, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
