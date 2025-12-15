// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { alertError } from '../utils/alert';

const AuthContext = createContext();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};

// Cambia esto para 20 minutos después (ahora solo 1 min):
const INACTIVITY_LIMIT =20 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('tasklist_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('tasklist_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('tasklist_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tasklist_user');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('tasklist_user', JSON.stringify(userData));
  };

  // --- INACTIVIDAD ---
  useEffect(() => {
    let timeout;
    const resetTimeout = () => {
      clearTimeout(timeout);
      if (user) {
        timeout = setTimeout(() => {
          sessionStorage.setItem('logout_reason', 'inactividad');
          logout();
        }, INACTIVITY_LIMIT);
      }
    };
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimeout));
    resetTimeout();
    return () => {
      clearTimeout(timeout);
      events.forEach(event => window.removeEventListener(event, resetTimeout));
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};