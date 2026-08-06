import React from 'react';
import LogoutButton from '../ui/LogoutButton';
import NotificationBell from '../notification/NotificationBell';

export default function Topbar({ title, onMenuToggle, showLogout = true, showNotifications = false }) {
  const currentDate = new Date().toLocaleDateString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="no-print h-[60px] bg-white shadow-card flex items-center px-6 gap-5 sticky top-0 z-[500]">
      <button onClick={onMenuToggle} className="text-xl text-dark md:hidden">
        <i className="fas fa-bars"></i>
      </button>
      <h1 className="text-xl font-semibold text-dark">{title}</h1>
      <span className="ml-auto text-xs text-gray-500 font-medium hidden sm:block">{currentDate}</span>
      {showNotifications && <NotificationBell />}
      {showLogout && <LogoutButton />}
    </div>
  );
}
