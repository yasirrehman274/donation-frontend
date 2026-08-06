import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar, { ADMIN_NAV_ITEMS } from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Loader from '../components/ui/Loader';
import { useData } from '../context/DataContext';

const TITLES = {
  dashboard: 'Dashboard',
  donations: 'Manage Donations',
  donors: 'Donors List',
  expenses: 'Manage Expenses',
  loans: 'Manage Loans',
  repayments: 'Loan Repayments',
  reports: 'Reports & Analytics',
  settings: 'Settings',
  surplus: 'Surplus Management',
  members: 'Manage Members',
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading } = useData();
  const location = useLocation();

  const segment = location.pathname.split('/')[2] || 'dashboard';
  const title = TITLES[segment] || 'Dashboard';

  if (loading) return <Loader />;

  return (
    <>
      <Sidebar
        items={ADMIN_NAV_ITEMS}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="main-content md:ml-64 min-h-screen transition-all">
        <Topbar title={title} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} showNotifications />
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </>
  );
}
