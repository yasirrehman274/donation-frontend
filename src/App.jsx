import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicOnly from './components/auth/PublicOnly';
import RootRedirect from './components/auth/RootRedirect';
import AdminLayout from './layouts/AdminLayout';
import MemberLayout from './layouts/MemberLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Donations from './pages/Donations';
import Donors from './pages/Donors';
import Expenses from './pages/Expenses';
import Loans from './pages/Loans';
import Repayments from './pages/Repayments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Surplus from './pages/Surplus';
import Members from './pages/Members';
import MemberDashboard from './pages/member/MemberDashboard';
import AddDonation from './pages/member/AddDonation';
import MyDonations from './pages/member/MyDonations';
import MyProfile from './pages/member/MyProfile';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <DataProvider>
                <NotificationProvider>
                  <AdminLayout />
                </NotificationProvider>
              </DataProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="donations" element={<Donations />} />
          <Route path="donors" element={<Donors />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="surplus" element={<Surplus />} />
          <Route path="loans" element={<Loans />} />
          <Route path="repayments" element={<Repayments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="members" element={<Members />} />
        </Route>

        <Route
          path="/member"
          element={
            <ProtectedRoute role="member">
              <DataProvider>
                <MemberLayout />
              </DataProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MemberDashboard />} />
          <Route path="donations" element={<MyDonations />} />
          <Route path="add-donation" element={<AddDonation />} />
          <Route path="profile" element={<MyProfile />} />
        </Route>

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
