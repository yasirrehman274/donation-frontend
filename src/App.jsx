import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Notification from './components/ui/Notification';
import Loader from './components/ui/Loader';
import Dashboard from './pages/Dashboard';
import Donations from './pages/Donations';
import Donors from './pages/Donors';
import Expenses from './pages/Expenses';
import Loans from './pages/Loans';
import Repayments from './pages/Repayments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const PAGE_TITLES = {
  dashboard: 'Dashboard', donations: 'Manage Donations', donors: 'Donors List',
  expenses: 'Manage Expenses', loans: 'Manage Loans', repayments: 'Loan Repayments',
  reports: 'Reports & Analytics', settings: 'Settings',
};

const PAGES = {
  dashboard: Dashboard, donations: Donations, donors: Donors, expenses: Expenses,
  loans: Loans, repayments: Repayments, reports: Reports, settings: Settings,
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notification, loading } = useData();

  if (loading) return <Loader />;

  const PageComponent = PAGES[currentPage] || Dashboard;

  return (
    <>
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="main-content md:ml-64 min-h-screen transition-all">
        <Topbar title={PAGE_TITLES[currentPage]} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="p-6">
          <PageComponent />
        </div>
      </div>
      <Notification notification={notification} />
    </>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
