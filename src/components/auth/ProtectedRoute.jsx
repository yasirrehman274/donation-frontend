import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../ui/Loader';

const roleHome = (role) => (role === 'admin' ? '/admin/dashboard' : '/member/dashboard');

export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <Loader />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (role && user && user.role !== role) {
    return <Navigate to={roleHome(user.role)} replace />;
  }
  return children;
}
