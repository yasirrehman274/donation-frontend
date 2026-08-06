import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MemberSidebar from '../components/layout/MemberSidebar';
import Topbar from '../components/layout/Topbar';
import Loader from '../components/ui/Loader';
import { useData } from '../context/DataContext';

const TITLES = {
  dashboard: 'Member Dashboard',
  donations: 'My Donations',
  'add-donation': 'Add Donation',
  profile: 'My Profile',
};

export default function MemberLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading } = useData();
  const location = useLocation();

  const segment = location.pathname.split('/')[2] || 'dashboard';
  const title = TITLES[segment] || 'Member Dashboard';

  if (loading) return <Loader />;

  return (
    <>
      <MemberSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content md:ml-64 min-h-screen transition-all">
        <Topbar title={title} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} showLogout={false} />
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </>
  );
}
