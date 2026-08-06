import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { loadAuth, saveAuth, clearAuth, persistUser } from '../utils/authStorage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({ token: null, user: null, initializing: true });

  useEffect(() => {
    const { token, user } = loadAuth();
    setState({ token, user, initializing: false });

    const onUnauthorized = () => {
      setState({ token: null, user: null, initializing: false });
    };
    window.addEventListener('auth:logout', onUnauthorized);
    return () => window.removeEventListener('auth:logout', onUnauthorized);
  }, []);

  const login = useCallback((token, user, remember = true) => {
    saveAuth({ token, user }, remember);
    setState({ token, user, initializing: false });
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setState({ token: null, user: null, initializing: false });
  }, []);

  const updateUser = useCallback((updates) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const user = { ...prev.user, ...updates };
      persistUser(user);
      return { ...prev, user };
    });
  }, []);

  const value = useMemo(
    () => ({
      token: state.token,
      user: state.user,
      role: state.user ? state.user.role : null,
      isAuthenticated: !!state.token,
      initializing: state.initializing,
      login,
      logout,
      updateUser,
    }),
    [state, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
