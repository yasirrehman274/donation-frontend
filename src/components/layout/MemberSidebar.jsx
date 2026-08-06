import React from 'react';
import Sidebar, { MEMBER_NAV_ITEMS } from './Sidebar';
import LogoutButton from '../ui/LogoutButton';

export default function MemberSidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <Sidebar
      items={MEMBER_NAV_ITEMS}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      footer={<LogoutButton variant="sidebar" className="w-full text-left" />}
    />
  );
}
