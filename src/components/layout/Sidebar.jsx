import React from 'react';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
  { key: 'donations', label: 'Donations', icon: 'fa-donate' },
  { key: 'surplus', label: 'Surplus', icon: 'fa-coins' },
  { key: 'donors', label: 'Donors', icon: 'fa-users' },
  { key: 'expenses', label: 'Expenses', icon: 'fa-money-bill-wave' },
  { key: 'loans', label: 'Loans', icon: 'fa-handshake' },
  { key: 'repayments', label: 'Loan Repayments', icon: 'fa-undo' },
  { key: 'reports', label: 'Reports', icon: 'fa-chart-bar' },
  { key: 'settings', label: 'Settings', icon: 'fa-cog' },
  
];

export default function Sidebar({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen }) {
  return (
    <div
      className={`no-print fixed top-0 h-screen w-64 bg-gradient-to-b from-dark to-[#162447] text-white z-[1000] transition-all overflow-y-auto ${
        sidebarOpen ? 'left-0' : '-left-64'
      } md:left-0`}
    >
      <div className="p-5 flex items-center gap-3 border-b border-white/10">
        <i className="fas fa-hand-holding-heart text-3xl text-warning"></i>
        <h2 className="text-xl font-bold">DonationMS</h2>
      </div>
      <nav className="py-4">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.key}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(item.key);
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all border-l-4 ${
              currentPage === item.key
                ? 'bg-white/10 text-white border-warning'
                : 'text-white/70 border-transparent hover:bg-white/5 hover:text-white hover:border-warning'
            }`}
          >
            <i className={`fas ${item.icon} w-5 text-center`}></i>
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
