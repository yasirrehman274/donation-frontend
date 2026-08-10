import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const ADMIN_NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt', path: '/admin/dashboard' },
  { key: 'donations', label: 'Donations', icon: 'fa-donate', path: '/admin/donations' },
  { key: 'surplus', label: 'Surplus', icon: 'fa-coins', path: '/admin/surplus' },
  { key: 'donors', label: 'Donors', icon: 'fa-users', path: '/admin/donors' },
  { key: 'expenses', label: 'Expenses', icon: 'fa-money-bill-wave', path: '/admin/expenses' },
  { key: 'loans', label: 'Loans', icon: 'fa-handshake', path: '/admin/loans' },
  { key: 'repayments', label: 'Loan Repayments', icon: 'fa-undo', path: '/admin/repayments' },
  { key: 'reports', label: 'Reports', icon: 'fa-chart-bar', path: '/admin/reports' },
  { key: 'members', label: 'Members', icon: 'fa-id-badge', path: '/admin/members' },
  { key: 'settings', label: 'Settings', icon: 'fa-cog', path: '/admin/settings' },
];

export const MEMBER_NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt', path: '/member/dashboard' },
  { key: 'donations', label: 'My Donations', icon: 'fa-donate', path: '/member/donations' },
  { key: 'profile', label: 'My Profile', icon: 'fa-user', path: '/member/profile' },
];

export default function Sidebar({ items, sidebarOpen, setSidebarOpen, footer }) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeItem = items.find((item) => location.pathname.startsWith(item.path));

  const goTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div
      className={`no-print fixed top-0 h-screen w-64 bg-gradient-to-b from-dark to-[#162447] text-white z-[1000] transition-all overflow-y-auto flex flex-col ${
        sidebarOpen ? 'left-0' : '-left-64'
      } md:left-0`}
    >
      <div className="p-5 flex items-center gap-3 border-b border-white/10">
        <i className="fas fa-hand-holding-heart text-3xl text-warning"></i>
        <h2 className="text-xl font-bold">Family Support</h2>
      </div>
      <nav className="py-4 flex-1">
        {items.map((item) => (
          <a
            key={item.key}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              goTo(item.path);
            }}
            className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all border-l-4 ${
              activeItem && activeItem.key === item.key
                ? 'bg-white/10 text-white border-warning'
                : 'text-white/70 border-transparent hover:bg-white/5 hover:text-white hover:border-warning'
            }`}
          >
            <i className={`fas ${item.icon} w-5 text-center`}></i>
            {item.label}
          </a>
        ))}
      </nav>
      {footer && <div className="p-4 border-t border-white/10">{footer}</div>}
    </div>
  );
}
