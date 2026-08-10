import React from 'react';
import { useAuth } from '../../context/AuthContext';

const VARIANTS = {
  sidebar: 'text-white/70 hover:bg-white/10 hover:text-white',
  topbar: 'text-dark hover:bg-red-50 hover:text-danger',
};

export default function LogoutButton({ variant = 'topbar', className = '' }) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <button
      onClick={handleLogout}
      className={`inline-flex items-center gap-2 rounded-lg font-semibold transition-all text-sm px-4 py-2 ${VARIANTS[variant]} ${className}`}
    >
      <i className="fas fa-sign-out-alt"></i> Logout
    </button>
  );
}
