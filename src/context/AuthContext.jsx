import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadAuth, saveAuth, clearAuth, persistUser } from '../utils/authStorage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Decodes the JWT payload (client-side) to detect an already-expired token on
// app load or while idle, so protected routes never stay accessible after the
// session expires. Signature is verified by the backend on the next API call.
const isTokenExpired = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload && typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [state, setState] = useState({ token: null, user: null, initializing: true });

  const resetSession = useCallback(() => {
    clearAuth();
    setState((prev) =>
      prev.token === null && prev.user === null
        ? prev
        : { token: null, user: null, initializing: false }
    );
    navigate('/login', { replace: true });
  }, [navigate]);

  const handleExpired = useCallback(() => {
    clearAuth();
    setState((prev) =>
      prev.token ? { token: null, user: null, initializing: false } : prev
    );
    navigate('/login', { replace: true });
  }, [navigate]);

  const checkSessionExpiry = useCallback(() => {
    const { token } = loadAuth();
    if (token && isTokenExpired(token)) handleExpired();
  }, [handleExpired]);

  useEffect(() => {
    const { token, user } = loadAuth();

    if (token && isTokenExpired(token)) {
      handleExpired();
    } else {
      setState({ token, user, initializing: false });
    }

    const onUnauthorized = () => resetSession();
    window.addEventListener('auth:logout', onUnauthorized);
    return () => window.removeEventListener('auth:logout', onUnauthorized);
  }, [handleExpired, resetSession]);

  // Proactively log out once the token expires, even while idle or in the
  // background, so protected pages cannot remain accessible after expiry.
  useEffect(() => {
    const interval = setInterval(checkSessionExpiry, 60 * 1000);
    const onFocus = () => checkSessionExpiry();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [checkSessionExpiry]);

  const login = useCallback((token, user, remember = true) => {
    saveAuth({ token, user }, remember);
    setState({ token, user, initializing: false });
  }, []);

  const logout = useCallback(() => {
    resetSession();
  }, [resetSession]);

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
