import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../ui/Loader';

const roleHome = (role) => (role === 'admin' ? '/admin/dashboard' : '/member/dashboard');

export default function PublicOnly({ children }) {
  const { isAuthenticated, user, initializing } = useAuth();

  if (initializing) return <Loader />;
  if (isAuthenticated && user) {
    return <Navigate to={roleHome(user.role)} replace />;
  }
  return children;
}
