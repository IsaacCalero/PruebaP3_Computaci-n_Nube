import { createContext, useContext, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('gf_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('gf_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gf_user');
    }
  }, [user]);

  async function login(username, password) {
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/auth/login', { username, password });
      localStorage.setItem('gf_token', data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await axiosClient.post('/auth/logout');
    } catch {
      // Si el token ya expiro no importa: igual limpiamos la sesion local.
    }
    localStorage.removeItem('gf_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
