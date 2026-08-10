import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicOnly from './components/auth/PublicOnly';
import RootRedirect from './components/auth/RootRedirect';
import NavigationProgress from './components/ui/NavigationProgress';
import Loader from './components/ui/Loader';
import AdminLayout from './layouts/AdminLayout';
import MemberLayout from './layouts/MemberLayout';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Donations = lazy(() => import('./pages/Donations'));
const Donors = lazy(() => import('./pages/Donors'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Loans = lazy(() => import('./pages/Loans'));
const Repayments = lazy(() => import('./pages/Repayments'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const Surplus = lazy(() => import('./pages/Surplus'));
const Members = lazy(() => import('./pages/Members'));
const MemberDashboard = lazy(() => import('./pages/member/MemberDashboard'));
const AddDonation = lazy(() => import('./pages/member/AddDonation'));
const MyDonations = lazy(() => import('./pages/member/MyDonations'));
const MyProfile = lazy(() => import('./pages/member/MyProfile'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <AuthProvider>
      <NavigationProgress />
      <Suspense fallback={<Loader />}>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
